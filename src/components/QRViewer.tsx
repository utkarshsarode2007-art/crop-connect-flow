import { QRCodeSVG } from 'qrcode.react';
import { Batch } from '@/lib/supply-chain-types';

interface QRViewerProps {
  batch: Batch;
  size?: number;
}

export function QRViewer({ batch, size = 180 }: QRViewerProps) {
  const url = `${window.location.origin}/scan/${batch.id}`;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-xl border border-border shadow-card">
      <p className="text-sm font-display font-semibold text-foreground">Scan to Verify</p>
      <div className="bg-background p-4 rounded-lg border border-border">
        <QRCodeSVG
          value={url}
          size={size}
          bgColor="transparent"
          fgColor="hsl(150, 20%, 10%)"
          level="H"
        />
      </div>
      <div className="text-center">
        <p className="font-mono text-xs text-muted-foreground">{batch.id}</p>
        <p className="text-sm font-medium text-foreground mt-1">{batch.cropName}</p>
      </div>
    </div>
  );
}
