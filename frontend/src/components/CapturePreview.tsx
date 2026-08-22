'use client';
import React, { useState, useEffect } from 'react';
import { Download, RotateCcw, X } from 'lucide-react';

interface CapturePreviewProps {
  onCapture: (cb: () => string | null) => void;
  accent: string;
}

interface Snapshot {
  url: string;
  ts: number;
}

export default function CapturePreview({ onCapture, accent }: CapturePreviewProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [viewIndex, setViewIndex] = useState<number | null>(null);

  // Register the capture callback
  useEffect(() => {
    onCapture(() => {
      // Returns a function that triggers capture
      return null;
    });
  }, [onCapture]);


  const downloadSnapshot = (url: string, ts: number) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-tryon-${ts}.png`;
    a.click();
  };

  const deleteSnapshot = (ts: number) => {
    setSnapshots(prev => prev.filter(s => s.ts !== ts));
    if (viewIndex !== null) setViewIndex(null);
  };

  return (
    <>
      {/* Thumbnail strip */}
      {snapshots.length > 0 && (
        <div className="snapshot-strip">
          {snapshots.map((snap, i) => (
            <button
              key={snap.ts}
              className="snapshot-thumb"
              onClick={() => setViewIndex(i)}
              style={{ borderColor: i === viewIndex ? accent : 'rgba(255,255,255,0.15)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={snap.url} alt="snapshot" className="snapshot-img" />
            </button>
          ))}
        </div>
      )}

      {/* Full preview modal */}
      {viewIndex !== null && snapshots[viewIndex] && (
        <div className="snapshot-modal" onClick={() => setViewIndex(null)}>
          <div className="snapshot-modal-inner" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={snapshots[viewIndex].url} alt="preview" className="snapshot-preview-img" />
            <div className="snapshot-actions">
              <button
                className="snapshot-btn"
                style={{ background: accent }}
                onClick={() => downloadSnapshot(snapshots[viewIndex!].url, snapshots[viewIndex!].ts)}
              >
                <Download size={16} /> Save
              </button>
              <button className="snapshot-btn snapshot-btn--ghost" onClick={() => setViewIndex(null)}>
                <X size={16} /> Close
              </button>
              <button
                className="snapshot-btn snapshot-btn--danger"
                onClick={() => deleteSnapshot(snapshots[viewIndex!].ts)}
              >
                <RotateCcw size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { CapturePreview };
export type { CapturePreviewProps };
