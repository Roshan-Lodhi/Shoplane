import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  items: any[];
  shipping_address: any;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
}

const OrderTracking = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders((data as Order[]) || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />;
      case "processing":
        return <Package className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "delivered":
        return "default";
      case "shipped":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
        <p className="text-muted-foreground mb-6">
          You need to be signed in to view your orders
        </p>
        <Link to="/auth">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Tracking</h1>
        <p className="text-muted-foreground">
          View and track all your orders in one place
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Link to="/">
              <Button>Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Order #{order.order_number}
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Order Status Timeline */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-4">Order Status</h4>
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10" />
                    {["pending", "processing", "shipped", "delivered"].map((status, index) => {
                      const isActive = 
                        status === order.status ||
                        (status === "pending" && ["processing", "shipped", "delivered"].includes(order.status)) ||
                        (status === "processing" && ["shipped", "delivered"].includes(order.status)) ||
                        (status === "shipped" && order.status === "delivered");

                      return (
                        <div key={status} className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isActive ? getStatusColor(status) + " text-white" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {getStatusIcon(status)}
                          </div>
                          <span className="text-xs mt-2 capitalize">{status}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3">Items</h4>
                  <div className="space-y-3">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.preview}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.count} × ₹{item.price}
                            </p>
                          </div>
                        </div>
                        <div className="font-semibold">
                          ₹{(item.count * item.price).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold mb-2">Shipping Address</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>{order.shipping_address.name}</p>
                    <p>{order.shipping_address.address}</p>
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}
                    </p>
                    <p>Phone: {order.shipping_address.phone}</p>
                  </div>
                </div>

                {order.payment_id && (
                  <>
                    <Separator className="my-4" />
                    <div className="text-sm text-muted-foreground">
                      Payment ID: {order.payment_id}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
