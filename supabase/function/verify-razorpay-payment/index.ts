import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature }: VerifyPaymentRequest = await req.json();
    
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    if (!keySecret) {
      throw new Error("Razorpay key secret not configured");
    }

    // Verify signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keySecret);
    const messageData = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const generatedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Use timing-safe comparison
    const generatedBuffer = encoder.encode(generatedSignature);
    const providedBuffer = encoder.encode(razorpay_signature);
    
    let isValid = false;
    if (generatedBuffer.length === providedBuffer.length) {
      isValid = crypto.subtle.timingSafeEqual(generatedBuffer.buffer, providedBuffer.buffer);
    }

    console.log("Payment verification:", { 
      isValid, 
      razorpay_payment_id,
      razorpay_order_id 
    });

    return new Response(
      JSON.stringify({ 
        success: isValid,
        payment_id: razorpay_payment_id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-razorpay-payment:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
