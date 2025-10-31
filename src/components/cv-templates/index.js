import ModernTemplate from './ModernTemplate';
import MinimalTemplate from './MinimalTemplate';
import ElegantTemplate from './ElegantTemplate';

export const CV_TEMPLATE_LIST = [
  {
    id: 'modern',
    name: 'Moderne vibrant',
    description: 'Palette dégradée, colonne latérale pour les informations clés.',
    accent: 'from-purple-500 to-indigo-500',
    component: ModernTemplate,
  },
  {
    id: 'minimal',
    name: 'Minimal & clair',
    description: 'Typographie élégante et mise en page ultra lisible.',
    accent: 'from-slate-300 to-slate-100',
    component: MinimalTemplate,
  },
  {
    id: 'elegant',
    name: 'Élégant & premium',
    description: 'Touches pastel et cartes avec bords arrondis.',
    accent: 'from-emerald-400 to-cyan-400',
    component: ElegantTemplate,
  },
];

export const CV_TEMPLATE_MAP = CV_TEMPLATE_LIST.reduce((acc, template) => {
  acc[template.id] = template.component;
  return acc;
}, {});

export default CV_TEMPLATE_LIST;
