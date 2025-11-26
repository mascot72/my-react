# WaferFieldCDU_V6 리팩토링 가이드

## 구조 개요

```
src/components/atoms/fieldmap/
├── WaferFieldCDU_V6/                    # 새로운 모듈화 구조
│   ├── index.tsx                        # 메인 컴포넌트
│   ├── types.ts                         # 공유 타입 정의
│   ├── hooks/
│   │   ├── useCDUData.ts               # CDU 데이터 생성 로직
│   │   ├── useMergeGroups.ts           # 병합 알고리즘 (on/off 제어 가능)
│   │   ├── useFieldRenderItems.ts      # 렌더링 아이템 계산
│   │   └── index.ts
│   └── components/
│       ├── WaferOutline.tsx            # 웨이퍼 테두리
│       ├── ColorBar.tsx                # 컬러 바
│       ├── FieldGroup.tsx              # 필드 그룹 (shot index 표시)
│       ├── DieRect.tsx                 # 개별 다이 렌더링 (die index 표시)
│       ├── MergeGroupRect.tsx          # 병합 그룹 렌더링
│       └── index.ts
└── WaferFieldCDURealisticV6.tsx         # 하위 호환성 래퍼
```

## 주요 개선사항

### 1. Custom Hooks 분리
데이터 로직이 hook으로 분리되어 테스트와 재사용이 용이합니다.

#### useCDUData
- CDU 값 생성 또는 외부 데이터 사용
- 필드/다이 구조 자동 생성
- **shot index 자동 부여** (left-top → right-bottom 순서)
- **fieldArraySize** 기반 동적 필드 범위 계산 (X, Y 범위 별도 처리)

```typescript
const fields = useCDUData({
  waferRadius: 150,
  fieldStepX: 20,
  fieldStepY: 30,
  dieRows: 3,
  dieCols: 2,
  fieldArraySize: [10, 10],  // [x개수, y개수]
  // ... 기타 옵션
});
// fields[i].shotIndex: 0, 1, 2, ...
// fields[i].dies[j].dieIndex: 필드 내 die 순서
// fields[i].dies[j].dieSequence: 전역 die 시퀀스
```

#### useMergeGroups
- 병합 알고리즘 on/off 제어 가능
- threshold 조정 가능

```typescript
const { fieldsWithMerge } = useMergeGroups({
  fields,
  enabled: true,        // 병합 활성화/비활성화
  mergeThreshold: 0.05, // 병합 임계값 조정
});
```

#### useFieldRenderItems
- 렌더링용 데이터 구조 계산
- shot index 포함
- `included` 플래그로 wafer 내부 필드 식별

### 2. 컴포넌트 기반 렌더링
각 렌더링 요소가 독립적인 컴포넌트로 분리:
- `FieldGroup`: 필드 + shot index 표시
- `DieRect`: 개별 다이 + **die index 표시** (선택적)
- `MergeGroupRect`: 병합 그룹
- `WaferOutline`: 웨이퍼 테두리
- `ColorBar`: 컬러 바

### 3. Shot Index 및 Die Index
- **Shot Index**: 각 field의 화면상 왼쪽 위부터 오른쪽 아래로 0부터 증가
  - FieldGroup 컴포넌트의 좌상단에 파란색으로 표시
- **Die Index**: 각 die의 필드 내 순서 (0부터 시작)
  - DieRect 컴포넌트의 좌상단에 회색으로 표시 (toggleable)
- **Die Sequence**: 전역 monotonic 시퀀스 (left-top → right-bottom, 모든 grid 위치 포함)

### 4. 병합 알고리즘 제어
컴포넌트 props로 병합 활성화/비활성화:

```typescript
<WaferFieldCDU_V6
  cduSeed={12345}
  zoom={1.5}
  mergeOptions={{
    enabled: true,        // 병합 활성화
    threshold: 0.05,      // 임계값
  }}
/>
```

또는 병합 비활성화:
```typescript
<WaferFieldCDU_V6
  mergeOptions={{ enabled: false }}
/>
```

### 5. 동적 제어 (WaferController 연동)

#### Field Array Size [X, Y] - 3자리
필드 그리드 개수를 동적으로 조정합니다.
- X: 필드 열 개수 (1~999)
- Y: 필드 행 개수 (1~999)

```typescript
<WaferFieldCDU_V6
  fieldArraySize={[15, 12]}  // 15개 열, 12개 행
  onFieldArraySizeChange={(size) => {
    console.log('New size:', size)
  }}
/>
```

#### Offset [X, Y] - 5자리 (마이크로미터)
전체 wafer 위치를 미크로미터 단위로 오프셋합니다.
- X: X축 오프셋 (-99999 ~ 99999 μm)
- Y: Y축 오프셋 (-99999 ~ 99999 μm)
- 1 μm = 0.001 mm 단위로 SVG viewBox 변환

