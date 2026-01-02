import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, Tag, Cloud } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import OneClickCheckout from "@/components/OneClickCheckout";
import EMIOptions from "@/components/EMIOptions";
import { useAuth } from "@/contexts/AuthContext";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalItems, totalAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
    type: string;
  } | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) {
      toast.error("Please enter a discount code");
      return;
    }

    setIsApplyingDiscount(true);

    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('active', true)
        .single();

      if (error || !data) {
        toast.error("Invalid or expired discount code");
        setIsApplyingDiscount(false);
        return;
      }

      const now = new Date();
      const validFrom = new Date(data.valid_from);
      const validUntil = data.valid_until ? new Date(data.valid_until) : null;

      if (now < validFrom || (validUntil && now > validUntil)) {
        toast.error("This discount code is not currently valid");
        setIsApplyingDiscount(false);
        return;
      }

      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast.error("This discount code has reached its usage limit");
        setIsApplyingDiscount(false);
        return;
      }

      if (totalAmount < data.min_purchase_amount) {
        toast.error(`Minimum purchase of ₹${data.min_purchase_amount} required`);
        setIsApplyingDiscount(false);
        return;
      }

      let discountAmount = 0;
      if (data.discount_type === 'percentage') {
        discountAmount = (totalAmount * data.discount_value) / 100;
      } else {
        discountAmount = data.discount_value;
      }

      discountAmount = Math.min(discountAmount, totalAmount);

      setAppliedDiscount({
        code: data.code,
        amount: discountAmount,
        type: data.discount_type,
      });

      toast.success("Discount code applied successfully!");
    } catch (error) {
      console.error("Error applying discount:", error);
      toast.error("Failed to apply discount code");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    toast.success("Discount code removed");
  };

  const finalTotal = appliedDiscount 
    ? totalAmount - appliedDiscount.amount 
    : totalAmount;

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-6">
            Start shopping to add items to your cart
          </p>
          <Button asChild>
            <Link to="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Shopping Cart</h1>
          {user && (
            <Badge variant="outline" className="gap-1.5 py-1.5">
              <Cloud className="h-3.5 w-3.5 text-primary" />
              Synced
            </Badge>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-muted-foreground mb-4">
              Total Items: <span className="font-semibold">{totalItems}</span>
            </p>
            
            {cart.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.preview}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.brand}</p>
                    <p className="text-lg font-bold text-primary">
                      ₹{item.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.count - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold">
                        {item.count}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.count + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-20">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              {/* Discount Code Input */}
              <div className="mb-6">
                <Label className="text-sm mb-2 block">Have a discount code?</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    disabled={!!appliedDiscount}
                  />
                  {appliedDiscount ? (
                    <Button variant="outline" onClick={removeDiscount}>
                      Remove
                    </Button>
                  ) : (
                    <Button 
                      onClick={applyDiscountCode}
                      disabled={isApplyingDiscount}
                    >
                      <Tag className="h-4 w-4 mr-1" />
                      Apply
                    </Button>
                  )}
                </div>
                {appliedDiscount && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Code "{appliedDiscount.code}" applied
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-6">
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
                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* EMI & BNPL Options */}
              <div className="mb-6">
                <EMIOptions totalAmount={finalTotal} />
              </div>

              {/* One-Click Checkout for logged in users */}
              {user && (
                <div className="mb-4">
                  <OneClickCheckout appliedDiscount={appliedDiscount} />
                </div>
              )}

              <Button
                className="w-full mb-4"
                size="lg"
                variant={user ? "outline" : "default"}
                onClick={() => navigate("/checkout", { state: { appliedDiscount } })}
              >
                {user ? "Standard Checkout" : "Proceed to Checkout"}
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link to="/">Continue Shopping</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
