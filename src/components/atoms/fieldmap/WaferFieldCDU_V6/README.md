# WaferFieldCDU_V6 아키텍처 문서

## 구조 개요

```
src/components/atoms/fieldmap/
├── WaferFieldCDU_V6/                    # 모듈화된 Wafer 시뮬레이터
│   ├── index.tsx                        # 메인 컴포넌트 (SVG 렌더링, 좌표 계산)
│   ├── types.ts                         # 공유 타입 정의
│   ├── hooks/
│   │   ├── useCDUData.ts               # CDU 생성, Field/Die 구조 생성, Offset 필터링
│   │   ├── useMergeGroups.ts           # 병합 알고리즘 (on/off 제어 가능)
│   │   ├── useFieldRenderItems.ts      # 렌더링 아이템 계산
│   │   └── index.ts
│   └── components/
│       ├── WaferOutline.tsx            # 웨이퍼 원형 테두리 (Offset 적용)
│       ├── ColorBar.tsx                # CDU 컬러 바
│       ├── FieldGroup.tsx              # Shot Index + Die Grid 렌더링
│       ├── DieRect.tsx                 # 개별 Die CDU 값 표시
│       ├── MergeGroupRect.tsx          # 병합된 영역 렌더링
│       └── index.ts
└── WaferFieldCDURealisticV6.tsx         # 하위 호환성 래퍼
```

## 핵심 개념

### Wafer 표준 개념 (산업 표준)
- **Wafer**: 원형 반도체 기판 (반지름 150mm)
- **Die**: 직사각형 회로 단위 (Field 내 고정 배치)
- **Field**: Die들의 그룹 (가로 M×세로 N 개 Die 포함)
- **Shot**: Lithography 노광 단위 (Field와 같음)
- **Offset**: Wafer의 상대적 위치 편차 (정렬 오차 시뮬레이션)

**핵심**: 
- **Die Rect** (고정): SVG viewBox 중심, offset 미적용
- **Wafer Circle** (이동): Offset 만큼 이동 (`<g transform>`)
- **Die 필터링** (동적): Wafer Circle 내부의 Die만 표시 (offset 고려)

### 주요 특징

#### 1. Offset 처리 (표준 Wafer 개념)
Offset은 Wafer의 위치 편차를 나타냅니다:
- **Die Grid는 고정** - 절대 좌표계 (SVG viewBox)
- **Wafer Circle만 이동** - offset만큼 translate 적용
- **Die 데이터 필터링** - Wafer Circle 내부의 Die만 렌더링

```tsx
// 계산 원리
offsetMmX = offsetMicrometers[0] / 1000  // μm → mm 변환
offsetPxX = mm2px(offsetMmX)             // mm → px 변환
// viewBox는 offset 미적용 (고정)
// Wafer Circle: <g transform={`translate(${offsetPxX} ${offsetPxY})`}>
```

#### 2. Dynamic Field Array Size
필드 그리드 개수를 동적으로 조정:
- X축: 1~999 필드 개수
- Y축: 1~999 필드 개수  
- 중심 기준 좌우상하 분배

```tsx
fieldArraySize={[15, 12]}  // X: 15개, Y: 12개
```

#### 3. Dynamic Field Size
각 필드의 물리적 크기를 마이크로미터 단위로 조정:
- Width: 1~99999 μm (기본 20000 μm = 20 mm)
- Height: 1~99999 μm (기본 30000 μm = 30 mm)
- Die 크기 자동 조정 (필드 크기 / Die 개수)

```tsx
fieldSizeMicrometers={[25000, 35000]}  // 25mm × 35mm
```

#### 4. Offset (Lithography 정렬 오차)
Wafer의 상대적 위치 편차를 시뮬레이션:
- X축: -99999~99999 μm
- Y축: -99999~99999 μm
- **효과**: Wafer Circle이 offset만큼 이동하여 다른 Die 렌더링

```tsx
offsetMicrometers={[1000, -500]}  // X: +1000μm, Y: -500μm
// Die 필터링 시: Math.hypot(d.x - offset[0], d.y - offset[1]) <= waferRadius
```

## Hook 상세 설명

### useCDUData
Die 구조와 CDU 값을 생성합니다. **Offset 필터링을 여기서 처리합니다.**

**주요 기능**:
- Field/Die 그리드 자동 생성
- CDU 값 생성 또는 외부 데이터 주입
- Shot Index 자동 부여 (left-top → right-bottom)
- **Offset 고려한 Die 필터링**: `included` 플래그

**Core 로직**:
```tsx
// Field 필터링: Wafer Circle 내부 Field 판단
const anyDieCenterInside = dies.some((d) => {
  const dxWithOffset = d.x - offsetMm[0]
  const dyWithOffset = d.y - offsetMm[1]
  return Math.hypot(dxWithOffset, dyWithOffset) <= waferRadius
})

// Die 필터링: 모든 Corner가 Wafer Circle 내부
const allCornersInside = corners.every(([cx_, cy_]) => {
  const cxWithOffset = cx_ - offsetMm[0]
  const cyWithOffset = cy_ - offsetMm[1]
  return Math.hypot(cxWithOffset, cyWithOffset) <= waferRadius + 1e-9
})
```

