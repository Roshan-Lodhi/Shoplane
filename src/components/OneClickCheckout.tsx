import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, MapPin, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface SavedAddress {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface OneClickCheckoutProps {
  appliedDiscount?: { code: string; amount: number } | null;
}

const OneClickCheckout = ({ appliedDiscount }: OneClickCheckoutProps) => {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { cart, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const [newAddress, setNewAddress] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const finalTotal = appliedDiscount 
    ? totalAmount - appliedDiscount.amount 
    : totalAmount;

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('saved_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    if (!error && data) {
      setAddresses(data as SavedAddress[]);
      const defaultAddress = data.find(a => a.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (data.length > 0) {
        setSelectedAddressId(data[0].id);
      }
    }
  };

  const handleAddAddress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login to save address");
      return;
    }

    const { error } = await supabase
      .from('saved_addresses')
      .insert([{
        user_id: user.id,
        ...newAddress,
        is_default: addresses.length === 0,
      }]);

    if (error) {
      toast.error("Failed to save address");
      return;
    }

    toast.success("Address saved!");
    setIsAddingAddress(false);
    setNewAddress({
      full_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });
    fetchAddresses();
  };

  const handleOneClickCheckout = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    if (!selectedAddress) return;

    setIsProcessing(true);

    try {
      const { data: keyData, error: keyError } = await supabase.functions.invoke('get-razorpay-key');
      
      if (keyError || !keyData?.key) {
        toast.error("Failed to initialize payment");
        setIsProcessing(false);
        return;
      }

      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount: finalTotal, currency: "INR" },
      });

      if (orderError || !orderData?.orderId) {
        toast.error("Failed to create order");
        setIsProcessing(false);
        return;
      }

      const options = {
        key: keyData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "SHOPLANE",
        description: "One-Click Purchase",
        handler: async function (response: any) {
          try {
            const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });

            if (error) throw error;

            if (data.success) {
              const { data: { user } } = await supabase.auth.getUser();
              
              if (user) {
                const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
                
                await supabase.from('orders').insert([{
                  user_id: user.id,
                  order_number: orderNumber,
                  total_amount: finalTotal,
                  status: 'processing',
                  items: cart as any,
                  shipping_address: {
                    name: selectedAddress.full_name,
                    email: selectedAddress.email,
                    phone: selectedAddress.phone,
                    address: `${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`,
                  } as any,
                  payment_id: response.razorpay_payment_id,
                  discount_code: appliedDiscount?.code || null,
                  discount_amount: appliedDiscount?.amount || 0,
                }]);
              }

              clearCart();
              toast.success("Order placed successfully!");
              setDialogOpen(false);
              navigate("/order-confirmed");
            }
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: selectedAddress.full_name,
          email: selectedAddress.email,
          contact: selectedAddress.phone,
        },
        theme: { color: "#10b981" },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (addresses.length === 0 && !isAddingAddress) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full gap-2">
            <Zap className="h-4 w-4" />
            Set up One-Click Checkout
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Address for One-Click Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Full Name</Label>
                <Input 
                  value={newAddress.full_name}
                  onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={newAddress.email}
                  onChange={e => setNewAddress({ ...newAddress, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Phone</Label>
              <Input 
                value={newAddress.phone}
                onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input 
                value={newAddress.address}
                onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>City</Label>
                <Input 
                  value={newAddress.city}
                  onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                />
              </div>
              <div>
                <Label>State</Label>
                <Input 
                  value={newAddress.state}
                  onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                />
              </div>
              <div>
                <Label>Pincode</Label>
                <Input 
                  value={newAddress.pincode}
                  onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleAddAddress} className="w-full">
              Save & Enable One-Click Checkout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 bg-gradient-to-r from-primary to-emerald-500">
          <Zap className="h-4 w-4" />
          One-Click Checkout
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            One-Click Checkout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Select Delivery Address</Label>
            <RadioGroup value={selectedAddressId || ""} onValueChange={setSelectedAddressId}>
              {addresses.map(address => (
                <Card 
                  key={address.id} 
                  className={`p-3 cursor-pointer transition-all ${
                    selectedAddressId === address.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={address.id} id={address.id} />
                    <label htmlFor={address.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{address.full_name}</span>
                        {address.is_default && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {address.address}, {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-sm text-muted-foreground">{address.phone}</p>
                    </label>
                  </div>
                </Card>
              ))}
            </RadioGroup>
          </div>

          {isAddingAddress ? (
            <Card className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  placeholder="Full Name"
                  value={newAddress.full_name}
                  onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })}
                />
                <Input 
                  placeholder="Email"
                  value={newAddress.email}
                  onChange={e => setNewAddress({ ...newAddress, email: e.target.value })}
                />
              </div>
              <Input 
                placeholder="Phone"
                value={newAddress.phone}
                onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
              />
              <Input 
                placeholder="Address"
                value={newAddress.address}
                onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
              />
              <div className="grid grid-cols-3 gap-2">
                <Input 
                  placeholder="City"
                  value={newAddress.city}
                  onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                />
                <Input 
                  placeholder="State"
                  value={newAddress.state}
                  onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                />
                <Input 
                  placeholder="Pincode"
                  value={newAddress.pincode}
                  onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsAddingAddress(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddAddress} className="flex-1">
                  Save
                </Button>
              </div>
            </Card>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setIsAddingAddress(true)}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Address
            </Button>
          )}

          <div className="pt-4 border-t">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Total</span>
              <span className="text-primary">₹{finalTotal.toLocaleString()}</span>
            </div>
            <Button 
              onClick={handleOneClickCheckout} 
              className="w-full gap-2"
              disabled={isProcessing || !selectedAddressId}
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Pay Now - ₹{finalTotal.toLocaleString()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OneClickCheckout;
