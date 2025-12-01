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

// PointData 구조: Die-Map과 Field-Map을 위한 포인트 데이터
export interface DiePoint {
  x: number // mm 단위 x 좌표
  y: number // mm 단위 y 좌표
  value: number | null // CDU 값
  fieldIndex?: number // 소속 필드 인덱스
  dieIndex?: number // 필드 내 die 인덱스
}

export interface FieldPoint {
  x: number // mm 단위 필드 중심 x 좌표
  y: number // mm 단위 필드 중심 y 좌표
  value: number | null // 필드 평균 CDU 값
  shotIndex?: number // shot 인덱스
  fieldGridX?: number // 필드 그리드 X 좌표 (중앙 기준)
  fieldGridY?: number // 필드 그리드 Y 좌표 (중앙 기준)
}

export interface PointDataSet {
  diePoints: DiePoint[] // 모든 die의 포인트 데이터
  fieldPoints: FieldPoint[] // 모든 field의 포인트 데이터
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
  // Point data mode
  enablePointData?: boolean // true면 pointData 기반 렌더링 사용
  viewPoint?: boolean // true면 포인트 렌더링 표시, false면 기존 Rect 렌더링
  // Point render styling
  diePointRadiusPx?: number
  fieldPointRadiusPx?: number
  diePointOpacity?: number
  fieldPointOpacity?: number
  showOutlinesInPointMode?: boolean
  // Controller props (moved UI controls to external controller)
  showFullGrid?: boolean
  onShowFullGridChange?: (v: boolean) => void
  viewDieSequence?: boolean
  onViewDieSequenceChange?: (v: boolean) => void
  viewDieIndex?: boolean
  onViewDieIndexChange?: (v: boolean) => void
  viewShotSequence?: boolean
  onViewShotSequenceChange?: (v: boolean) => void
  // Field array size and offset controls
  fieldArraySize?: [number, number] // [x, y] count
  onFieldArraySizeChange?: (size: [number, number]) => void
  offsetMicrometers?: [number, number] // [x, y] in micrometers
  onOffsetMicrometersChange?: (offset: [number, number]) => void
  // Field size in micrometers
  fieldSizeMicrometers?: [number, number] // [width, height] in micrometers
  onFieldSizeMicrometersChange?: (size: [number, number]) => void
}
