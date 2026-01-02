import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const OrderConfirmed = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6 inline-block">
          <CheckCircle className="h-24 w-24 text-green-500 mx-auto animate-in zoom-in duration-500" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Order Placed Successfully!
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Thank you for shopping with SHOPLANE. We've sent you an email with your order details and tracking information.
        </p>

        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link to="/">Continue Shopping</Link>
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Your order will be delivered within 5-7 business days
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmed;
