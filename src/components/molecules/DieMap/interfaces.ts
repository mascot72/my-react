export interface WaferPoint {
  chipIndexX: number
  chipIndexY: number
  chipX: number
  chipY: number
  siteSeq: number
  value: number
  name: string
  absX?: number
  absY?: number
}

export interface WaferSpec {
  waferSize: number // mm
  chipSizeX: number // nm
  chipSizeY: number // nm
  offsetX: number // nm
  offsetY: number // nm
}
