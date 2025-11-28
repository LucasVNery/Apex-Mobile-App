export type FeatureLevel = 1 | 2 | 3;

export interface ProgressionState {
  level: FeatureLevel;
  notesCreated: number;
  linksCreated: number;
  blocksUsed: number;
  tagsUsed: number;
  graphInteractions: number;
  unlockedFeatures: Feature[];
  achievements: Achievement[];
}

export type Feature =
  | 'basic-notes'
  | 'search'
  | 'auto-links'
  | 'mini-graph'
  | 'tags'
  | 'full-graph'
  | 'advanced-blocks'
  | 'templates'
  | 'tables'
  | 'kanban';

export interface FeatureRequirement {
  feature: Feature;
  requiredLevel: FeatureLevel;
  requiredNotes?: number;
  requiredLinks?: number;
  requiredInteractions?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number;  // Timestamp em vez de Date
}

export const FEATURE_REQUIREMENTS: FeatureRequirement[] = [
  // Nível 1 (0-5 notas) - Básico
  { feature: 'basic-notes', requiredLevel: 1, requiredNotes: 0 },
  { feature: 'search', requiredLevel: 1, requiredNotes: 2 },

  // Nível 2 (5-15 notas) - Intermediário
  { feature: 'auto-links', requiredLevel: 2, requiredNotes: 5 },
  { feature: 'mini-graph', requiredLevel: 2, requiredNotes: 5, requiredLinks: 2 },
  { feature: 'tags', requiredLevel: 2, requiredNotes: 5 },

  // Nível 3 (15+ notas) - Avançado
  { feature: 'full-graph', requiredLevel: 3, requiredNotes: 15, requiredLinks: 5 },
  { feature: 'advanced-blocks', requiredLevel: 3, requiredNotes: 15 },
  { feature: 'tables', requiredLevel: 3, requiredNotes: 10 },
  { feature: 'kanban', requiredLevel: 3, requiredNotes: 15 },
  { feature: 'templates', requiredLevel: 3, requiredNotes: 20 },
];
