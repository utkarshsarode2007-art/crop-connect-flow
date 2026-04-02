import { motion } from 'framer-motion';
import { STAGE_ORDER, ROLE_CONFIG, UserRole } from '@/lib/supply-chain-types';

interface SupplyChainFlowProps {
  currentStage: UserRole;
  onStageClick?: (stage: UserRole) => void;
}

export function SupplyChainFlow({ currentStage, onStageClick }: SupplyChainFlowProps) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="flex items-center justify-between w-full gap-1 overflow-x-auto py-4">
      {STAGE_ORDER.map((stage, i) => {
        const config = ROLE_CONFIG[stage];
        const isActive = i <= currentIdx;
        const isCurrent = stage === currentStage;

        return (
          <div key={stage} className="flex items-center flex-1 min-w-0">
            <motion.button
              onClick={() => onStageClick?.(stage)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all w-full ${
                isCurrent
                  ? 'bg-primary/10 border-2 border-primary shadow-elevated'
                  : isActive
                  ? 'bg-accent border border-border'
                  : 'bg-muted/50 border border-transparent opacity-50'
              }`}
            >
              <span className="text-2xl">{config.icon}</span>
              <span className={`text-xs font-display font-semibold truncate ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                {config.label}
              </span>
              {isCurrent && (
                <motion.div
                  layoutId="active-dot"
                  className="w-2 h-2 rounded-full bg-primary animate-pulse-dot"
                />
              )}
            </motion.button>
            {i < STAGE_ORDER.length - 1 && (
              <div className={`h-0.5 w-4 flex-shrink-0 mx-1 ${isActive ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
