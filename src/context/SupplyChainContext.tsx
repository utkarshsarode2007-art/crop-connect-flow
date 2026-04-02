import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Batch, StageUpdate, Transaction, UserRole, generateBatchId, STAGE_ORDER } from '@/lib/supply-chain-types';
import type { Database } from '@/integrations/supabase/types';

type DbBatch = Database['public']['Tables']['batches']['Row'];
type DbUpdate = Database['public']['Tables']['batch_updates']['Row'];
type DbTransaction = Database['public']['Tables']['batch_transactions']['Row'];

function mapDbBatch(row: DbBatch, updates: DbUpdate[], transactions: DbTransaction[]): Batch {
  return {
    id: row.id,
    cropName: row.crop_name,
    variety: row.variety || '',
    quantity: row.quantity,
    unit: row.unit,
    farmLocation: row.farm_location,
    farmerName: row.farmer_name,
    harvestDate: row.harvest_date || '',
    currentStage: row.current_stage as UserRole,
    status: row.status as Batch['status'],
    assignedSupplier: row.assigned_supplier || undefined,
    createdAt: new Date(row.created_at),
    updates: updates.map(u => ({
      id: u.id,
      batchId: u.batch_id,
      stage: u.stage as UserRole,
      action: u.action,
      details: u.details || '',
      location: u.location || '',
      handler: u.handler || '',
      timestamp: new Date(u.created_at),
      temperature: u.temperature || undefined,
      notes: u.notes || undefined,
    })),
    transactions: transactions.map(t => ({
      id: t.id,
      batchId: t.batch_id,
      from: t.from_stage as UserRole,
      to: t.to_stage as UserRole,
      amount: t.amount,
      currency: t.currency,
      timestamp: new Date(t.created_at),
      status: t.status as 'pending' | 'completed',
    })),
  };
}

interface SupplyChainState {
  batches: Batch[];
  currentRole: UserRole;
  loading: boolean;
  setCurrentRole: (role: UserRole) => void;
  createBatch: (data: Omit<Batch, 'id' | 'currentStage' | 'status' | 'createdAt' | 'updates' | 'transactions' | 'assignedSupplier'>) => Promise<Batch>;
  addUpdate: (batchId: string, update: Omit<StageUpdate, 'id' | 'timestamp'>) => Promise<void>;
  advanceStage: (batchId: string) => Promise<void>;
  getBatch: (batchId: string) => Batch | undefined;
  acceptBatch: (batchId: string, supplierName: string) => Promise<void>;
  updateBatchStatus: (batchId: string, status: Batch['status']) => Promise<void>;
  refreshBatches: () => Promise<void>;
}

const SupplyChainContext = createContext<SupplyChainState | null>(null);

export function SupplyChainProvider({ children }: { children: React.ReactNode }) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [{ data: batchRows }, { data: updateRows }, { data: txRows }] = await Promise.all([
      supabase.from('batches').select('*').order('created_at', { ascending: false }),
      supabase.from('batch_updates').select('*').order('created_at', { ascending: true }),
      supabase.from('batch_transactions').select('*').order('created_at', { ascending: true }),
    ]);

    if (batchRows) {
      const mapped = batchRows.map(b =>
        mapDbBatch(
          b,
          (updateRows || []).filter(u => u.batch_id === b.id),
          (txRows || []).filter(t => t.batch_id === b.id),
        )
      );
      setBatches(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    // Real-time subscriptions
    const channel = supabase
      .channel('supply-chain-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'batches' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'batch_updates' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'batch_transactions' }, () => fetchAll())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const createBatch = useCallback(async (data: Omit<Batch, 'id' | 'currentStage' | 'status' | 'createdAt' | 'updates' | 'transactions' | 'assignedSupplier'>) => {
    const id = generateBatchId();
    await supabase.from('batches').insert({
      id,
      crop_name: data.cropName,
      variety: data.variety,
      quantity: data.quantity,
      unit: data.unit,
      farm_location: data.farmLocation,
      farmer_name: data.farmerName,
      harvest_date: data.harvestDate,
      current_stage: 'farmer',
      status: 'created',
    });

    await supabase.from('batch_updates').insert({
      batch_id: id,
      stage: 'farmer' as const,
      action: 'Register Crop',
      details: `${data.cropName} (${data.variety}) registered — ${data.quantity} ${data.unit}`,
      location: data.farmLocation,
      handler: data.farmerName,
    });

    const batch: Batch = {
      ...data,
      id,
      currentStage: 'farmer',
      status: 'created',
      createdAt: new Date(),
      updates: [],
      transactions: [],
    };
    return batch;
  }, []);

  const addUpdate = useCallback(async (batchId: string, update: Omit<StageUpdate, 'id' | 'timestamp'>) => {
    await supabase.from('batch_updates').insert({
      batch_id: batchId,
      stage: update.stage as Database['public']['Enums']['supply_chain_stage'],
      action: update.action,
      details: update.details,
      location: update.location,
      handler: update.handler,
      temperature: update.temperature,
      notes: update.notes,
    });
  }, []);

  const advanceStage = useCallback(async (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;
    const idx = STAGE_ORDER.indexOf(batch.currentStage);
    if (idx >= STAGE_ORDER.length - 1) return;
    const nextStage = STAGE_ORDER[idx + 1];

    await supabase.from('batches').update({
      current_stage: nextStage as Database['public']['Enums']['supply_chain_stage'],
    }).eq('id', batchId);

    await supabase.from('batch_transactions').insert({
      batch_id: batchId,
      from_stage: batch.currentStage as Database['public']['Enums']['supply_chain_stage'],
      to_stage: nextStage as Database['public']['Enums']['supply_chain_stage'],
      amount: Math.floor(Math.random() * 50000) + 20000,
      currency: 'INR',
    });
  }, [batches]);

  const acceptBatch = useCallback(async (batchId: string, supplierName: string) => {
    await supabase.from('batches').update({
      status: 'picked_up',
      assigned_supplier: supplierName,
      current_stage: 'supplier' as const,
    }).eq('id', batchId);

    await supabase.from('batch_updates').insert({
      batch_id: batchId,
      stage: 'supplier' as const,
      action: 'Pick Up Batch',
      details: `Batch accepted by ${supplierName}`,
      handler: supplierName,
    });

    await supabase.from('batch_transactions').insert({
      batch_id: batchId,
      from_stage: 'farmer' as const,
      to_stage: 'supplier' as const,
      amount: Math.floor(Math.random() * 50000) + 20000,
      currency: 'INR',
    });
  }, []);

  const updateBatchStatus = useCallback(async (batchId: string, status: Batch['status']) => {
    await supabase.from('batches').update({
      status: status as Database['public']['Enums']['batch_status'],
    }).eq('id', batchId);
  }, []);

  const getBatch = useCallback((batchId: string) => batches.find(b => b.id === batchId), [batches]);

  const refreshBatches = fetchAll;

  return (
    <SupplyChainContext.Provider value={{ batches, currentRole, loading, setCurrentRole, createBatch, addUpdate, advanceStage, getBatch, acceptBatch, updateBatchStatus, refreshBatches }}>
      {children}
    </SupplyChainContext.Provider>
  );
}

export function useSupplyChain() {
  const ctx = useContext(SupplyChainContext);
  if (!ctx) throw new Error('useSupplyChain must be used within SupplyChainProvider');
  return ctx;
}
