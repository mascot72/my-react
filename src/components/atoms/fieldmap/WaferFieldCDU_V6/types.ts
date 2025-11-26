/**
 * WaferFieldCDU_V6 공유 타입 정의
 */

export interface Die {
  x: number
  y: number
  cdu: number | null
  mergeGroup?: number | null
  dieIndex?: number // field 내 die 인덱스 (left-bottom → right-top)
  dieSequence?: number // 전역 die 시퀀스 (left-top → right-bottom)
}

export interface Field {
  cx: number
  cy: number
  dies: Die[]
  shotIndex?: number // left-top to right-bottom 순서의 shot 인덱스
  included?: boolean // wafer 내부 관련해서 이 필드가 기본 보여지는 필드인지
}

export interface MergeGroup {
  id: number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  cdu: number | null
}

export interface FieldRenderItem {
  fieldRect: { x: number; y: number; w: number; h: number }
  singleDies: Die[]
  mergeGroups: MergeGroup[]
  fieldAvgCdu: number | null
  shotIndex?: number
  included?: boolean
}

export interface CDUGeneratorOptions {
  waferRadius: number
  seed?: number
  cduData?: (number | null)[]
}

export interface MergeOptions {
  enabled: boolean
  threshold?: number
}

export interface WaferFieldCDU_V6Props {
  cduSeed?: number
  cduData?: (number | null)[]
  zoom?: number
  showValues?: boolean
  onFieldHover?: (
    info: { id: string; avgCdu: number | null; cx: number; cy: number } | null,
    clientX?: number,
    clientY?: number
  ) => void
  mergeOptions?: MergeOptions
  // Controller props (moved UI controls to external controller)
  showFullGrid?: boolean
  onShowFullGridChange?: (v: boolean) => void
  viewDieSequence?: boolean
  onViewDieSequenceChange?: (v: boolean) => void
  viewDieIndex?: boolean
  onViewDieIndexChange?: (v: boolean) => void
  // Field array size and offset controls
  fieldArraySize?: [number, number] // [x, y] count
  onFieldArraySizeChange?: (size: [number, number]) => void
  offsetMicrometers?: [number, number] // [x, y] in micrometers
  onOffsetMicrometersChange?: (offset: [number, number]) => void
  // Field size in micrometers
  fieldSizeMicrometers?: [number, number] // [width, height] in micrometers
  onFieldSizeMicrometersChange?: (size: [number, number]) => void
}
