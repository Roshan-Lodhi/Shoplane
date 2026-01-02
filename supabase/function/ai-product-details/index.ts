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
    const { product, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let prompt = '';
    let toolConfig = {};

    if (type === 'specifications') {
      prompt = `Generate detailed product specifications for this product:
Name: ${product.name}
Brand: ${product.brand}
Category: ${product.category}
Description: ${product.description}
Is Accessory: ${product.isAccessory}

Generate realistic, detailed specifications including:
- Material composition
- Care instructions
- Dimensions/measurements (if applicable)
- Country of origin
- Special features
- Warranty information`;

      toolConfig = {
        tools: [{
          type: "function",
          function: {
            name: "generate_specifications",
            description: "Generate product specifications",
            parameters: {
              type: "object",
              properties: {
                specifications: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      label: { type: "string" },
                      value: { type: "string" }
                    },
                    required: ["label", "value"]
                  }
                }
              },
              required: ["specifications"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_specifications" } }
      };
    } else if (type === 'faqs') {
      prompt = `Generate 5 frequently asked questions and answers for this product:
Name: ${product.name}
Brand: ${product.brand}
Category: ${product.category}
Description: ${product.description}
Price: ₹${product.price}

Create helpful, realistic FAQs that customers would typically ask about this type of product.`;

      toolConfig = {
        tools: [{
          type: "function",
          function: {
            name: "generate_faqs",
            description: "Generate product FAQs",
            parameters: {
              type: "object",
              properties: {
                faqs: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      answer: { type: "string" }
                    },
                    required: ["question", "answer"]
                  }
                }
              },
              required: ["faqs"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_faqs" } }
      };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a product content specialist. Generate accurate, helpful product information." },
          { role: "user", content: prompt }
        ],
        ...toolConfig
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

    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("Error in ai-product-details:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
