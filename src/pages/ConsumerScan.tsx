import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSupplyChain } from '@/context/SupplyChainContext';
import { SupplyChainFlow } from '@/components/SupplyChainFlow';
import { BatchTimeline } from '@/components/BatchTimeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function ConsumerScan() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { getBatch } = useSupplyChain();
  const batch = getBatch(batchId || '');

  if (!batch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="font-display font-bold text-xl text-foreground">Product Not Found</h2>
          <p className="text-muted-foreground mt-2">This QR code does not match any registered batch.</p>
          <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-primary text-lg">Verified Product</span>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <h1 className="text-2xl font-display font-bold text-foreground">{batch.cropName}</h1>
            <p className="text-muted-foreground">{batch.variety}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="font-mono text-xs">{batch.id}</Badge>
              <Badge variant="secondary">📦 {batch.quantity} {batch.unit}</Badge>
              <Badge variant="secondary">🌾 {batch.farmerName}</Badge>
              <Badge variant="secondary">📍 {batch.farmLocation}</Badge>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="font-display font-semibold text-foreground mb-3">Supply Chain Progress</h2>
          <SupplyChainFlow currentStage={batch.currentStage} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h2 className="font-display font-semibold text-foreground mb-3">Full Journey</h2>
          <BatchTimeline updates={batch.updates} />
        </motion.div>

        <Button variant="outline" onClick={() => navigate('/')} className="w-full">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Platform
        </Button>
      </div>
    </div>
  );
}
