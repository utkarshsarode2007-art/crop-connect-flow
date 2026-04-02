import React, { createContext, useContext, useState, useCallback } from 'react';
import { Batch, StageUpdate, Transaction, UserRole, generateBatchId, STAGE_ORDER } from '@/lib/supply-chain-types';

interface SupplyChainState {
  batches: Batch[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  createBatch: (data: Omit<Batch, 'id' | 'currentStage' | 'status' | 'createdAt' | 'updates' | 'transactions'>) => Batch;
  addUpdate: (batchId: string, update: Omit<StageUpdate, 'id' | 'timestamp'>) => void;
  advanceStage: (batchId: string) => void;
  getBatch: (batchId: string) => Batch | undefined;
}

const SAMPLE_BATCHES: Batch[] = [
  {
    id: 'AGR-DEMO01-A1B2',
    cropName: 'Organic Wheat',
    variety: 'Hard Red Winter',
    quantity: '2500',
    unit: 'kg',
    farmLocation: 'Punjab, India',
    farmerName: 'Rajesh Patel',
    harvestDate: '2026-03-15',
    currentStage: 'distributor',
    status: 'stored',
    createdAt: new Date('2026-03-15'),
    updates: [
      { id: '1', batchId: 'AGR-DEMO01-A1B2', stage: 'farmer', action: 'Register Crop', details: 'Organic wheat harvested from Field Block 7', location: 'Punjab, India', handler: 'Rajesh Patel', timestamp: new Date('2026-03-15T06:00:00') },
      { id: '2', batchId: 'AGR-DEMO01-A1B2', stage: 'farmer', action: 'Ship to Supplier', details: 'Loaded onto refrigerated truck #TRK-4421', location: 'Punjab, India', handler: 'Rajesh Patel', timestamp: new Date('2026-03-16T08:30:00') },
      { id: '3', batchId: 'AGR-DEMO01-A1B2', stage: 'supplier', action: 'Pick Up Batch', details: 'Picked up, temperature: 18°C', location: 'Punjab Highway', handler: 'TransCo Logistics', timestamp: new Date('2026-03-16T10:00:00'), temperature: '18°C' },
      { id: '4', batchId: 'AGR-DEMO01-A1B2', stage: 'supplier', action: 'Deliver to Warehouse', details: 'Delivered to Central Warehouse Delhi', location: 'Delhi NCR', handler: 'TransCo Logistics', timestamp: new Date('2026-03-17T14:00:00'), temperature: '17°C' },
      { id: '5', batchId: 'AGR-DEMO01-A1B2', stage: 'distributor', action: 'Receive Shipment', details: 'Received and stored in Bay 12, Section C', location: 'Delhi NCR Warehouse', handler: 'FreshStore Dist.', timestamp: new Date('2026-03-17T15:30:00') },
      { id: '6', batchId: 'AGR-DEMO01-A1B2', stage: 'distributor', action: 'Quality Check', details: 'Moisture 12%, Grade A certified', location: 'Delhi NCR Warehouse', handler: 'QA Team', timestamp: new Date('2026-03-18T09:00:00') },
    ],
    transactions: [
      { id: 't1', batchId: 'AGR-DEMO01-A1B2', from: 'farmer', to: 'supplier', amount: 45000, currency: 'INR', timestamp: new Date('2026-03-16'), status: 'completed' },
      { id: 't2', batchId: 'AGR-DEMO01-A1B2', from: 'supplier', to: 'distributor', amount: 52000, currency: 'INR', timestamp: new Date('2026-03-17'), status: 'completed' },
    ],
  },
  {
    id: 'AGR-DEMO02-C3D4',
    cropName: 'Basmati Rice',
    variety: 'Pusa 1121',
    quantity: '1800',
    unit: 'kg',
    farmLocation: 'Haryana, India',
    farmerName: 'Amrita Singh',
    harvestDate: '2026-03-20',
    currentStage: 'retailer',
    status: 'delivered',
    createdAt: new Date('2026-03-20'),
    updates: [
      { id: '7', batchId: 'AGR-DEMO02-C3D4', stage: 'farmer', action: 'Register Crop', details: 'Premium basmati rice from organic paddies', location: 'Haryana, India', handler: 'Amrita Singh', timestamp: new Date('2026-03-20T07:00:00') },
      { id: '8', batchId: 'AGR-DEMO02-C3D4', stage: 'supplier', action: 'Pick Up Batch', details: 'Collected in sealed containers', location: 'Haryana Highway', handler: 'AgriMove Transport', timestamp: new Date('2026-03-21T09:00:00') },
      { id: '9', batchId: 'AGR-DEMO02-C3D4', stage: 'distributor', action: 'Receive Shipment', details: 'Stored in climate-controlled unit', location: 'Mumbai Warehouse', handler: 'GrainHub Dist.', timestamp: new Date('2026-03-23T11:00:00') },
      { id: '10', batchId: 'AGR-DEMO02-C3D4', stage: 'retailer', action: 'Receive Stock', details: 'Shelved in organic section', location: 'FreshMart Store #42', handler: 'FreshMart', timestamp: new Date('2026-03-25T08:00:00') },
    ],
    transactions: [
      { id: 't3', batchId: 'AGR-DEMO02-C3D4', from: 'farmer', to: 'supplier', amount: 72000, currency: 'INR', timestamp: new Date('2026-03-21'), status: 'completed' },
      { id: 't4', batchId: 'AGR-DEMO02-C3D4', from: 'supplier', to: 'distributor', amount: 85000, currency: 'INR', timestamp: new Date('2026-03-23'), status: 'completed' },
      { id: 't5', batchId: 'AGR-DEMO02-C3D4', from: 'distributor', to: 'retailer', amount: 98000, currency: 'INR', timestamp: new Date('2026-03-25'), status: 'completed' },
    ],
  },
];

const SupplyChainContext = createContext<SupplyChainState | null>(null);

export function SupplyChainProvider({ children }: { children: React.ReactNode }) {
  const [batches, setBatches] = useState<Batch[]>(SAMPLE_BATCHES);
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');

  const createBatch = useCallback((data: Omit<Batch, 'id' | 'currentStage' | 'status' | 'createdAt' | 'updates' | 'transactions'>) => {
    const id = generateBatchId();
    const batch: Batch = {
      ...data,
      id,
      currentStage: 'farmer',
      status: 'harvested',
      createdAt: new Date(),
      updates: [{
        id: crypto.randomUUID(),
        batchId: id,
        stage: 'farmer',
        action: 'Register Crop',
        details: `${data.cropName} (${data.variety}) registered — ${data.quantity} ${data.unit}`,
        location: data.farmLocation,
        handler: data.farmerName,
        timestamp: new Date(),
      }],
      transactions: [],
    };
    setBatches(prev => [batch, ...prev]);
    return batch;
  }, []);

  const addUpdate = useCallback((batchId: string, update: Omit<StageUpdate, 'id' | 'timestamp'>) => {
    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      return {
        ...b,
        updates: [...b.updates, { ...update, id: crypto.randomUUID(), timestamp: new Date() }],
      };
    }));
  }, []);

  const advanceStage = useCallback((batchId: string) => {
    setBatches(prev => prev.map(b => {
      if (b.id !== batchId) return b;
      const idx = STAGE_ORDER.indexOf(b.currentStage);
      if (idx >= STAGE_ORDER.length - 1) return b;
      const nextStage = STAGE_ORDER[idx + 1];
      const tx: Transaction = {
        id: crypto.randomUUID(),
        batchId,
        from: b.currentStage,
        to: nextStage,
        amount: Math.floor(Math.random() * 50000) + 20000,
        currency: 'INR',
        timestamp: new Date(),
        status: 'completed',
      };
      return { ...b, currentStage: nextStage, transactions: [...b.transactions, tx] };
    }));
  }, []);

  const getBatch = useCallback((batchId: string) => batches.find(b => b.id === batchId), [batches]);

  return (
    <SupplyChainContext.Provider value={{ batches, currentRole, setCurrentRole, createBatch, addUpdate, advanceStage, getBatch }}>
      {children}
    </SupplyChainContext.Provider>
  );
}

export function useSupplyChain() {
  const ctx = useContext(SupplyChainContext);
  if (!ctx) throw new Error('useSupplyChain must be used within SupplyChainProvider');
  return ctx;
}
