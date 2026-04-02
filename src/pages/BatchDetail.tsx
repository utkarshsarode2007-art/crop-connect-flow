import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSupplyChain } from '@/context/SupplyChainContext';
import { SupplyChainFlow } from '@/components/SupplyChainFlow';
import { BatchTimeline } from '@/components/BatchTimeline';
import { TransactionLog } from '@/components/TransactionLog';
import { QRViewer } from '@/components/QRViewer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BatchDetail() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { getBatch } = useSupplyChain();
  const batch = getBatch(batchId || '');

  if (!batch) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="font-display font-bold text-xl text-foreground">Batch Not Found</h2>
        <p className="text-muted-foreground mt-2">The batch ID "{batchId}" does not exist.</p>
        <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-foreground">{batch.cropName}</h1>
            <Badge variant="outline" className="font-mono">{batch.id}</Badge>
          </div>
          <p className="text-muted-foreground">{batch.variety} • {batch.quantity} {batch.unit} • {batch.farmLocation}</p>
        </div>
      </div>

      <SupplyChainFlow currentStage={batch.currentStage} />

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="timeline">Journey Timeline</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-4">
          <BatchTimeline updates={batch.updates} />
        </TabsContent>
        <TabsContent value="transactions" className="mt-4">
          <TransactionLog transactions={batch.transactions} />
        </TabsContent>
        <TabsContent value="qr" className="mt-4 flex justify-center">
          <QRViewer batch={batch} size={220} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
