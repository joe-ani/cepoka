export const COLORS = [
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'brown', name: 'Brown', hex: '#964B00' },
  { id: 'blonde', name: 'Blonde', hex: '#E6BE8A' },
  { id: 'red', name: 'Red', hex: '#8B0000' },
  { id: 'grey', name: 'Grey', hex: '#808080' },
  { id: 'platinum', name: 'Platinum', hex: '#E5E4E2' },
  { id: 'burgundy', name: 'Burgundy', hex: '#800020' },
  { id: 'mixed', name: 'Mixed', hex: 'linear-gradient(45deg, #E6BE8A, #964B00, #000000)' },
] as const;

export type ColorId = typeof COLORS[number]['id'];
