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

interface RoleDashboardProps {
  role: UserRole;
}

export default function RoleDashboard({ role }: RoleDashboardProps) {
  const { batches, addUpdate, advanceStage } = useSupplyChain();
  const config = ROLE_CONFIG[role];
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [actionForm, setActionForm] = useState({ action: '', details: '', location: '', handler: '' });

  const relevantBatches = batches.filter(b => b.currentStage === role || b.updates.some(u => u.stage === role));

  const handleAction = () => {
    if (!selectedBatch || !actionForm.action) return;
    addUpdate(selectedBatch, {
      batchId: selectedBatch,
      stage: role,
      action: actionForm.action,
      details: actionForm.details,
      location: actionForm.location,
      handler: actionForm.handler,
    });
    setActionForm({ action: '', details: '', location: '', handler: '' });
    setActionOpen(false);
  };

  const handleAdvance = (batchId: string) => {
    advanceStage(batchId);
  };

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