```typescript
<WaferFieldCDU_V6
  offsetMicrometers={[1000, -500]}  // X: +1000μm, Y: -500μm
  onOffsetMicrometersChange={(offset) => {
    console.log('New offset:', offset)
  }}
/>
```

#### Field Size [W, H] - 5자리 (마이크로미터)
각 필드의 크기를 마이크로미터 단위로 조정합니다.
- W: 필드 폭 (1 ~ 99999 μm)
- H: 필드 높이 (1 ~ 99999 μm)
- 기본값: 20000 × 30000 μm (20 × 30 mm)
- Die 크기는 자동으로 필드 크기에 맞춰 조정됨

```typescript
<WaferFieldCDU_V6
  fieldSizeMicrometers={[25000, 35000]}  // 25 × 35 mm
  onFieldSizeMicrometersChange={(size) => {
    console.log('New field size:', size)
  }}
/>
```

#### 디스플레이 토글
- **전체 사각형 표시**: wafer 외부의 corner 필드도 표시
- **View Die Sequence**: 전역 die 시퀀스 번호 표시
- **View Die Index**: 필드별 die 인덱스 표시

```typescript
<WaferFieldCDU_V6
  showFullGrid={true}        // 모든 그리드 필드 표시
  viewDieSequence={true}     // die sequence 표시
  viewDieIndex={true}        // die index 표시
/>
```

## 사용 예제

### 기본 사용 (하위 호환성 유지)
```typescript
import WaferFieldCDURealisticV6 from '@/components/atoms/fieldmap/WaferFieldCDURealisticV6'

export default function Page() {
  return (
    <WaferFieldCDURealisticV6
      cduSeed={123456789}
      zoom={1}
      showValues={true}
      onFieldHover={(info, clientX, clientY) => {
        if (info) {
          console.log(`Field hovered: ${info.id}, avg CDU: ${info.avgCdu}`)
        }
      }}
    />
  )
}
```

### 고급 사용 (동적 제어)
```typescript
import WaferFieldCDU_V6 from '@/components/atoms/fieldmap/WaferFieldCDU_V6'
import React, { useState } from 'react'

export default function AdvancedPage() {
  const [fieldArraySize, setFieldArraySize] = useState<[number, number]>([10, 10])
  const [offsetMicrometers, setOffsetMicrometers] = useState<[number, number]>([0, 0])
  const [fieldSizeMicrometers, setFieldSizeMicrometers] = useState<[number, number]>([20000, 30000])
  const [showFullGrid, setShowFullGrid] = React.useState(false)

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
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
          Field Array Size Y:
          <input
            type="number"
            min={1}
            max={999}
            value={fieldArraySize[1]}
            onChange={(e) => setFieldArraySize([fieldArraySize[0], Number(e.target.value)])}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Offset X (μm):
          <input
            type="number"
            value={offsetMicrometers[0]}
            onChange={(e) => setOffsetMicrometers([Number(e.target.value), offsetMicrometers[1]])}
          />
        </label>
        <label>
          Offset Y (μm):
          <input
            type="number"
            value={offsetMicrometers[1]}
            onChange={(e) => setOffsetMicrometers([offsetMicrometers[0], Number(e.target.value)])}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Field Size Width (μm):
          <input
            type="number"
            min={1}
            max={99999}
            value={fieldSizeMicrometers[0]}
            onChange={(e) => setFieldSizeMicrometers([Number(e.target.value), fieldSizeMicrometers[1]])}
          />
        </label>
        <label>
          Field Size Height (μm):
          <input
            type="number"
            min={1}
            max={99999}
            value={fieldSizeMicrometers[1]}
            onChange={(e) => setFieldSizeMicrometers([fieldSizeMicrometers[0], Number(e.target.value)])}
          />
        </label>
      </div>

      <label>
        <input
          type="checkbox"
          checked={showFullGrid}
          onChange={(e) => setShowFullGrid(e.target.checked)}
        />
        Show Full Grid
      </label>

      <WaferFieldCDU_V6
        cduSeed={12345}
        fieldArraySize={fieldArraySize}
        onFieldArraySizeChange={setFieldArraySize}
        offsetMicrometers={offsetMicrometers}
        onOffsetMicrometersChange={setOffsetMicrometers}
        fieldSizeMicrometers={fieldSizeMicrometers}
        onFieldSizeMicrometersChange={setFieldSizeMicrometers}
        showFullGrid={showFullGrid}
        mergeOptions={{ enabled: true, threshold: 0.05 }}
      />
    </div>
  )
}
```

### 외부 CDU 데이터 주입
```typescript
const cduData = [0.1, 0.2, -0.1, 0.3, ...] // flat 1차원 배열

<WaferFieldCDU_V6
  cduData={cduData}
  mergeOptions={{ enabled: true }}
/>
```

## 타입 정의

