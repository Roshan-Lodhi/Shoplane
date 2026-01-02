import { useState, useEffect } from "react";
import { Bell, TrendingDown, AlertTriangle, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CartAlert {
  id: string;
  product_id: number;
  alert_type: 'price_drop' | 'low_stock' | 'back_in_stock';
  original_price: number | null;
  is_read: boolean;
  created_at: string;
  product?: {
    name: string;
    price: number;
    image_url: string | null;
  };
}

const CartAlerts = () => {
  const [alerts, setAlerts] = useState<CartAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('cart_alerts')
      .select(`
        *,
        products:product_id (
          name,
          price,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      const formattedAlerts = data.map(alert => ({
        ...alert,
        product: Array.isArray(alert.products) ? alert.products[0] : alert.products
      })) as CartAlert[];
      setAlerts(formattedAlerts);
      setUnreadCount(formattedAlerts.filter(a => !a.is_read).length);
    }
  };

  const markAsRead = async (alertId: string) => {
    await supabase
      .from('cart_alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    setAlerts(prev => 
      prev.map(a => a.id === alertId ? { ...a, is_read: true } : a)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const dismissAlert = async (alertId: string) => {
    await supabase
      .from('cart_alerts')
      .delete()
      .eq('id', alertId);

    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast.success("Alert dismissed");
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_drop':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'back_in_stock':
        return <Package className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertMessage = (alert: CartAlert) => {
    switch (alert.alert_type) {
      case 'price_drop':
        const savings = (alert.original_price || 0) - (alert.product?.price || 0);
        return `Price dropped by ₹${savings.toLocaleString()}!`;
      case 'low_stock':
        return 'Only a few left in stock!';
      case 'back_in_stock':
        return 'Back in stock!';
      default:
        return 'Cart update';
    }
  };

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'price_drop':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'low_stock':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'back_in_stock':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return '';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <h3 className="font-semibold">Cart Alerts</h3>
          <p className="text-xs text-muted-foreground">
            Price drops & stock notifications
          </p>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No alerts yet</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`p-3 border-b last:border-0 hover:bg-muted/50 transition-colors ${
                  !alert.is_read ? 'bg-primary/5' : ''
                }`}
                onClick={() => !alert.is_read && markAsRead(alert.id)}
              >
                <div className="flex gap-3">
                  {alert.product?.image_url && (
                    <img 
                      src={alert.product.image_url} 
                      alt={alert.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {getAlertIcon(alert.alert_type)}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getAlertBadgeColor(alert.alert_type)}`}
                        >
                          {alert.alert_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAlert(alert.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium truncate mt-1">
                      {alert.product?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getAlertMessage(alert)}
                    </p>
                    {alert.alert_type === 'price_drop' && alert.product && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs line-through text-muted-foreground">
                          ₹{alert.original_price?.toLocaleString()}
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          ₹{alert.product.price.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CartAlerts;
