export type DecoType = 'flowers' | 'trees' | 'leaves' | 'petals' | 'snow' | 'rocks';

export interface ThemeColors {
  grassMain: string;
  grassInner: string;
  pathBase: string;
  pathPower: string;
  pathEdge: string;
  stepPattern: string;
  tuft: string;
}

export interface GameTheme {
  id: string;
  emoji: string;
  name: string;
  minDistance: number;
  decoration: DecoType;
  colors: ThemeColors;
}

export const THEMES: GameTheme[] = [
  {
    id: 'park',
    emoji: '🌳',
    name: '공원 산책길',
    minDistance: 0,
    decoration: 'flowers',
    colors: {
      grassMain:   '#7EC89A',
      grassInner:  '#A3D4B8',
      pathBase:    '#DDD0B0',
      pathPower:   '#EDD9A8',
      pathEdge:    '#BEA882',
      stepPattern: 'rgba(160,120,70,0.25)',
      tuft:        '#5A9E78',
    },
  },
  {
    id: 'forest',
    emoji: '🌲',
    name: '숲길',
    minDistance: 500,
    decoration: 'trees',
    colors: {
      grassMain:   '#2D6A4F',
      grassInner:  '#1B4332',
      pathBase:    '#5C4A32',
      pathPower:   '#7A6040',
      pathEdge:    '#3D2B1F',
      stepPattern: 'rgba(80,50,20,0.35)',
      tuft:        '#1A3A28',
    },
  },
  {
    id: 'autumn',
    emoji: '🍁',
    name: '단풍길',
    minDistance: 1000,
    decoration: 'leaves',
    colors: {
      grassMain:   '#B5651D',
      grassInner:  '#CD853F',
      pathBase:    '#D4A86C',
      pathPower:   '#E8C080',
      pathEdge:    '#A07040',
      stepPattern: 'rgba(140,80,30,0.3)',
      tuft:        '#8B4513',
    },
  },
  {
    id: 'cherry',
    emoji: '🌸',
    name: '벚꽃길',
    minDistance: 2000,
    decoration: 'petals',
    colors: {
      grassMain:   '#F2A8C0',
      grassInner:  '#F8C8D4',
      pathBase:    '#EDD8E0',
      pathPower:   '#F8E4E8',
      pathEdge:    '#D4A0B0',
      stepPattern: 'rgba(200,130,160,0.25)',
      tuft:        '#C87090',
    },
  },
  {
    id: 'snow',
    emoji: '❄️',
    name: '눈길',
    minDistance: 3000,
    decoration: 'snow',
    colors: {
      grassMain:   '#A8C8E0',
      grassInner:  '#C8E0F0',
      pathBase:    '#E8EEF4',
      pathPower:   '#F0F4F8',
      pathEdge:    '#A0B8CC',
      stepPattern: 'rgba(120,160,200,0.2)',
      tuft:        '#7090A8',
    },
  },
  {
    id: 'mountain',
    emoji: '⛰️',
    name: '산길',
    minDistance: 5000,
    decoration: 'rocks',
    colors: {
      grassMain:   '#6B7C5A',
      grassInner:  '#8B9C6A',
      pathBase:    '#A09070',
      pathPower:   '#B8A880',
      pathEdge:    '#706050',
      stepPattern: 'rgba(90,70,40,0.3)',
      tuft:        '#4A5C38',
    },
  },
];

export function getThemeByDistance(meters: number): GameTheme {
  for (let i = THEMES.length - 1; i >= 0; i--) {
    if (meters >= THEMES[i].minDistance) return THEMES[i];
  }
  return THEMES[0];
}
