# Hierarchical Point Data System - SemPoint 개선

## 개요

WaferFieldCDU_V6 컴포넌트의 포인트 데이터 시스템이 개선되었습니다. `usePointData.ts`의 기능과 `useSemPointData`를 새로 개발하여 hierarchical 구조를 지원합니다.

## 계층 구조 (Hierarchy)

```
Wafer
  └─ Field (fieldGridX, fieldGridY)       ← 중앙 기준 그리드 좌표
      ├─ Die (dieCol, dieRow)             ← Field 내 상대 인덱스
      │  └─ SemPoints[]                   ← Die 내부 상대좌표 포함
      └─ Average Value (Field 레벨)
```

### 레벨별 구조

#### 1. **Wafer 레벨**
- 전체 Wafer의 모든 Field, Die, SemPoint 포함

#### 2. **Field 레벨**
- `fieldGridX, fieldGridY`: 중앙 기준 그리드 좌표
- `x, y`: mm 단위 절대 좌표 (= fieldGridX * fieldStepX, fieldGridY * fieldStepY)
- `value`: 이 Field에 포함된 모든 SemPoint의 평균값
- `semPoints[]`: 이 Field의 모든 SemPoint (flat)
- `dieGroupedSemPoints[]`: Die별로 재그룹화된 SemPoint (nested)

#### 3. **Die 레벨**
- `dieCol, dieRow`: Field 내 상대 인덱스 (left-bottom 기준)
- `x, y`: mm 단위 Die 중심 절대 좌표
- `value`: 이 Die에 포함된 모든 SemPoint의 평균값
- `semPoints[]`: 이 Die에 포함된 SemPoint

#### 4. **SemPoint 레벨**
- `indexX, indexY`: Field Grid 인덱스 (FieldPoint.fieldGridX/Y와 동일)
- `x, y`: 절대좌표 (노광장비 좌표 기준)
- `value`: 측정값
- `dieLocalX, dieLocalY`: Die 내부 상대좌표 (mm, die left-bottom 기준)
- `siteSeq`: 촬영 순서

## 데이터 흐름

```
Input SemPoint[]
  ↓ (parseSemPoints)
SemPoint[] (구조화)
  ↓ (useSemPointData)
  ├─ mapSemPointsToFields()
  │   ├─ 절대좌표 정규화
  │   ├─ Field 그리드 매핑
  │   └─ Die 위치 계산
  │       └─ Die 내 상대좌표 계산
  │
  ├─ Field 기반 그룹핑 (indexX, indexY)
  │
  ├─ Die 기반 그룹핑 (indexX, indexY, dieCol, dieRow)
  │
  ├─ 계층별 평균값 계산
  │
  └─ SemPointDataSet 반환
       ├─ diePointsWithSem[]
       ├─ fieldPointsWithSem[]
       └─ allSemPointsMapped[]
```

## 핵심 타입

### SemPointDataSet
```typescript
interface SemPointDataSet {
  diePointsWithSem: DiePointWithSemPoints[]
  fieldPointsWithSem: FieldPointWithSemPoints[]
  allSemPointsMapped: SemPointMapped[]
}
```

### DiePointWithSemPoints
```typescript
interface DiePointWithSemPoints {
  x: number                          // mm 단위 Die 중심 X
  y: number                          // mm 단위 Die 중심 Y
  value: number | null               // Die 내 SemPoint 평균값
  fieldGridX: number                 // Field 그리드 X
  fieldGridY: number                 // Field 그리드 Y
  dieCol: number                     // Die 열 인덱스
  dieRow: number                     // Die 행 인덱스
  semPoints: SemPointWithDieLocal[]  // Die 내 포함 SemPoint
}
```

### FieldPointWithSemPoints
```typescript
interface FieldPointWithSemPoints {
  x: number                           // mm 단위 Field 중심 X
  y: number                           // mm 단위 Field 중심 Y
  value: number | null                // Field 내 SemPoint 평균값
  fieldGridX: number                  // Field 그리드 X
  fieldGridY: number                  // Field 그리드 Y
  semPoints: SemPointWithDieLocal[]   // Field 내 모든 SemPoint (flat)
  dieGroupedSemPoints: DieGroupedSemPoints[]  // Die별 재그룹화
}
```

### SemPointWithDieLocal
```typescript
interface SemPointWithDieLocal extends SemPoint {
  dieLocalX: number | null     // Die 내 상대좌표 X (mm)
  dieLocalY: number | null     // Die 내 상대좌표 Y (mm)
}
```

## 사용 예제

### 1. Die 레벨 접근
```tsx
// Die별 SemPoint 분석
semPointDataSet.diePointsWithSem.forEach(die => {
  console.log(`Die(${die.dieCol}, ${die.dieRow}) at Field(${die.fieldGridX}, ${die.fieldGridY}):`)
  console.log(`  평균값: ${die.value}`)
  console.log(`  포인트 수: ${die.semPoints.length}`)
  
  die.semPoints.forEach(point => {
    console.log(`  - (${point.dieLocalX}, ${point.dieLocalY}): ${point.value}`)
  })
})
```

