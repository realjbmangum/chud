// Heirloom Typography
export const Typography = {
  // Font families (loaded via expo-font)
  fonts: {
    serif: 'Cormorant-Garamond',
    serifBold: 'Cormorant-Garamond-Bold',
    sans: 'Inter',
    sansMedium: 'Inter-Medium',
    sansBold: 'Inter-Bold',
    script: 'GreatVibes',
  },

  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;