**Interface**:
```tsx
interface UseCDUDataOptions {
  waferRadius: number         // 150 (mm)
  fieldStepX: number         // X축 Field 간격
  fieldStepY: number         // Y축 Field 간격
  dieRows: number            // Field 내 Die 행 개수 (기본: 3)
  dieCols: number            // Field 내 Die 열 개수 (기본: 2)
  dieWidth: number           // 단일 Die 너비 (mm)
  dieHeight: number          // 단일 Die 높이 (mm)
  fieldWidth: number         // Field 너비 (mm)
  fieldHeight: number        // Field 높이 (mm)
  range: number              // 그리드 범위
  fieldArraySize?: [number, number]  // [x개수, y개수]
  cduSeed?: number           // 난수 시드
  cduData?: (number | null)[]  // 외부 CDU 데이터
  offsetMm?: [number, number]  // Wafer Offset (mm)
}
```

### useMergeGroups
인접한 Die의 CDU 값이 유사하면 그룹으로 병합합니다. (Optional)

```tsx
const { fieldsWithMerge } = useMergeGroups({
  fields,
  enabled: true,
  mergeThreshold: 0.05,  // CDU 차이 임계값
})
```

### useFieldRenderItems
SVG 렌더링용 데이터 구조를 계산합니다.

```tsx
const fieldRenderItems = useFieldRenderItems({
  fields: fieldsWithMerge,
  dieWidth,
  dieHeight,
})
```

## 사용 예제

### 기본 사용 (하위 호환성)
```tsx
import WaferFieldCDURealisticV6 from '@/components/atoms/fieldmap/WaferFieldCDURealisticV6'

export default function WaferMapPage() {
  return (
    <WaferFieldCDURealisticV6
      cduSeed={123456789}
      zoom={1}
      showValues={true}
      onFieldHover={(info, clientX, clientY) => {
        if (info) console.log(`Field: ${info.id}, CDU: ${info.avgCdu}`)
      }}
    />
  )
}
```

### 고급 사용 (동적 제어)
```tsx
import WaferFieldCDU_V6 from '@/components/atoms/fieldmap/WaferFieldCDU_V6'
import { useState } from 'react'

export default function WaferPlayground() {
  const [fieldArraySize, setFieldArraySize] = useState<[number, number]>([10, 10])
  const [offsetMicrometers, setOffsetMicrometers] = useState<[number, number]>([0, 0])
  const [fieldSizeMicrometers, setFieldSizeMicrometers] = useState<[number, number]>([20000, 30000])

  return (
    <div>
      <label>
        Field Array Size X:
        <input
          type="number"
          min={1}
          max={999}
          value={fieldArraySize[0]}
          onChange={(e) => setFieldArraySize([Number(e.target.value), fieldArraySize[1]])}
        />
      </label>

      <label>
        Offset X (μm):
        <input
          type="number"
          value={offsetMicrometers[0]}
          onChange={(e) => setOffsetMicrometers([Number(e.target.value), offsetMicrometers[1]])}
        />
      </label>

      <label>
        Field Size Width (μm):
        <input
          type="number"
          value={fieldSizeMicrometers[0]}
          onChange={(e) => setFieldSizeMicrometers([Number(e.target.value), fieldSizeMicrometers[1]])}
        />
      </label>

      <WaferFieldCDU_V6
        cduSeed={12345}
        fieldArraySize={fieldArraySize}
        offsetMicrometers={offsetMicrometers}
        fieldSizeMicrometers={fieldSizeMicrometers}
        mergeOptions={{ enabled: true, threshold: 0.05 }}
        showFullGrid={false}
      />
    </div>
  )
}
```

### Offset 효과 시뮬레이션
```tsx
// Wafer Circle이 [1000, -500] μm만큼 이동
// Die는 고정, offset 위치의 Die만 필터링되어 표시
<WaferFieldCDU_V6
  offsetMicrometers={[1000, -500]}
  fieldArraySize={[10, 10]}
/>
```

### 외부 CDU 데이터 주입
```tsx
const cduData = [0.1, 0.2, -0.1, 0.3, ...]  // flat 1D array

<WaferFieldCDU_V6
  cduData={cduData}
  mergeOptions={{ enabled: false }}  // 병합 비활성화
/>
```

## 타입 정의

