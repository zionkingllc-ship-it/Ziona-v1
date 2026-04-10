// utils/postBackground.ts
import { BackgroundType } from '@/types'

export const postBackgroundMap: Record<BackgroundType, any> = {
  purple: '#6B21A8',
  gold: '#FACC15',
  blue: '#1E3A8A',
  gradientPurple: {
    type: 'gradient',
    colors: ['#6B21A8', '#9333EA'],
  },
  gradientGold: {
    type: 'gradient',
    colors: ['#FACC15', '#EAB308'],
  },
}
