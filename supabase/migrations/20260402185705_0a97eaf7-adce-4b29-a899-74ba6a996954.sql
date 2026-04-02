
CREATE TYPE public.batch_status AS ENUM ('harvested', 'created', 'picked_up', 'in_transit', 'stored', 'delivered', 'processing');

CREATE TYPE public.supply_chain_stage AS ENUM ('farmer', 'supplier', 'distributor', 'retailer', 'consumer');

CREATE TABLE public.batches (
  id TEXT PRIMARY KEY,
  crop_name TEXT NOT NULL,
  variety TEXT,
  quantity TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  farm_location TEXT NOT NULL,
  farmer_name TEXT NOT NULL,
  harvest_date TEXT,
  current_stage supply_chain_stage NOT NULL DEFAULT 'farmer',
  status batch_status NOT NULL DEFAULT 'created',
  assigned_supplier TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.batches REPLICA IDENTITY FULL;

CREATE TABLE public.batch_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  stage supply_chain_stage NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  location TEXT,
  handler TEXT,
  temperature TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.batch_updates REPLICA IDENTITY FULL;

CREATE TABLE public.batch_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  from_stage supply_chain_stage NOT NULL,
  to_stage supply_chain_stage NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.batch_transactions REPLICA IDENTITY FULL;

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read batches" ON public.batches FOR SELECT USING (true);
CREATE POLICY "Anyone can insert batches" ON public.batches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update batches" ON public.batches FOR UPDATE USING (true);

CREATE POLICY "Anyone can read batch_updates" ON public.batch_updates FOR SELECT USING (true);
CREATE POLICY "Anyone can insert batch_updates" ON public.batch_updates FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read batch_transactions" ON public.batch_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert batch_transactions" ON public.batch_transactions FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_batches_updated_at
  BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.batches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_transactions;