```tsx
interface WaferFieldCDU_V6Props {
  // CDU 데이터
  cduSeed?: number                       // 난수 시드
  cduData?: (number | null)[]            // 외부 CDU 데이터

  // 렌더링 제어
  zoom?: number                          // 줌 배율 (기본: 1)
  showValues?: boolean                   // CDU 값 표시 여부 (기본: true)
  onFieldHover?: (info | null, clientX, clientY) => void

  // 병합 알고리즘
  mergeOptions?: {
    enabled?: boolean                    // 활성화 (기본: true)
    threshold?: number                   // 임계값 (기본: 0.05)
  }

  // 디스플레이 토글
  showFullGrid?: boolean                 // Wafer 외부 필드도 표시 (기본: false)
  viewDieSequence?: boolean              // Die Sequence 번호 표시 (기본: false)
  viewDieIndex?: boolean                 // Die Index 표시 (기본: false)

  // 동적 제어
  fieldArraySize?: [number, number]      // [x개수, y개수] (기본: [10, 10])
  offsetMicrometers?: [number, number]   // [x, y] μm (기본: [0, 0])
  fieldSizeMicrometers?: [number, number] // [width, height] μm (기본: [20000, 30000])

  // 콜백 (비권장 - 상위 컴포넌트에서 state 관리 권장)
  onFieldArraySizeChange?: (size: [number, number]) => void
  onOffsetMicrometersChange?: (offset: [number, number]) => void
  onFieldSizeMicrometersChange?: (size: [number, number]) => void
}

interface Die {
  x: number
  y: number
  cdu: number | null
  dieIndex?: number      // Field 내 Die 인덱스
  dieSequence?: number   // 전역 Die 시퀀스
}

interface Field {
  cx: number             // Field 중심 X
  cy: number             // Field 중심 Y
  dies: Die[]
  shotIndex?: number     // 0부터 시작 (left-top → right-bottom)
  included?: boolean     // Wafer Circle 내부인지 여부
}
```

## Shot Index, Die Index, Die Sequence

### Shot Index (필드 단위)
- 각 Field의 고유 번호 (0부터 시작)
- 순서: 좌상단 → 우측 → ... → 우하단 (좌에서 우, 위에서 아래)
- FieldGroup 컴포넌트의 좌상단에 **파란색**으로 표시
- `item.shotIndex`로 접근

```
[0] [1] [2]
[3] [4] [5]
[6] [7] [8]
```

### Die Index (Die 단위, Field별 독립)
- 각 Field 내 Die의 상대적 번호 (0부터 시작)
- Field 기준 좌상단 → 우측 → ... → 우하단
- DieRect 컴포넌트의 좌상단에 **회색**으로 표시 (viewDieIndex=true)
- `die.dieIndex`로 접근

### Die Sequence (전역 절대 번호)
- 전체 rectangular grid에서의 monotonic 시퀀스
- Corner 필드도 포함하여 계산 (showFullGrid=true 시 볼 수 있음)
- 좌상단 → 우측 → ... → 우하단
- `die.dieSequence`로 접근

## 성능 최적화

### 렌더링 최적화
- **useMemo**: 각 hook에서 의존성 배열 관리
- **컴포넌트 분리**: FieldGroup, DieRect, MergeGroupRect 독립 렌더링
- **Conditional Rendering**: `included` 플래그로 불필요한 Die 스킵

### 병합 알고리즘 성능
- 병합 활성화: Wafer 내 유사 CDU Die 그룹화 → 렌더링 아이템 감소
- 병합 비활성화: 모든 Die를 개별 렌더링 (정확성 우선)

**권장사항**:
- 필드 < 100개: 병합 활성화 가능
- 필드 > 100개: 병합 비활성화 또는 threshold 증가 고려

## 확장 가능성

### 새로운 Hook 추가
`src/components/atoms/fieldmap/WaferFieldCDU_V6/hooks/`에 추가:
```tsx
// useCustomFilter.ts
export function useCustomFilter(options: CustomFilterOptions) {
  return useMemo(() => {
    // 커스텀 필터링 로직
  }, [/* 의존성 */])
}
```

### 새로운 컴포넌트 추가
`src/components/atoms/fieldmap/WaferFieldCDU_V6/components/`에 추가:
```tsx
// CustomOverlay.tsx
export function CustomOverlay({ ...props }) {
  return <g>{/* 커스텀 렌더링 */}</g>
}
```

### Offset 정렬 검증
Offset의 정렬 검증을 위해 통계 정보 추가:
```tsx
// useCDUData에 통계 정보 추가
const statistics = {
  totalDieInWafer: number
  diePerField: number
  offsetShift: [x, y]  // Wafer Circle 이동량
}
```

## 문제 해결

### Offset이 적용되지 않음
- `offsetMicrometers` 속성 확인
- `useCDUData` 호출 시 `offsetMm` 파라미터 전달 확인
- useMemo 의존성에 `offsetMm` 포함되어 있는지 확인

### Die가 Wafer 밖에 보임
- `included` 플래그 확인 (useCDUData에서 계산됨)
- `showFullGrid={false}` 확인
- Offset 값과 Field 크기 검증

### 성능 저하
- `mergeOptions.enabled=false` 시도
- `fieldArraySize` 감소 고려
- 브라우저 DevTools에서 렌더링 프로파일링

## 참고사항

- **Wafer 반지름**: 150mm (고정)
- **Die/Field 구조**: Offset 변경 시에만 필터링 재계산 (useMemo 의존성)
- **좌표계**: SVG 좌표 (0,0 중심, Y축 하향)
- **단위**: 내부 계산은 mm, 외부 API는 μm (자동 변환)

