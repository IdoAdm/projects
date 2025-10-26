export const FONT_THEMES = {
  default: { name: { en: 'Vena', he: 'וֶנָה' }, heading: "[font-family:'Poppins',Inter,system-ui,sans-serif]", body: "[font-family:Inter,system-ui,sans-serif]", lang: ['en'] as const },
  serif: { name: { en: 'Elegant Serif', he: 'סריף אלגנטי' }, heading: "[font-family:'Playfair Display',serif]", body: "[font-family:'Lora',serif]", lang: ['en'] as const },
  modern: { name: { en: 'Modern Sans', he: 'סאנס מודרני' }, heading: "[font-family:'Montserrat',sans-serif]", body: "[font-family:'Lato',sans-serif]", lang: ['en'] as const },
  minimal: { name: { en: 'Minimalist', he: 'מינימליסטי' }, heading: "[font-family:'Roboto',sans-serif]", body: "[font-family:'Roboto',sans-serif]", lang: ['en'] as const },
  hebrew_default: { name: { en: 'Hebrew (Default)', he: 'עברית (ברירת מחדל)' }, heading: "[font-family:'Heebo','Assistant',system-ui,sans-serif]", body: "[font-family:'Assistant','Heebo',system-ui,sans-serif]", lang: ['he'] as const },
  hebrew_serif: { name: { en: 'Hebrew (Serif)', he: 'עברית (סריף)' }, heading: "[font-family:'Frank Ruhl Libre','Heebo',serif]", body: "[font-family:'Assistant',system-ui,sans-serif]", lang: ['he'] as const },
  hebrew_rounded: { name: { en: 'Hebrew (Rounded)', he: 'עברית (מעוגל)' }, heading: "[font-family:'Varela Round','Rubik',sans-serif]", body: "[font-family:'Rubik','Assistant',sans-serif]", lang: ['he'] as const }
} as const;

export const COLOR_PALETTE = {
  primary: [
    { class: 'bg-blue-600', name: 'Ocean Blue', hex: '#2563EB' },
    { class: 'bg-emerald-600', name: 'Emerald Green', hex: '#059669' },
    { class: 'bg-purple-600', name: 'Royal Purple', hex: '#9333EA' },
    { class: 'bg-rose-600', name: 'Warm Rose', hex: '#E11D48' },
    { class: 'bg-slate-800', name: 'Charcoal', hex: '#1E293B' },
    { class: 'bg-amber-600', name: 'Golden Amber', hex: '#D97706' },
    { class: 'bg-sky-500', name: 'Sky Blue', hex: '#0EA5E9' },
    { class: 'bg-indigo-500', name: 'Deep Indigo', hex: '#6366F1' },
  ],
  secondary: [
    { class: 'text-blue-600', name: 'Ocean Blue', hex: '#2563EB' },
    { class: 'text-emerald-600', name: 'Emerald Green', hex: '#059669' },
    { class: 'text-purple-600', name: 'Royal Purple', hex: '#9333EA' },
    { class: 'text-rose-600', name: 'Warm Rose', hex: '#E11D48' },
    { class: 'text-slate-600', name: 'Charcoal', hex: '#475569' },
    { class: 'text-amber-600', name: 'Golden Amber', hex: '#D97706' },
    { class: 'text-sky-500', name: 'Sky Blue', hex: '#0EA5E9' },
    { class: 'text-indigo-500', name: 'Deep Indigo', hex: '#6366F1' },
  ],
  background: [
    { class: 'bg-white', name: 'Pure White', hex: '#FFFFFF' },
    { class: 'bg-slate-50', name: 'Light Gray', hex: '#F8FAFC' },
    { class: 'bg-gray-100', name: 'Soft Gray', hex: '#F3F4F6' },
    { class: 'bg-zinc-100', name: 'Zinc Gray', hex: '#F4F4F5' },
    { class: 'bg-stone-50', name: 'Stone White', hex: '#FAFAF9' },
    { class: 'bg-amber-50', name: 'Warm Cream', hex: '#FFFBEB' },
    { class: 'bg-green-50', name: 'Mint Fresh', hex: '#F0FDF4' },
    { class: 'bg-sky-50', name: 'Cloud Blue', hex: '#F0F9FF' },
    { class: 'bg-indigo-50', name: 'Lavender Mist', hex: '#EEF2FF' },
  ],
};

export const OPACITY_OPTIONS = ['bg-opacity-100', 'bg-opacity-90', 'bg-opacity-80', 'bg-opacity-70'];
