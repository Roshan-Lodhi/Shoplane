-- Create saved_carts table for syncing carts across devices
CREATE TABLE public.saved_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cart_items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint on user_id (one cart per user)
CREATE UNIQUE INDEX idx_saved_carts_user_id ON public.saved_carts(user_id);

-- Enable RLS
ALTER TABLE public.saved_carts ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_carts
CREATE POLICY "Users can view their own cart"
ON public.saved_carts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart"
ON public.saved_carts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
ON public.saved_carts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart"
ON public.saved_carts FOR DELETE
USING (auth.uid() = user_id);

-- Create cart_alerts table for price drop/stock alerts
CREATE TABLE public.cart_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id INTEGER NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_drop', 'low_stock', 'back_in_stock')),
  original_price NUMERIC,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cart_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for cart_alerts
CREATE POLICY "Users can view their own alerts"
ON public.cart_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
ON public.cart_alerts FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
ON public.cart_alerts FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert alerts (service role)
CREATE POLICY "Service can insert alerts"
ON public.cart_alerts FOR INSERT
WITH CHECK (true);

-- Create saved_addresses table for one-click checkout
CREATE TABLE public.saved_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_addresses
CREATE POLICY "Users can view their own addresses"
ON public.saved_addresses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
ON public.saved_addresses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
ON public.saved_addresses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
ON public.saved_addresses FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at on saved_carts
CREATE TRIGGER update_saved_carts_updated_at
BEFORE UPDATE ON public.saved_carts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for updated_at on saved_addresses
CREATE TRIGGER update_saved_addresses_updated_at
BEFORE UPDATE ON public.saved_addresses
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();