```typescript
interface WaferFieldCDU_V6Props {
  cduSeed?: number                           // CDU 시드값
  cduData?: (number | null)[]                // 외부 CDU 데이터
  zoom?: number                              // 줌 배율 (기본: 1)
  showValues?: boolean                       // 값 표시 여부 (기본: true)
  onFieldHover?: (info, clientX, clientY) => void  // hover 콜백
  mergeOptions?: {
    enabled?: boolean                        // 병합 활성화 (기본: true)
    threshold?: number                       // 병합 임계값 (기본: 0.05)
  }
  // 디스플레이 토글
  showFullGrid?: boolean                     // 전체 사각형 표시 (기본: false)
  onShowFullGridChange?: (v: boolean) => void
  viewDieSequence?: boolean                  // die sequence 표시 (기본: false)
  onViewDieSequenceChange?: (v: boolean) => void
  viewDieIndex?: boolean                     // die index 표시 (기본: false)
  onViewDieIndexChange?: (v: boolean) => void
  // 동적 제어
  fieldArraySize?: [number, number]          // [x개수, y개수] (기본: [10, 10])
  onFieldArraySizeChange?: (size: [number, number]) => void
  offsetMicrometers?: [number, number]       // [x, y] 마이크로미터 (기본: [0, 0])
  onOffsetMicrometersChange?: (offset: [number, number]) => void
  fieldSizeMicrometers?: [number, number]    // [width, height] 마이크로미터 (기본: [20000, 30000])
  onFieldSizeMicrometersChange?: (size: [number, number]) => void
}
```

## Shot Index와 Die Index 활용

### Shot Index (필드 단위)
- 각 필드에 자동 부여 (0부터 시작)
- 순서: left-top → right → ... → right-bottom
- FieldGroup 컴포넌트에서 파란색으로 표시
- `item.shotIndex`로 접근 가능

### Die Index (다이 단위)
- 각 다이에 자동 부여 (0부터 시작, 필드별 독립)
- 순서: row 0 col 0, row 0 col 1, ..., row 2 col 1 (2×3 다이 기준)
- DieRect 컴포넌트에서 회색으로 표시 (toggleable)
- `die.dieIndex`로 접근 가능

### Die Sequence (전역 다이 시퀀스)
- 전체 rectangular grid에서의 monotonic 시퀀스
- 좌상단에서 우하단으로 증가 (left-top → right-bottom)
- wafer 외부 필드도 포함하여 계산 (corner 필드 포함)
- `die.dieSequence`로 접근 가능

## 확장 가능성

### 새로운 Hook 추가
- 데이터 처리 로직이 필요하면 `hooks/` 에 추가
- 예: `useCustomMerge.ts`, `useCDUFiltering.ts` 등

### 새로운 컴포넌트 추가
- 렌더링 요소가 필요하면 `components/` 에 추가
- 각 컴포넌트는 독립적으로 테스트 가능

### 병합 알고리즘 교체
1. `useMergeGroups` 로직 수정
2. 또는 새로운 hook 생성 후 index.tsx 에서 선택 가능하도록 수정

## 성능 고려사항
- `useMemo` 활용으로 불필요한 재계산 방지
- 각 hook이 독립적으로 의존성 관리
- 대규모 데이터셋의 경우 병합 알고리즘 비활성화로 성능 향상 가능
- fieldArraySize, offsetMicrometers, fieldSizeMicrometers 변경 시 실시간 업데이트

## WaferController 통합

WaferPlayground 또는 상위 컴포넌트에서 WaferController와 WaferFieldCDU_V6을 연동:

```typescript
import WaferFieldCDU_V6 from '@/components/atoms/fieldmap/WaferFieldCDURealisticV6'
import WaferController from '@/components/molecules/WaferController'

const [fieldArraySize, setFieldArraySize] = useState<[number, number]>([10, 10])
const [offsetMicrometers, setOffsetMicrometers] = useState<[number, number]>([0, 0])
const [fieldSizeMicrometers, setFieldSizeMicrometers] = useState<[number, number]>([20000, 30000])
// ... 기타 상태

return (
  <div style={{ display: 'flex', gap: '16px' }}>
    <div>
      <WaferFieldCDU_V6
        fieldArraySize={fieldArraySize}
        offsetMicrometers={offsetMicrometers}
        fieldSizeMicrometers={fieldSizeMicrometers}
        // ... 기타 props
      />
    </div>
    <WaferController
      fieldArraySize={fieldArraySize}
      onFieldArraySizeChange={setFieldArraySize}
      offsetMicrometers={offsetMicrometers}
      onOffsetMicrometersChange={setOffsetMicrometers}
      fieldSizeMicrometers={fieldSizeMicrometers}
      onFieldSizeMicrometersChange={setFieldSizeMicrometers}
      // ... 기타 props
    />
  </div>
)
```

