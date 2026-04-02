import { motion } from 'framer-motion';
import { StageUpdate, ROLE_CONFIG } from '@/lib/supply-chain-types';
import { format } from 'date-fns';

interface BatchTimelineProps {
  updates: StageUpdate[];
}

export function BatchTimeline({ updates }: BatchTimelineProps) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />
      {updates.map((update, i) => {
        const config = ROLE_CONFIG[update.stage];
        return (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="relative mb-6 last:mb-0"
          >
            <div className={`absolute -left-5 top-1 w-4 h-4 rounded-full border-2 border-${config.color} bg-background flex items-center justify-center`}>
              <div className={`w-2 h-2 rounded-full bg-${config.color}`} />
            </div>
            <div className="bg-card rounded-lg p-4 shadow-card border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {config.icon} {config.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(update.timestamp), 'MMM dd, HH:mm')}
                </span>
              </div>
              <p className="font-display font-semibold text-sm text-foreground">{update.action}</p>
              <p className="text-sm text-muted-foreground mt-1">{update.details}</p>
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                <span>📍 {update.location}</span>
                <span>👤 {update.handler}</span>
                {update.temperature && <span>🌡️ {update.temperature}</span>}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
