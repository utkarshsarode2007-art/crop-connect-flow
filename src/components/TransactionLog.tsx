import { motion } from 'framer-motion';
import { Transaction, ROLE_CONFIG } from '@/lib/supply-chain-types';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

interface TransactionLogProps {
  transactions: Transaction[];
}

export function TransactionLog({ transactions }: TransactionLogProps) {
  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No transactions recorded yet.</p>;
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx, i) => (
        <motion.div
          key={tx.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center justify-between p-4 bg-card border border-border rounded-lg shadow-card"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{ROLE_CONFIG[tx.from].icon}</span>
            <div>
              <p className="text-sm font-medium text-foreground">{ROLE_CONFIG[tx.from].label}</p>
              <p className="text-xs text-muted-foreground">{format(new Date(tx.timestamp), 'MMM dd, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{ROLE_CONFIG[tx.to].label}</p>
              <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
            </div>
            <span className="text-lg">{ROLE_CONFIG[tx.to].icon}</span>
          </div>
          <div className="text-right ml-4">
            <p className="font-display font-bold text-foreground">₹{tx.amount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{tx.currency}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
