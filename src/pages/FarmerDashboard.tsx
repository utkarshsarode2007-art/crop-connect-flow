import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSupplyChain } from '@/context/SupplyChainContext';
import { BatchCard } from '@/components/BatchCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FarmerDashboard() {
  const { batches, createBatch, loading } = useSupplyChain();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ cropName: '', variety: '', quantity: '', unit: 'kg', farmLocation: '', farmerName: '', harvestDate: '' });

  const farmerBatches = batches.filter(b => b.currentStage === 'farmer' || b.farmerName);

  const handleCreate = async () => {
    if (!form.cropName || !form.farmerName) return;
    setSubmitting(true);
    try {
      const batch = await createBatch(form);
      toast.success(`Batch ${batch.id} created!`);
      setForm({ cropName: '', variety: '', quantity: '', unit: 'kg', farmLocation: '', farmerName: '', harvestDate: '' });
      setOpen(false);
    } catch {
      toast.error('Failed to create batch');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">🌾 Farmer Dashboard</h1>
          <p className="text-muted-foreground">Register and manage your crop batches</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Register Crop</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Register New Crop Batch</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              {[
                { label: 'Crop Name', key: 'cropName', placeholder: 'e.g. Organic Wheat' },
                { label: 'Variety', key: 'variety', placeholder: 'e.g. Hard Red Winter' },
                { label: 'Quantity (kg)', key: 'quantity', placeholder: 'e.g. 2500' },
                { label: 'Farm Location', key: 'farmLocation', placeholder: 'e.g. Punjab, India' },
                { label: 'Farmer Name', key: 'farmerName', placeholder: 'Your name' },
              ].map(({ label, key, placeholder }) => (
                <div key={key} className="grid gap-2">
                  <Label>{label}</Label>
                  <Input
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="grid gap-2">
                <Label>Harvest Date</Label>
                <Input type="date" value={form.harvestDate} onChange={e => setForm(prev => ({ ...prev, harvestDate: e.target.value }))} />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Generate Batch ID & Register
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {farmerBatches.map((batch, i) => (
          <BatchCard key={batch.id} batch={batch} index={i} />
        ))}
      </div>

      {farmerBatches.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-4">🌱</p>
          <p className="font-display font-semibold">No batches yet</p>
          <p className="text-sm">Register your first crop to get started</p>
        </motion.div>
      )}
    </div>
  );
}
