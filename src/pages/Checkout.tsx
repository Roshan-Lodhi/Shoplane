import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const { cart, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const appliedDiscount = location.state?.appliedDiscount || null;
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const finalTotal = appliedDiscount 
    ? totalAmount - appliedDiscount.amount 
    : totalAmount;

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Fetch the Razorpay key from backend
      const { data: keyData, error: keyError } = await supabase.functions.invoke('get-razorpay-key');
      
      if (keyError || !keyData?.key) {
        toast.error("Failed to initialize payment. Please try again.");
        setIsProcessing(false);
        return;
      }
      
      const RAZORPAY_KEY_ID = keyData.key;

      // Create Razorpay order with final total
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: finalTotal,
          currency: "INR",
        },
      });

      if (orderError || !orderData?.orderId) {
        toast.error("Failed to create order. Please try again.");
        setIsProcessing(false);
        return;
      }
      
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount, // Amount in paise from order
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "SHOPLANE",
        description: "Purchase Order",
        image: "/favicon.ico",
        handler: async function (response: any) {
          try {
            // Verify payment
            const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (error) throw error;

            if (data.success) {
              // Save order to database
              const { data: { user } } = await supabase.auth.getUser();
              
              if (user) {
                const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
                
                const { error: orderError } = await supabase
                  .from('orders')
                  .insert([{
                    user_id: user.id,
                    order_number: orderNumber,
                    total_amount: finalTotal,
                    status: 'processing',
                    items: cart as any,
                    shipping_address: formData as any,
                    payment_id: response.razorpay_payment_id,
                    discount_code: appliedDiscount?.code || null,
                    discount_amount: appliedDiscount?.amount || 0,
                  }]);

                if (orderError) {
                  console.error('Error saving order:', orderError);
                }

                // Increment discount code usage if applied
                if (appliedDiscount) {
                  const { data: discountData } = await supabase
                    .from('discount_codes')
                    .select('current_uses')
                    .eq('code', appliedDiscount.code)
                    .single();

                  if (discountData) {
                    await supabase
                      .from('discount_codes')
                      .update({ current_uses: discountData.current_uses + 1 })
                      .eq('code', appliedDiscount.code);
                  }
                }
              }

              clearCart();
              toast.success("Payment successful!");
              navigate("/order-confirmed");
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: formData.address,
        },
        theme: {
          color: "#10b981",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        toast.error("Payment failed: " + response.error.description);
      });
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRazorpayPayment();
  };

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 1234567890"
                />
              </div>

              <div>
                <Label htmlFor="address">Shipping Address</Label>
                <Input
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State, PIN"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} × {item.count}
                  </span>
                  <span className="font-semibold">
                    ₹{(item.price * item.count).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">₹{totalAmount.toLocaleString()}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedDiscount.code})</span>
                  <span>-₹{appliedDiscount.amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-2xl font-bold text-primary">
                  ₹{finalTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full" 
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Pay with Razorpay"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
