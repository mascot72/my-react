/**
 * WaferFieldCDU_V6 공유 타입 정의
 */

import type { SemPoint } from '../../../../types/semPoint'

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

/**
 * SEM 포인트를 포함한 hierarchical 포인트 데이터
 * 
 * === 계층 구조 (Hierarchy) ===
 * Wafer
 *   └─ Field (fieldGridX, fieldGridY)  <- 중앙 기준 그리드 좌표
 *       └─ Die (dieCol, dieRow)        <- Field 내 상대 인덱스
 *           └─ SemPoints[]              <- Die 내부 상대좌표 포함
 * 
 * === 값의 의미 ===
 * - FieldPointWithSemPoints.value
 *   = (모든 포함 SemPoint의 value 평균)
 * - DieGroupedSemPoints.value  
 *   = (특정 Die의 SemPoint value 평균)
 * - DiePointWithSemPoints.value
 *   = (Die의 모든 SemPoint value 평균)
 * 
 * === 좌표 체계 ===
 * Field 좌표 (mm, 절대):
 *   - x = fieldGridX * fieldStepX
 *   - y = fieldGridY * fieldStepY
 * 
 * Die 좌표 (mm, Field 내 절대):
 *   - x, y = Die 중심점
 * 
 * SemPoint 좌표 (mm):
 *   - x, y = 절대좌표
 *   - dieLocalX, dieLocalY = Die 내 상대좌표 (die left-bottom 기준)
 */

export interface SemPointWithDieLocal extends SemPoint {
  /** Die 내부 상대 좌표 X (mm, die left-bottom 기준) */
  dieLocalX: number | null
  /** Die 내부 상대 좌표 Y (mm, die left-bottom 기준) */
  dieLocalY: number | null
}

/**
 * Die에 포함된 SEM 포인트 그룹
 */
export interface DieGroupedSemPoints {
  dieCol: number
  dieRow: number
  value: number | null // 이 Die의 SEM 포인트 평균값
  semPoints: SemPointWithDieLocal[]
}

/**
 * SEM 포인트를 포함한 Die 포인트 데이터
 * 
 * 역할: Die 레벨에서 모든 포함 SemPoint에 접근
 * 위치: Wafer > Field > Die
 * 
 * dieLocalX/dieLocalY: Die 내부 상대 좌표
 *   - die의 left-bottom을 원점 (0, 0)
 *   - die의 right-top이 (dieWidth, dieHeight)
 */
export interface DiePointWithSemPoints {
  x: number // mm 단위 die 중심 x 좌표
  y: number // mm 단위 die 중심 y 좌표
  value: number | null // 포함된 SEM 포인트의 평균값
  fieldGridX: number // Field 그리드 X 좌표 (중앙 기준)
  fieldGridY: number // Field 그리드 Y 좌표 (중앙 기준)
  dieCol: number // Field 내 Die 열 인덱스 (left-bottom 기준)
  dieRow: number // Field 내 Die 행 인덱스 (left-bottom 기준)
  semPoints: SemPointWithDieLocal[] // 포함된 SEM 포인트
}

/**
 * SEM 포인트를 포함한 Field 포인트 데이터
 * 
 * 역할: Field 레벨에서 모든 포함 SemPoint에 접근
 * 위치: Wafer > Field
 * 
 * 특징:
 * - semPoints: 이 Field의 모든 SemPoint (flat)
 * - dieGroupedSemPoints: Die별로 재그룹화된 SemPoint (nested)
 *   → Die 레벨의 분석에 유용
 */
export interface FieldPointWithSemPoints {
  x: number // mm 단위 field 중심 x 좌표
  y: number // mm 단위 field 중심 y 좌표
  value: number | null // 포함된 SEM 포인트의 평균값
  fieldGridX: number // Field 그리드 X 좌표 (중앙 기준)
  fieldGridY: number // Field 그리드 Y 좌표 (중앙 기준)
  semPoints: SemPointWithDieLocal[] // 이 Field의 모든 SEM 포인트
  dieGroupedSemPoints: DieGroupedSemPoints[] // Field 내 Die별로 그룹화된 SEM 포인트
}

/**
 * Hierarchical SEM 포인트 데이터셋
 * 
 * === 위상 (Phase) ===
 * Field > Die > SemPoints
 * 
 * === 통합 기능 ===
 * - usePointData: Die/Field의 CDU 기반 포인트
 * - useSemPointData: SEM 측정 데이터를 hierarchical로 정렬
 * 
 * === 접근 패턴 ===
 * 1. Die 중심 분석: diePointsWithSem → die.semPoints
 * 2. Field 중심 분석: fieldPointsWithSem → field.dieGroupedSemPoints
 * 3. 전체 데이터: allSemPointsMapped (캐시/참조용)
 */
export interface SemPointDataSet {
  diePointsWithSem: DiePointWithSemPoints[] // Die별 포인트 + 소속 SEM 포인트
  fieldPointsWithSem: FieldPointWithSemPoints[] // Field별 포인트 + 소속 SEM 포인트 (Die별 그룹화)
  allSemPointsMapped: any[] // 모든 매핑된 SEM 포인트 (참조용)
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
  showPointLabels?: boolean
  // Grid & Axis styling (ECharts 전용 확장)
  gridLineColor?: string // 그리드 선 색상 (splitLine)
  gridLineWidth?: number // 그리드 선 두께 (px)
  centerAxisCoordinates?: boolean // true면 축 라벨을 중앙(wafer center) 기준 상대 좌표로 표시
  fitToContent?: boolean // true면 축 범위를 필드/포인트 bbox로 맞춤(작아지면 직관적으로 축소)
  // Outside point styling & field fill (SVG/ECharts 공통)
  outsidePointColor?: string
  outsideDiePointOpacity?: number
  outsideFieldPointOpacity?: number
  showFieldFill?: boolean
  fieldFillOpacity?: number
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
  // Rulers & overlays
  showShotRuler?: boolean
  showWaferRadius?: boolean
  shotRulerStepX?: number
  shotRulerStepY?: number
  // SVG mm tick step when Shot Ruler is off
  waferTickStepMm?: number
  // SEM Point data
  semPoints?: SemPoint[] // 외부 SEM 측정 포인트 데이터
  showSemPoints?: boolean // SEM 포인트 표시 여부
  semPointRadiusPx?: number // SEM 포인트 반지름 (px)
  semPointOpacity?: number // SEM 포인트 투명도
  semPointColor?: string // SEM 포인트 색상
  // SEM Point color by palette (선택 사항)
  useSemPointColorFromPalette?: boolean // true면 SEM point value 기반 팔레트 색상 사용
  applyFieldFillFromSemValue?: boolean // true면 Field 배경에 SEM 평균값 기반 팔레트 색상 적용
  applyDieFillFromSemValue?: boolean // true면 Die 배경에 포함된 SEM 포인트 평균값 기반 팔레트 색상 적용
}