### 2. Field 레벨 접근
```tsx
// Field의 Die별 분석
semPointDataSet.fieldPointsWithSem.forEach(field => {
  console.log(`Field(${field.fieldGridX}, ${field.fieldGridY}): avg=${field.value}`)
  
  field.dieGroupedSemPoints.forEach(dieGroup => {
    console.log(`  Die(${dieGroup.dieCol}, ${dieGroup.dieRow}): avg=${dieGroup.value}, count=${dieGroup.semPoints.length}`)
  })
})
```

### 3. WaferFieldCDU_V6에서 사용
```tsx
<WaferFieldCDU_V6
  semPoints={semPoints}
  showSemPoints={true}
  useSemPointColorFromPalette={true}
  applyFieldFillFromSemValue={true}
  applyDieFillFromSemValue={true}
/>

// 내부에서 자동으로 생성:
// const semPointDataSet = useSemPointData({
//   semPoints,
//   fieldStepX, fieldStepY,
//   fieldWidth, fieldHeight,
//   dieCols, dieRows
// })
```

## 좌표 체계

### Field 좌표 (mm, 절대)
```
x = fieldGridX * fieldStepX
y = fieldGridY * fieldStepY
```

### Die 좌표 (mm, Field 내 상대)
```
Die 좌측 하단:
  x_left = fieldCenterX - fieldWidth/2 + dieCol * dieWidth
  y_bottom = fieldCenterY - fieldHeight/2 + dieRow * dieHeight

Die 중심:
  x = x_left + dieWidth/2
  y = y_bottom + dieHeight/2
```

### SemPoint Die 내 상대좌표 (mm)
```
dieLocalX: Die 내 X 좌표 (mm, die left-bottom 기준)
dieLocalY: Die 내 Y 좌표 (mm, die left-bottom 기준)

범위: [0, dieWidth] × [0, dieHeight]
null: Field 경계 밖에 위치한 포인트
```

## 값의 의미

### 평균값 (Average Value)
```
FieldPointWithSemPoints.value 
  = (모든 포함 SemPoint의 value의 합) / (포함 SemPoint 개수)

DieGroupedSemPoints.value
  = (특정 Die의 SemPoint value의 합) / (Die 내 SemPoint 개수)

DiePointWithSemPoints.value
  = (Die의 모든 SemPoint value의 합) / (Die 내 SemPoint 개수)
```

### null 처리
```
- SemPoint가 없는 경우: value = null
- Die 내 SemPoint 없음: DiePointWithSemPoints.value = null
- Field 내 SemPoint 없음: FieldPointWithSemPoints.value = null
```

## 파일 구조

```
src/components/atoms/fieldmap/WaferFieldCDU_V6/
├── hooks/
│   ├── index.ts                    // 훅 export
│   ├── usePointData.ts             // Die/Field 포인트 (CDU 기반)
│   ├── useSemPointData.ts ✨ NEW   // Hierarchical SEM 포인트
│   ├── useCDUData.ts
│   ├── useMergeGroups.ts
│   └── useFieldRenderItems.ts
├── utils/
│   ├── semPointMapper.ts           // SemPoint → Field/Die 매핑
│   └── paletteColorMapper.ts
├── types.ts                        // Hierarchical 타입 정의 ✨ 업데이트
├── index.tsx                       // 통합 컴포넌트
└── components/
    └── ...
```

## 개선 사항

| 항목 | 이전 | 개선후 |
|------|------|--------|
| 구조 | flat | hierarchical (Wafer > Field > Die > SemPoints) |
| 포인트 분류 | 혼합 | Die/Field 명확하게 분리 |
| 평균값 | 계산 필요 | 자동 계산 (모든 레벨) |
| 그룹화 | 부분적 | 완전한 그룹화 (중첩) |
| 상대좌표 | Die 내만 | Die 내 + Field 내 명확화 |
| 접근성 | 매번 필터링 필요 | 미리 그룹화되어 직접 접근 |

## 마이그레이션 가이드

### 기존 코드 (usePointData 사용)
```tsx
const pointDataSet = usePointData({ fields })
pointDataSet.diePoints.forEach(dp => {
  console.log(dp.value)
})
```

### 새 코드 (useSemPointData 사용)
```tsx
const semPointDataSet = useSemPointData({
  semPoints,
  fieldStepX, fieldStepY,
  fieldWidth, fieldHeight,
  dieCols, dieRows
})
semPointDataSet.diePointsWithSem.forEach(dps => {
  console.log(dps.value)  // Die 평균값
  console.log(dps.semPoints)  // 포함 SemPoint
})
```

## 주의사항

1. **좌표 단위**: 모든 mm 단위 좌표는 absolute (절대)
2. **Die 내 상대좌표**: mm 단위이며 Die left-bottom 기준 (0 ~ dieWidth/Height)
3. **필터링 주의**: null 값 처리 (SemPoint 없는 경우)
4. **메모이제이션**: useSemPointData는 이미 useMemo 내부에서 처리

## 성능 고려사항

- SemPoint 개수: O(n)
- Field 그룹핑: O(n)
- Die 그룹핑: O(n)
- 전체 시간복잡도: O(n)
- 메모리: 매핑 데이터 캐싱으로 재계산 회피

## 참고 문헌

- [types.ts](./types.ts): 타입 정의 및 설명
- [useSemPointData.ts](./hooks/useSemPointData.ts): 훅 구현
- [semPointMapper.ts](./utils/semPointMapper.ts): 좌표 변환 로직
- [WaferPlayground.tsx](../../../pages/WaferPlayground.tsx): 사용 예제
