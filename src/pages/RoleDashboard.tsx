import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSupplyChain } from '@/context/SupplyChainContext';
import { BatchCard } from '@/components/BatchCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ROLE_CONFIG, UserRole } from '@/lib/supply-chain-types';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Truck, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RoleDashboardProps {
  role: UserRole;
}

export default function RoleDashboard({ role }: RoleDashboardProps) {
  const { batches, addUpdate, advanceStage, acceptBatch, updateBatchStatus, loading } = useSupplyChain();
  const config = ROLE_CONFIG[role];
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [actionForm, setActionForm] = useState({ action: '', details: '', location: '', handler: '' });
  const [supplierName, setSupplierName] = useState('');

  // Supplier-specific sections
  const availableBatches = batches.filter(b => b.status === 'created' && b.currentStage === 'farmer');
  const myDeliveries = batches.filter(b => b.assignedSupplier === supplierName && supplierName.trim() !== '');

  // Generic: batches relevant to this role
  const relevantBatches = batches.filter(b => b.currentStage === role || b.updates.some(u => u.stage === role));

  const handleAction = async () => {
    if (!selectedBatch || !actionForm.action) return;
    await addUpdate(selectedBatch, {
      batchId: selectedBatch,
      stage: role,
      action: actionForm.action,
      details: actionForm.details,
      location: actionForm.location,
      handler: actionForm.handler,
    });
    setActionForm({ action: '', details: '', location: '', handler: '' });
    setActionOpen(false);
    toast.success('Update recorded');
  };

  const handleAdvance = async (batchId: string) => {
    await advanceStage(batchId);
    toast.success('Stage advanced');
  };

  const handleAccept = async (batchId: string) => {
    if (!supplierName.trim()) {
      toast.error('Enter your supplier name first');
      return;
    }
    await acceptBatch(batchId, supplierName.trim());
    toast.success('Batch accepted!');
  };

  const handleStatusUpdate = async (batchId: string, status: 'in_transit' | 'delivered') => {
    await updateBatchStatus(batchId, status);
    if (status === 'delivered') {
      await advanceStage(batchId);
    }
    toast.success(`Status updated to ${status.replace('_', ' ')}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Supplier role gets a special layout
  if (role === 'supplier') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{config.icon} {config.label} Dashboard</h1>
          <p className="text-muted-foreground">Accept and manage batch deliveries</p>
        </div>

        {/* Supplier identity */}
        <div className="bg-card border border-border rounded-xl p-4">
          <Label className="text-sm font-medium">Your Supplier / Transport Name</Label>
          <Input
            placeholder="e.g. TransCo Logistics"
            value={supplierName}
            onChange={e => setSupplierName(e.target.value)}
            className="mt-2 max-w-sm"
          />
        </div>

        {/* Available Batches */}
        <section>
          <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Available Batches
          </h2>
          {availableBatches.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No batches available for pickup right now.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableBatches.map((batch, i) => (
                <motion.div
                  key={batch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-xl p-5 shadow-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-display font-bold text-foreground">{batch.cropName}</h3>
                      <p className="text-sm text-muted-foreground">{batch.variety}</p>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">{batch.id}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span>📦 {batch.quantity} {batch.unit}</span>
                    <span>📍 {batch.farmLocation}</span>
                    <span>🌾 {batch.farmerName}</span>
                  </div>
                  <Button size="sm" onClick={() => handleAccept(batch.id)} className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" /> Accept Batch
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* My Deliveries */}
        <section>
          <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" /> My Deliveries
          </h2>
          {!supplierName.trim() ? (
            <p className="text-muted-foreground text-sm py-4">Enter your supplier name above to see your deliveries.</p>
          ) : myDeliveries.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No deliveries assigned to you yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myDeliveries.map((batch, i) => (
                <motion.div
                  key={batch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-xl p-5 shadow-card space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-bold text-foreground">{batch.cropName}</h3>
                      <p className="text-sm text-muted-foreground">{batch.variety} • {batch.quantity} {batch.unit}</p>
                    </div>
                    <Badge variant="secondary" className="capitalize">{batch.status.replace('_', ' ')}</Badge>
                  </div>
                  <div className="flex gap-2">
                    {batch.status === 'picked_up' && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(batch.id, 'in_transit')} className="flex-1">
                        🚛 Mark In Transit
                      </Button>
                    )}
                    {(batch.status === 'picked_up' || batch.status === 'in_transit') && (
                      <Button size="sm" onClick={() => handleStatusUpdate(batch.id, 'delivered')} className="flex-1">
                        ✅ Mark Delivered
                      </Button>
                    )}
                  </div>
                  <BatchCard batch={batch} index={i} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // Generic role dashboard (farmer batches handled separately, distributor/retailer/consumer)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{config.icon} {config.label} Dashboard</h1>
          <p className="text-muted-foreground">Manage batches at your stage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relevantBatches.map((batch, i) => (
          <div key={batch.id} className="space-y-2">
            <BatchCard batch={batch} index={i} />
            {batch.currentStage === role && (
              <div className="flex gap-2">
                <Dialog open={actionOpen && selectedBatch === batch.id} onOpenChange={(o) => { setActionOpen(o); if (o) setSelectedBatch(batch.id); }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">Add Update</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle className="font-display">Record Action</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Action</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={actionForm.action}
                          onChange={e => setActionForm(prev => ({ ...prev, action: e.target.value }))}
                        >
                          <option value="">Select action...</option>
                          {config.actions.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Details</Label>
                        <Textarea placeholder="Describe the action..." value={actionForm.details} onChange={e => setActionForm(prev => ({ ...prev, details: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Location</Label>
                        <Input placeholder="Location" value={actionForm.location} onChange={e => setActionForm(prev => ({ ...prev, location: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Handler</Label>
                        <Input placeholder="Your name / org" value={actionForm.handler} onChange={e => setActionForm(prev => ({ ...prev, handler: e.target.value }))} />
                      </div>
                      <Button onClick={handleAction}>Submit Update</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="sm" onClick={() => handleAdvance(batch.id)}>
                  Advance Stage →
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {relevantBatches.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-4">{config.icon}</p>
          <p className="font-display font-semibold">No batches at this stage</p>
          <p className="text-sm">Batches will appear here when they reach your stage</p>
        </motion.div>
      )}
    </div>
  );
}
