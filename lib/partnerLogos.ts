/** Built-in logo assets used by the public CSS logo cards. */
export const BUILTIN_PARTNER_LOGOS: Record<
  string,
  {
    src: string;
    bg?: string;
  }
> = {
  airindia: { src: '/icons/airindia-logo.png' },
  emirates: { src: '/icons/emirates-logo.png', bg: '#c5342d' },
  etihad: { src: '/icons/etihad-logo.png' },
  qatar: { src: '/icons/qatar-logo.png', bg: '#3e1032' },
  kuwait: { src: '/icons/kuwait-logo.png' },
  indigo: { src: '/icons/indigo-logo.png', bg: '#3c4597' },
  spice: { src: '/icons/spice-logo.png', bg: '#b32b35' },
  airasia: { src: '/icons/airasia-logo.png', bg: '#cd3631' },
  akasaair: { src: '/icons/akasa-logo.png' },
  starair: { src: '/icons/star-logo.png' },
  vistara: { src: '/icons/vistara-logo.png' },
  airindiaexpress: { src: '/icons/airindiaexpress-logo.png' },
  celebi: { src: '/icons/calebi-logo.png' },
  airarabia: { src: '/icons/airarabia-logo.png', bg: '#da364b' },
  american: { src: '/icons/aa-logo.png' },
  airindiasats: { src: '/icons/airindiaexpress-logo.png' },
  bwfs: { src: '/icons/bwfs-logo.png' },
  gaar: { src: '/icons/gaar-logo.png' },
  itc: { src: '/icons/itc-logo.png' },
  harley: { src: '/icons/harley-logo.png' },
  easymytrip: { src: '/icons/easemytrip-logo.png' },
  vfs: { src: '/icons/vfs-logo.png' },
  parkhyat: { src: '/icons/parkhyat-logo.png' },
  theleela: { src: '/icons/leela-logo.png' },
  obroi: { src: '/icons/obroi-logo.png' },
  taj: { src: '/icons/taj-logo.png' },
  jw: { src: '/icons/jw-logo.png' },
  radisson: { src: '/icons/radisson-logo.png' },
  westin: { src: '/icons/westin-logo.png' },
};

export function resolvePartnerLogo(name: string, imageUrl?: string) {
  const custom = String(imageUrl || '').trim();
  if (custom) {
    return { src: custom, bg: undefined as string | undefined, builtin: false };
  }
  const builtin = BUILTIN_PARTNER_LOGOS[String(name || '').toLowerCase()];
  if (builtin) {
    return { src: builtin.src, bg: builtin.bg, builtin: true };
  }
  return { src: '', bg: undefined as string | undefined, builtin: false };
}
