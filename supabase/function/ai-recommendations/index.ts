import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentProduct, viewedProducts, cartItems, userPreferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `You are a smart e-commerce recommendation engine. Based on the following user data, suggest 4 product recommendations with reasoning.

Current Product Being Viewed:
${JSON.stringify(currentProduct, null, 2)}

Recently Viewed Products (last 10):
${JSON.stringify(viewedProducts || [], null, 2)}

Items in Cart:
${JSON.stringify(cartItems || [], null, 2)}

User Preferences:
${JSON.stringify(userPreferences || {}, null, 2)}

Analyze the user's browsing pattern, style preferences, and shopping behavior. Return a JSON object with:
1. recommendedProductIds: array of 4 product IDs that would complement their interests
2. reasoning: brief explanation of why these products were recommended
3. personalizationScore: 0-100 indicating how confident you are in these recommendations

Consider:
- Similar styles and brands
- Complementary items (e.g., belt with pants, watch with formal wear)
- Price range preferences
- Category interests (clothing, shoes, accessories)
- Gender preferences`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an AI recommendation engine. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_products",
              description: "Return product recommendations based on user behavior",
              parameters: {
                type: "object",
                properties: {
                  recommendedProductIds: {
                    type: "array",
                    items: { type: "number" },
                    description: "Array of 4 recommended product IDs"
                  },
                  reasoning: {
                    type: "string",
                    description: "Brief explanation of recommendations"
                  },
                  personalizationScore: {
                    type: "number",
                    description: "Confidence score 0-100"
                  }
                },
                required: ["recommendedProductIds", "reasoning", "personalizationScore"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "recommend_products" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback to content parsing
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return new Response(jsonMatch[0], {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("Error in ai-recommendations:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
