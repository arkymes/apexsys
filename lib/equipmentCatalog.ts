import type { Equipment, EquipmentCategory } from '@/types';

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const slugify = (value: string) =>
  normalizeText(value)
    .replace(/\s+/g, '-')
    .slice(0, 40);

const CATEGORY_RULES: Array<{ category: EquipmentCategory; patterns: RegExp[] }> = [
  {
    category: 'free-weight',
    patterns: [/halter/, /dumbbell/, /kettlebell/, /anilha/, /peso livre/, /medicine ball/],
  },
  { category: 'barbell', patterns: [/barra/, /barbell/, /smith/, /ez bar/] },
  {
    category: 'machine',
    patterns: [/maquina/, /leg press/, /hack/, /chest press/, /extensor/, /flexora/],
  },
  { category: 'cable', patterns: [/cabo/, /roldana/, /pulley/, /cross/, /crossover/, /cable/] },
  {
    category: 'cardio',
    patterns: [/esteira/, /bike/, /bicicleta/, /remo/, /air bike/, /escada/, /corrida/],
  },
  { category: 'accessory', patterns: [/elastico/, /faixa/, /strap/, /argola/, /banco/, /trx/] },
  { category: 'bodyweight', patterns: [/peso corporal/, /bodyweight/, /calistenia/] },
];

export const inferEquipmentCategory = (name: string): EquipmentCategory => {
  const normalized = normalizeText(name);
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) return rule.category;
  }
  return 'other';
};

export const normalizeEquipmentNames = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

export const buildEquipmentCatalogFromNames = (
  items: string[],
  source: Equipment['source'] = 'user'
): Equipment[] => {
  const normalized = normalizeEquipmentNames(items);
  return normalized.map((name, index) => ({
    id: `equip-${slugify(name) || index}`,
    name,
    category: inferEquipmentCategory(name),
    enabledForAI: true,
    source,
  }));
};

type EquipmentLike = Partial<Equipment> & { name?: unknown };

export const normalizeEquipmentCatalog = (
  items: EquipmentLike[],
  fallbackNames: string[] = []
): Equipment[] => {
  const byName = new Map<string, Equipment>();

  for (const item of items || []) {
    if (typeof item?.name !== 'string' || !item.name.trim()) continue;
    const name = item.name.trim();
    const key = normalizeText(name);
    if (!key) continue;
    byName.set(key, {
      id: typeof item.id === 'string' && item.id.trim() ? item.id : `equip-${slugify(name)}`,
      name,
      category:
        item.category && typeof item.category === 'string'
          ? item.category
          : inferEquipmentCategory(name),
      notes: typeof item.notes === 'string' ? item.notes.trim() : undefined,
      enabledForAI:
        typeof item.enabledForAI === 'boolean'
          ? item.enabledForAI
          : typeof item.equipped === 'boolean'
          ? item.equipped
          : true,
      source:
        item.source === 'assessment-ai' || item.source === 'user' || item.source === 'system'
          ? item.source
          : 'assessment-ai',
    });
  }

  for (const fallback of normalizeEquipmentNames(fallbackNames)) {
    const key = normalizeText(fallback);
    if (!key || byName.has(key)) continue;
    byName.set(key, {
      id: `equip-${slugify(fallback)}`,
      name: fallback,
      category: inferEquipmentCategory(fallback),
      enabledForAI: true,
      source: 'user',
    });
  }

  return Array.from(byName.values());
};

