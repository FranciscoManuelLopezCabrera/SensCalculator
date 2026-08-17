import type { Game } from './types'

export const REFERENCE_YAW = 0.022

export const GAMES: Game[] = [
  {
    slug: 'cs2',
    name: 'Counter-Strike 2',
    engine: 'Source 2',
    yaw: 0.022,
    scaleLabel: 'sens',
    input: { min: 0.0001, max: 100, step: 0, decimals: 6 },
    confidence: 'A',
    proEdpi: { low: 600, typical: 800, high: 1100 },
    aliases: ['csgo', 'counter-strike']
  },
  {
    slug: 'valorant',
    name: 'Valorant',
    engine: 'Unreal Engine 4',
    yaw: 0.07,
    scaleLabel: 'sens',
    input: { min: 0.001, max: 10, step: 0.001, decimals: 3 },
    confidence: 'A',
    proEdpi: { low: 200, typical: 260, high: 320 }
  },
  {
    slug: 'apex-legends',
    name: 'Apex Legends',
    engine: 'Source modificado',
    yaw: 0.022,
    scaleLabel: 'sens',
    input: { min: 0.1, max: 20, step: 0.01, decimals: 3 },
    confidence: 'A',
    proEdpi: { low: 800, typical: 1200, high: 1600 }
  },
  {
    slug: 'overwatch-2',
    name: 'Overwatch 2',
    engine: 'Motor propietario de Blizzard',
    yaw: 0.0066,
    scaleLabel: 'sens',
    input: { min: 1, max: 100, step: 1, decimals: 0 },
    confidence: 'A',
    proEdpi: { low: 3000, typical: 4000, high: 6000 },
    aliases: ['ow2', 'overwatch']
  },
  {
    slug: 'marvel-rivals',
    name: 'Marvel Rivals',
    engine: 'Unreal Engine 5',
    yaw: 0.0066,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 100, step: 0.01, decimals: 2 },
    confidence: 'A',
    proEdpi: { low: 3000, typical: 4000, high: 6000 }
  },
  {
    slug: 'call-of-duty',
    name: 'Call of Duty (MW / Warzone / Black Ops)',
    engine: 'IW 8/9',
    yaw: 0.0066,
    scaleLabel: 'sens',
    input: { min: 1, max: 20, step: 1, decimals: 0 },
    confidence: 'A',
    confidenceNote: 'El ajuste Mouse Sensitivity Multiplier multiplica el yaw efectivo.',
    proEdpi: { low: 4000, typical: 4800, high: 7000 },
    aliases: ['warzone', 'cod', 'black-ops']
  },
  {
    slug: 'fortnite',
    name: 'Fortnite',
    engine: 'Unreal Engine 5',
    yaw: 0.005555,
    scaleLabel: '%',
    input: { min: 0, max: 100, step: 0.1, decimals: 1 },
    confidence: 'A',
    confidenceNote: 'La sensibilidad es un porcentaje; el yaw indicado corresponde a 1 %.',
    proEdpi: { low: 4000, typical: 5600, high: 8000 }
  },
  {
    slug: 'deadlock',
    name: 'Deadlock',
    engine: 'Source 2',
    yaw: 0.044,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 30, step: 0.01, decimals: 2 },
    confidence: 'A'
  },
  {
    slug: 'quake-champions',
    name: 'Quake Champions',
    engine: 'id Tech',
    yaw: 0.022,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 30, step: 0.01, decimals: 3 },
    confidence: 'A'
  },
  {
    slug: 'halo-infinite',
    name: 'Halo Infinite',
    engine: 'Slipspace',
    yaw: 0.022,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 30, step: 0.01, decimals: 3 },
    confidence: 'A'
  },
  {
    slug: 'source-games',
    name: 'Juegos Source (TF2, HL2, L4D2, Titanfall 2)',
    engine: 'Source',
    yaw: 0.022,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 30, step: 0.01, decimals: 3 },
    confidence: 'A',
    aliases: ['tf2', 'team-fortress-2', 'titanfall-2']
  },
  {
    slug: 'rainbow-six-siege',
    name: 'Rainbow Six Siege',
    engine: 'AnvilNext 2.0',
    yaw: 0.00572958,
    scaleLabel: 'sens',
    input: { min: 1, max: 100, step: 1, decimals: 0 },
    confidence: 'B',
    confidenceNote: 'Varias fuentes describen dependencia del ajuste de FOV. Calibra si el resultado no encaja.',
    aliases: ['r6', 'siege']
  },
  {
    slug: 'escape-from-tarkov',
    name: 'Escape from Tarkov',
    engine: 'Unity',
    yaw: 0.125,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 5, step: 0.01, decimals: 2 },
    confidence: 'B',
    confidenceNote: 'Valor derivado de forma indirecta y sin confirmación oficial.',
    aliases: ['tarkov', 'eft']
  },
  {
    slug: 'battlefield-6',
    name: 'Battlefield 6 / 2042',
    engine: 'Frostbite',
    yaw: 0.0022,
    scaleLabel: '%',
    input: { min: 0, max: 100, step: 1, decimals: 0 },
    confidence: 'B',
    confidenceNote: 'Las fuentes publican 0.0022 y 0.0066. Se usa 0.0022; calibra para confirmarlo.'
  },
  {
    slug: 'destiny-2',
    name: 'Destiny 2',
    engine: 'Tiger',
    yaw: 0.0066,
    scaleLabel: 'sens',
    input: { min: 1, max: 20, step: 1, decimals: 0 },
    confidence: 'B',
    confidenceNote: 'Tiene tope de velocidad de giro al esprintar, que rompe la linealidad en ese estado.'
  },
  {
    slug: 'delta-force',
    name: 'Delta Force',
    engine: 'Unreal Engine modificado',
    yaw: 0.022,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 30, step: 0.01, decimals: 2 },
    confidence: 'B',
    confidenceNote: 'Fuente única sin verificar.'
  },
  {
    slug: 'pubg',
    name: 'PUBG: Battlegrounds',
    engine: 'Unreal Engine',
    yaw: null,
    scaleLabel: 'sens',
    input: { min: 1, max: 100, step: 1, decimals: 0 },
    confidence: 'C',
    confidenceNote: 'Escala no lineal y ajustes independientes por mira. Requiere calibración propia.'
  },
  {
    slug: 'the-finals',
    name: 'THE FINALS',
    engine: 'Unreal Engine 5',
    yaw: null,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 100, step: 0.01, decimals: 2 },
    confidence: 'C',
    confidenceNote: 'Los datos publicados se contradicen en un factor de ~30. Requiere calibración propia.'
  },
  {
    slug: 'rust',
    name: 'Rust',
    engine: 'Unity',
    yaw: null,
    scaleLabel: 'sens',
    input: { min: 0.01, max: 10, step: 0.01, decimals: 2 },
    confidence: 'C',
    confidenceNote: 'El escalado ha cambiado entre actualizaciones. Requiere calibración propia.'
  },
  {
    slug: 'heroes-and-generals',
    name: 'Heroes & Generals',
    engine: 'Retox',
    yaw: null,
    scaleLabel: 'sens',
    input: { min: 0.0001, max: 100, step: 0, decimals: 6 },
    confidence: 'C',
    confidenceNote: 'Los servidores oficiales cerraron; la entrada cubre el build 2023 que ejecutan los proyectos comunitarios (HeroesNGenerals Sunrise). El yaw solo tiene una fuente y el cliente cambió el cálculo del movimiento del ratón a finales de 2016, así que no se publica constante. Los límites de entrada tampoco están verificados: la sensibilidad numérica solo se fija por consola y ninguna fuente pública documenta su rango. Requiere calibración propia.',
    aliases: ['hg', 'hng', 'heroes-generals']
  }
]

export function getGame(slug: string): Game | undefined {
  return GAMES.find(game => game.slug === slug || game.aliases?.includes(slug))
}

export function tierAGames(): Game[] {
  return GAMES.filter(game => game.confidence === 'A')
}
