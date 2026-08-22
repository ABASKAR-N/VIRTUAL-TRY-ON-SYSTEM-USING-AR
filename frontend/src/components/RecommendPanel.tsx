'use client';
import React from 'react';
import { CatalogItem, getRecommendations, Category } from '@/lib/catalog';

interface RecommendPanelProps {
  item: CatalogItem;
  onSelect: (item: CatalogItem) => void;
}

const CAT_LABELS: Record<Category, string> = {
  eyewear: '👓 Eyewear',
  tops: '👕 Top',
  bottoms: '👖 Bottom',
  outfits: '🧥 Outfit',
};

export default function RecommendPanel({ item, onSelect }: RecommendPanelProps) {
  const recs = getRecommendations(item, 3);
  if (recs.length === 0) return null;

  return (
    <div className="recommend-panel">
      <p className="recommend-title">✨ Pairs Well With</p>
      <div className="recommend-list">
        {recs.map(r => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            className="recommend-item"
            style={{ '--accent': r.accent } as React.CSSProperties}
          >
            <div
              className="recommend-dot"
              style={{ background: r.accent }}
            />
            <div className="recommend-info">
              <span className="recommend-name">{r.name}</span>
              <span className="recommend-cat">{CAT_LABELS[r.category]}</span>
            </div>
            <span className="recommend-price">${r.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
