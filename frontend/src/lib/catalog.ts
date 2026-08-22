// ─────────────────────────────────────────────────────────────────────────────
// Catalog Data — All items for the Virtual Try-On System
// ─────────────────────────────────────────────────────────────────────────────

export type Category = 'eyewear' | 'tops' | 'bottoms' | 'outfits';

export type CatalogItem = {
  id: string;
  name: string;
  price: number;
  accent: string;
  tag: string;
  category: Category;
  description?: string;
  // Eyewear specific
  shape?: string;
  frameColor?: string;
  lensColor?: string;
  // Clothing specific
  color?: string;
  style?: string;
  // Outfit (combined top+bottom)
  topColor?: string;
  bottomColor?: string;
  bottomStyle?: string;
};

// ─── Eyewear ─────────────────────────────────────────────────────────────────
export const EYEWEAR: CatalogItem[] = [
  { id: 'e1', category: 'eyewear', name: 'Classic Aviator', price: 129, shape: 'aviator', frameColor: '#c8a96b', lensColor: 'rgba(180,160,80,0.38)', accent: '#f5c842', tag: 'Pilot', description: 'Timeless teardrop aviator with gold frame' },
  { id: 'e2', category: 'eyewear', name: 'Wayfarer', price: 99, shape: 'square', frameColor: '#1a1a1a', lensColor: 'rgba(20,20,20,0.55)', accent: '#9ca3af', tag: 'Classic', description: 'Iconic square frame, never goes out of style' },
  { id: 'e3', category: 'eyewear', name: 'Round Vintage', price: 119, shape: 'round', frameColor: '#7c2d12', lensColor: 'rgba(160,80,30,0.38)', accent: '#f97316', tag: 'Vintage', description: 'Circular retro frames with tortoise shell finish' },
  { id: 'e4', category: 'eyewear', name: 'Cat-Eye Glam', price: 145, shape: 'cateye', frameColor: '#4a044e', lensColor: 'rgba(180,0,230,0.3)', accent: '#e879f9', tag: 'Glam', description: 'Dramatic upswept frame for bold fashion statements' },
  { id: 'e5', category: 'eyewear', name: 'Sports Shield', price: 89, shape: 'shield', frameColor: '#042f2e', lensColor: 'rgba(0,200,180,0.4)', accent: '#2dd4bf', tag: 'Sport', description: 'Wraparound protection for active lifestyles' },
  { id: 'e6', category: 'eyewear', name: 'Cyber Hex', price: 159, shape: 'hex', frameColor: '#0f0f1a', lensColor: 'rgba(0,255,255,0.25)', accent: '#00ffff', tag: 'Cyber', description: 'Hexagonal futuristic frames with neon accents' },
  { id: 'e7', category: 'eyewear', name: 'Slim Rimless', price: 79, shape: 'rimless', frameColor: '#aaa', lensColor: 'rgba(200,200,255,0.2)', accent: '#c7d2fe', tag: 'Minimal', description: 'Ultra-light rimless design, barely there' },
  { id: 'e8', category: 'eyewear', name: 'Oversized Boss', price: 135, shape: 'oversized', frameColor: '#1c1917', lensColor: 'rgba(40,20,0,0.5)', accent: '#d97706', tag: 'Fashion', description: 'Large statement frames that dominate the look' },
  { id: 'e9', category: 'eyewear', name: 'Rose Gold', price: 115, shape: 'round', frameColor: '#c4746c', lensColor: 'rgba(220,150,130,0.3)', accent: '#fb7185', tag: 'Elegant', description: 'Soft rose gold round frames with pink tint' },
  { id: 'e10', category: 'eyewear', name: 'Blue Light', price: 95, shape: 'square', frameColor: '#1e3a5f', lensColor: 'rgba(100,150,255,0.15)', accent: '#60a5fa', tag: 'Work', description: 'Blue light blocking lenses for screen time' },
];

// ─── Tops ─────────────────────────────────────────────────────────────────────
export const TOPS: CatalogItem[] = [
  { id: 't1', category: 'tops', name: 'Urban Hoodie', price: 85, color: '#1e293b', accent: '#38bdf8', tag: 'Casual', description: 'Comfortable pullover hoodie with kangaroo pocket' },
  { id: 't2', category: 'tops', name: 'Blazer Elite', price: 195, color: '#1c1917', accent: '#f59e0b', tag: 'Formal', description: 'Sharp single-breasted blazer for power meetings' },
  { id: 't3', category: 'tops', name: 'Graphic Tee', price: 45, color: '#1a1a2e', accent: '#a855f7', tag: 'Street', description: 'Oversized streetwear tee with bold graphic print' },
  { id: 't4', category: 'tops', name: 'Leather Jacket', price: 285, color: '#0c0a09', accent: '#ef4444', tag: 'Edge', description: 'Premium moto leather jacket with asymmetric zip' },
  { id: 't5', category: 'tops', name: 'Sports Jersey', price: 65, color: '#052e16', accent: '#22c55e', tag: 'Sport', description: 'Breathable moisture-wicking athletic jersey' },
  { id: 't6', category: 'tops', name: 'Denim Shirt', price: 75, color: '#0c1d3b', accent: '#60a5fa', tag: 'Denim', description: 'Classic chambray denim button-up shirt' },
  { id: 't7', category: 'tops', name: 'Saree Drape', price: 220, color: '#3b0764', accent: '#c084fc', tag: 'Traditional', description: 'Elegant silk saree with intricate border work' },
  { id: 't8', category: 'tops', name: 'Floral Dress', price: 110, color: '#1a0535', accent: '#f472b6', tag: 'Boho', description: 'Flowy floral midi dress with puffed sleeves' },
];

