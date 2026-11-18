import type { ConceptCategory } from '../types/timeline';

export interface CategoryStyle {
  label: string;
  color: string;
  glowColor: string;
  borderColor: string;
  bgColor: string;
}

export const CATEGORY_STYLES: Record<ConceptCategory | string, CategoryStyle> = {
  paradigm: {
    label: 'Paradigm',
    color: '#A98C52', // Muted Antique Gold
    glowColor: 'rgba(169, 140, 82, 0.22)',
    borderColor: 'rgba(169, 140, 82, 0.55)',
    bgColor: 'rgba(169, 140, 82, 0.1)',
  },
  theory: {
    label: 'Theory',
    color: '#D6B875', // Champagne Gold
    glowColor: 'rgba(214, 184, 117, 0.25)',
    borderColor: 'rgba(214, 184, 117, 0.6)',
    bgColor: 'rgba(214, 184, 117, 0.12)',
  },
  architecture: {
    label: 'Architecture',
    color: '#8F7044', // Burnished Bronze
    glowColor: 'rgba(143, 112, 68, 0.22)',
    borderColor: 'rgba(143, 112, 68, 0.55)',
    bgColor: 'rgba(143, 112, 68, 0.1)',
  },
  algorithm: {
    label: 'Algorithm',
    color: '#77736A', // Observatory Pewter
    glowColor: 'rgba(119, 115, 106, 0.18)',
    borderColor: 'rgba(119, 115, 106, 0.45)',
    bgColor: 'rgba(119, 115, 106, 0.08)',
  },
  methodology: {
    label: 'Methodology',
    color: '#925B49', // Archival Rust
    glowColor: 'rgba(146, 91, 73, 0.22)',
    borderColor: 'rgba(146, 91, 73, 0.55)',
    bgColor: 'rgba(146, 91, 73, 0.1)',
  },
  model: {
    label: 'Model',
    color: '#718477', // Restrained Mineral Sage
    glowColor: 'rgba(113, 132, 119, 0.2)',
    borderColor: 'rgba(113, 132, 119, 0.5)',
    bgColor: 'rgba(113, 132, 119, 0.1)',
  },
};

export const RELATIONSHIP_LABELS: Record<string, { label: string; arrowText: string; color: string }> = {
  extends: {
    label: 'Extends',
    arrowText: 'extends',
    color: '#8F7044',
  },
  uses: {
    label: 'Uses',
    arrowText: 'uses',
    color: '#718477',
  },
  introduced: {
    label: 'Introduced',
    arrowText: 'introduced',
    color: '#A98C52',
  },
  influenced: {
    label: 'Influenced',
    arrowText: 'influenced',
    color: '#D6B875',
  },
  successor_to: {
    label: 'Successor To',
    arrowText: 'successor to',
    color: '#925B49',
  },
};

/**
 * Format relationship as a human-readable verified sentence:
 * source_concept --relationship_type--> target_concept
 */
export function formatRelationshipSentence(
  sourceName: string,
  relType: string,
  targetName: string
): string {
  switch (relType) {
    case 'extends':
      return `${sourceName} extends ${targetName}`;
    case 'uses':
      return `${sourceName} uses ${targetName}`;
    case 'introduced':
      return `${sourceName} introduced ${targetName}`;
    case 'influenced':
      return `${sourceName} influenced ${targetName}`;
    case 'successor_to':
      return `${sourceName} is successor to ${targetName}`;
    default:
      return `${sourceName} --${relType}--> ${targetName}`;
  }
}
