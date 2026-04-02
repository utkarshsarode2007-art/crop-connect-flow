import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROLE_CONFIG, UserRole, STAGE_ORDER } from '@/lib/supply-chain-types';
import { useSupplyChain } from '@/context/SupplyChainContext';
import { ArrowRight, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function Index() {
  const navigate = useNavigate();
  const { setCurrentRole, batches } = useSupplyChain();
  const [scanId, setScanId] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    navigate(role === 'farmer' ? '/farmer' : `/dashboard/${role}`);
  };

  const handleScan = () => {
    if (scanId.trim()) navigate(`/scan/${scanId.trim()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="container max-w-6xl mx-auto px-4 py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent border border-border mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
              <span className="text-sm font-medium text-accent-foreground">Farm-to-Fork Traceability</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-gradient-hero leading-tight mb-4">
              AgriTrace
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Track every crop from seed to shelf. Transparent, verifiable, and trusted supply chain management for modern agriculture.
            </p>

            {/* Quick Scan */}
            <div className="flex items-center gap-2 max-w-md mx-auto mb-12">
              <Input
                placeholder="Enter Batch ID (e.g. AGR-DEMO01-A1B2)"
                value={scanId}
                onChange={e => setScanId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
                className="text-center"
              />
              <Button onClick={handleScan} size="icon" variant="outline">
                <Scan className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Supply Chain Flow Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-16 overflow-x-auto px-4"
          >
            {STAGE_ORDER.map((stage, i) => (
              <div key={stage} className="flex items-center">
                <div className="flex flex-col items-center gap-1 px-3">
                  <span className="text-2xl">{ROLE_CONFIG[stage].icon}</span>
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{ROLE_CONFIG[stage].label}</span>
                </div>
                {i < STAGE_ORDER.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-border flex-shrink-0" />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="container max-w-6xl mx-auto px-4 pb-20">
        <h2 className="font-display font-bold text-xl text-foreground text-center mb-8">Select Your Role</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STAGE_ORDER.map((role, i) => {
            const config = ROLE_CONFIG[role];
            return (
              <motion.button
                key={role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect(role)}
                className="bg-card border border-border rounded-xl p-6 shadow-card hover:shadow-elevated transition-all text-center group"
              >
                <span className="text-4xl block mb-3">{config.icon}</span>
                <h3 className="font-display font-bold text-foreground group-hover:text-primary transition-colors">
                  {config.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-2">
                  {config.actions.length} actions available
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Active batches summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-6 px-6 py-3 rounded-full bg-muted/50 border border-border">
            <div>
              <p className="font-display font-bold text-2xl text-foreground">{batches.length}</p>
              <p className="text-xs text-muted-foreground">Active Batches</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="font-display font-bold text-2xl text-foreground">{batches.reduce((s, b) => s + b.updates.length, 0)}</p>
              <p className="text-xs text-muted-foreground">Updates Recorded</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="font-display font-bold text-2xl text-foreground">{batches.reduce((s, b) => s + b.transactions.length, 0)}</p>
              <p className="text-xs text-muted-foreground">Transactions</p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
