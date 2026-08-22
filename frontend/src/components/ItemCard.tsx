'use client';
import React from 'react';
import { CatalogItem, Category } from '@/lib/catalog';

interface ItemCardProps {
  item: CatalogItem;
  isSelected: boolean;
  onClick: () => void;
  category: Category;
}

const CATEGORY_ICONS: Record<Category, string> = {
  eyewear: '👓',
  tops: '👕',
  bottoms: '👖',
  outfits: '🧥',
};

export default function ItemCard({ item, isSelected, onClick, category }: ItemCardProps) {
  const icon = CATEGORY_ICONS[category];

  return (
    <button
      onClick={onClick}
      className={`item-card ${isSelected ? 'item-card--selected' : ''}`}
      style={{
        '--accent': item.accent,
        '--color': item.color ?? item.frameColor ?? '#333',
      } as React.CSSProperties}
    >
      {/* Color swatch */}
      <div className="item-swatch">
        <div className="item-swatch-bg" />
        <span className="item-icon">{icon}</span>
        {isSelected && <div className="item-check">✓</div>}
      </div>

      {/* Name */}
      <span className="item-name">{item.name}</span>

      {/* Price */}
      <span className="item-price">${item.price}</span>

      {/* Tag badge */}
      <span className="item-tag">{item.tag}</span>
    </button>
  );
}
