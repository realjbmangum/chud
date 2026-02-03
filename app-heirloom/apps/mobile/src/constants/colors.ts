// Heirloom Brand Colors
export const Colors = {
  heritageGreen: '#0C3B2E',
  heirloomGold: '#C4A464',
  ivoryLinen: '#F8F5EE',
  memoryBlue: '#91A8C0',
  charcoalInk: '#2A2A2A',
  white: '#FFFFFF',
  error: '#E53935',
  success: '#43A047',
} as const;

export type ColorName = keyof typeof Colors;
