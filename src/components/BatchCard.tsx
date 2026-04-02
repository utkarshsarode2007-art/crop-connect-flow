import { motion } from 'framer-motion';
import { Batch, ROLE_CONFIG } from '@/lib/supply-chain-types';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface BatchCardProps {
  batch: Batch;
  index: number;
}

export function BatchCard({ batch, index }: BatchCardProps) {
  const navigate = useNavigate();
  const config = ROLE_CONFIG[batch.currentStage];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onClick={() => navigate(`/batch/${batch.id}`)}
      className="bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-elevated transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
            {batch.cropName}
          </h3>
          <p className="text-sm text-muted-foreground">{batch.variety}</p>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          {batch.id}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 flex-wrap">
        <span>📦 {batch.quantity} {batch.unit}</span>
        <span>📍 {batch.farmLocation}</span>
        {batch.assignedSupplier && <span>🚛 {batch.assignedSupplier}</span>}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{config.icon}</span>
          <span className="text-sm font-medium text-foreground">{config.label}</span>
        </div>
        <Badge className={`bg-${config.color}/10 text-${config.color} border-${config.color}/20`}>
          {batch.status}
        </Badge>
      </div>
      <div className="mt-3 flex gap-1">
        {['farmer', 'supplier', 'distributor', 'retailer', 'consumer'].map((stage, i) => (
          <div
            key={stage}
            className={`h-1.5 flex-1 rounded-full ${
              i <= ['farmer', 'supplier', 'distributor', 'retailer', 'consumer'].indexOf(batch.currentStage)
                ? 'bg-primary'
                : 'bg-border'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