// ─── Bottoms ──────────────────────────────────────────────────────────────────
export const BOTTOMS: CatalogItem[] = [
  { id: 'b1', category: 'bottoms', name: 'Slim Jeans', price: 95, color: '#1e3a5f', accent: '#60a5fa', tag: 'Casual', style: 'pants', description: 'Slim-fit stretch denim in classic indigo wash' },
  { id: 'b2', category: 'bottoms', name: 'Cargo Pants', price: 85, color: '#1a2e1a', accent: '#4ade80', tag: 'Street', style: 'pants', description: 'Multi-pocket utility cargos with tapered leg' },
  { id: 'b3', category: 'bottoms', name: 'Chinos', price: 79, color: '#3d2b1f', accent: '#d97706', tag: 'Smart', style: 'pants', description: 'Tailored flat-front chinos in warm tan' },
  { id: 'b4', category: 'bottoms', name: 'Mini Skirt', price: 55, color: '#3b0764', accent: '#c084fc', tag: 'Glam', style: 'skirt', description: 'High-waist pleated mini skirt in deep violet' },
  { id: 'b5', category: 'bottoms', name: 'Shorts', price: 49, color: '#0c2340', accent: '#38bdf8', tag: 'Sport', style: 'shorts', description: 'Athletic shorts with side stripe detail' },
  { id: 'b6', category: 'bottoms', name: 'Maxi Skirt', price: 69, color: '#1c0a28', accent: '#e879f9', tag: 'Boho', style: 'skirt', description: 'Flowing maxi skirt with tiered hem' },
  { id: 'b7', category: 'bottoms', name: 'Trousers', price: 99, color: '#111827', accent: '#f59e0b', tag: 'Formal', style: 'pants', description: 'Pleated formal trousers with sharp crease' },
  { id: 'b8', category: 'bottoms', name: 'Leggings', price: 45, color: '#0f172a', accent: '#818cf8', tag: 'Active', style: 'pants', description: 'High-rise compression leggings with pocket' },
];

// ─── Outfits ──────────────────────────────────────────────────────────────────
export const OUTFITS: CatalogItem[] = [
  { id: 'o1', category: 'outfits', name: 'Street King', price: 175, color: '#1e293b', topColor: '#1e293b', bottomColor: '#1a2e1a', bottomStyle: 'pants', accent: '#38bdf8', tag: 'Street', description: 'Urban hoodie + cargo pants for street-ready style' },
  { id: 'o2', category: 'outfits', name: 'Power Suit', price: 340, color: '#1c1917', topColor: '#1c1917', bottomColor: '#111827', bottomStyle: 'pants', accent: '#f59e0b', tag: 'Formal', description: 'Blazer + formal trousers for boardroom confidence' },
  { id: 'o3', category: 'outfits', name: 'Sport Mode', price: 130, color: '#052e16', topColor: '#052e16', bottomColor: '#0c2340', bottomStyle: 'shorts', accent: '#22c55e', tag: 'Sport', description: 'Jersey + shorts — game day ready' },
  { id: 'o4', category: 'outfits', name: 'Boho Queen', price: 179, color: '#3b0764', topColor: '#1a0535', bottomColor: '#1c0a28', bottomStyle: 'skirt', accent: '#f472b6', tag: 'Boho', description: 'Floral dress + maxi skirt layered boho look' },
  { id: 'o5', category: 'outfits', name: 'Denim Days', price: 170, color: '#0c1d3b', topColor: '#0c1d3b', bottomColor: '#1e3a5f', bottomStyle: 'pants', accent: '#60a5fa', tag: 'Casual', description: 'Denim shirt + slim jeans double denim moment' },
];

// ─── All items combined ───────────────────────────────────────────────────────
export const ALL_ITEMS = [...EYEWEAR, ...TOPS, ...BOTTOMS, ...OUTFITS];

// ─── Recommendation logic ─────────────────────────────────────────────────────
export function getRecommendations(item: CatalogItem, count = 3): CatalogItem[] {
  const sameTag = ALL_ITEMS.filter(i => i.id !== item.id && i.tag === item.tag);
  const diffCategory = ALL_ITEMS.filter(i => i.id !== item.id && i.tag === item.tag && i.category !== item.category);
  const combined = [...diffCategory, ...sameTag].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);
  return combined.slice(0, count);
}
