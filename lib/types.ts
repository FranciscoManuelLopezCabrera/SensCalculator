export type Confidence = 'A' | 'B' | 'C'

export interface SensInputSpec {
  min: number
  max: number
  step: number
  decimals: number
}

export interface ProEdpiRange {
  low: number
  typical: number
  high: number
}

export interface Game {
  slug: string
  name: string
  engine: string
  yaw: number | null
  scaleLabel: string
  input: SensInputSpec
  confidence: Confidence
  confidenceNote?: string
  proEdpi?: ProEdpiRange
  aliases?: string[]
}
