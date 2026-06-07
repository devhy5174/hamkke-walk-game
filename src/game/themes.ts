export type DecoType =
  | "flowers"
  | "trees"
  | "leaves"
  | "petals"
  | "snow"
  | "bamboo"
  | "stars";

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
    id: "park",
    emoji: "🌳",
    name: "공원 산책길",
    minDistance: 0,
    decoration: "flowers",
    colors: {
      grassMain: "#7EC89A",
      grassInner: "#A3D4B8",
      pathBase: "#DDD0B0",
      pathPower: "#EDD9A8",
      pathEdge: "#BEA882",
      stepPattern: "rgba(160,120,70,0.25)",
      tuft: "#5A9E78",
    },
  },
  {
    id: "forest",
    emoji: "🌲",
    name: "숲길",
    minDistance: 150,
    decoration: "trees",
    colors: {
      grassMain: "#2D6A4F",
      grassInner: "#1B4332",
      pathBase: "#5C4A32",
      pathPower: "#7A6040",
      pathEdge: "#3D2B1F",
      stepPattern: "rgba(80,50,20,0.35)",
      tuft: "#1A3A28",
    },
  },
  {
    id: "autumn",
    emoji: "🍁",
    name: "단풍길",
    minDistance: 350,
    decoration: "leaves",
    colors: {
      grassMain: "#B5651D",
      grassInner: "#CD853F",
      pathBase: "#D4A86C",
      pathPower: "#E8C080",
      pathEdge: "#A07040",
      stepPattern: "rgba(140,80,30,0.3)",
      tuft: "#8B4513",
    },
  },
  {
    id: "cherry",
    emoji: "🌸",
    name: "벚꽃길",
    minDistance: 600,
    decoration: "petals",
    colors: {
      grassMain: "#F2A8C0",
      grassInner: "#F8C8D4",
      pathBase: "#EDD8E0",
      pathPower: "#F8E4E8",
      pathEdge: "#D4A0B0",
      stepPattern: "rgba(200,130,160,0.25)",
      tuft: "#C87090",
    },
  },
  {
    id: "snow",
    emoji: "❄️",
    name: "눈길",
    minDistance: 1000,
    decoration: "snow",
    colors: {
      grassMain: "#A8C8E0",
      grassInner: "#C8E0F0",
      pathBase: "#E8EEF4",
      pathPower: "#F0F4F8",
      pathEdge: "#A0B8CC",
      stepPattern: "rgba(120,160,200,0.2)",
      tuft: "#7090A8",
    },
  },
  {
    id: "bamboo",
    emoji: "🎋",
    name: "대나무숲길",
    minDistance: 1500,
    decoration: "bamboo",
    colors: {
      grassMain: "#2E5E2E",
      grassInner: "#1E4A1E",
      pathBase: "#C8AA7A",
      pathPower: "#D8BA8A",
      pathEdge: "#8A6A3A",
      stepPattern: "rgba(90,60,20,0.28)",
      tuft: "#1A4A1A",
    },
  },
  {
    id: "moonlight",
    emoji: "🌙",
    name: "달빛길",
    minDistance: 2000, //TODO : 2000 거리수정
    decoration: "stars",
    colors: {
      grassMain: "#0F0F2E",
      grassInner: "#1A1A4A",
      pathBase: "#1E1E3A",
      pathPower: "#2E2E5A",
      pathEdge: "#0A0A20",
      stepPattern: "rgba(160,160,255,0.18)",
      tuft: "#3A3A6A",
    },
  },
];

export function getThemeByDistance(meters: number): GameTheme {
  for (let i = THEMES.length - 1; i >= 0; i--) {
    if (meters >= THEMES[i].minDistance) return THEMES[i];
  }
  return THEMES[0];
}
