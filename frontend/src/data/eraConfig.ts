import type { Era, EraMetadata } from '../types/timeline';

export const ERA_CONFIG: Record<Era, EraMetadata> = {
  foundations: {
    id: 'foundations',
    label: 'Foundations & Cybernetics',
    years: '1940 – 1955',
    color: '#D6B875', // Champagne Gold
    glowColor: 'rgba(214, 184, 117, 0.22)',
    bgBadge: 'bg-amber-950/40 text-amber-300 border-amber-600/30',
    description: 'Mathematical logic, Turing machines, and early artificial neural networks.',
  },
  birth: {
    id: 'birth',
    label: 'Birth of AI',
    years: '1956 – 1969',
    color: '#A98C52', // Antique Horological Gold
    glowColor: 'rgba(169, 140, 82, 0.20)',
    bgBadge: 'bg-stone-900/60 text-amber-200 border-stone-700/40',
    description: 'The Dartmouth summer workshop and early symbolic computing.',
  },
  first_winter: {
    id: 'first_winter',
    label: 'First AI Winter',
    years: '1970 – 1979',
    color: '#77736A', // Observatory Pewter / Slate
    glowColor: 'rgba(119, 115, 106, 0.18)',
    bgBadge: 'bg-stone-900/60 text-stone-300 border-stone-700/40',
    description: 'Funding cuts, combinatorial explosion limits, and Lighthill report critique.',
  },
  expert_systems: {
    id: 'expert_systems',
    label: 'Knowledge & Connectionism',
    years: '1980 – 1987',
    color: '#8F7044', // Burnished Bronze
    glowColor: 'rgba(143, 112, 68, 0.20)',
    bgBadge: 'bg-stone-900/60 text-amber-300 border-stone-700/40',
    description: 'Commercial expert systems boom and backpropagation rediscovery.',
  },
  second_winter: {
    id: 'second_winter',
    label: 'Second AI Winter',
    years: '1988 – 1993',
    color: '#655334', // Deep Patina Umber
    glowColor: 'rgba(101, 83, 52, 0.18)',
    bgBadge: 'bg-stone-900/60 text-stone-400 border-stone-800/40',
    description: 'Collapse of specialized Lisp hardware market and expert system brittleness.',
  },
  revival: {
    id: 'revival',
    label: 'Statistical Machine Learning',
    years: '1994 – 2011',
    color: '#718477', // Restrained Mineral Sage
    glowColor: 'rgba(113, 132, 119, 0.20)',
    bgBadge: 'bg-stone-900/60 text-emerald-200 border-stone-700/40',
    description: 'Support vector machines, probabilistic graphical models, and LeNet CNNs.',
  },
  deep_learning: {
    id: 'deep_learning',
    label: 'Deep Learning Revolution',
    years: '2012 – 2016',
    color: '#8F7044', // Polished Bronze
    glowColor: 'rgba(143, 112, 68, 0.22)',
    bgBadge: 'bg-stone-900/60 text-amber-300 border-stone-700/40',
    description: 'GPU scaling, ImageNet benchmark breakthroughs, and AlexNet impact.',
  },
  transformer_era: {
    id: 'transformer_era',
    label: 'Attention & Transformers',
    years: '2017 – 2021',
    color: '#925B49', // Archival Rust / Terra
    glowColor: 'rgba(146, 91, 73, 0.22)',
    bgBadge: 'bg-stone-900/60 text-orange-300 border-stone-700/40',
    description: 'Self-attention, BERT bidirectional masked modeling, and GPT-3 scaling.',
  },
  generative_ai: {
    id: 'generative_ai',
    label: 'Generative AI & Scaling',
    years: '2022 – Present',
    color: '#D6B875', // Champagne Gold
    glowColor: 'rgba(214, 184, 117, 0.25)',
    bgBadge: 'bg-amber-950/40 text-amber-200 border-amber-600/30',
    description: 'Diffusion models, conversational LLMs, code generation, and frontier scaling.',
  },
};

export const ALL_ERAS = Object.keys(ERA_CONFIG) as Era[];
