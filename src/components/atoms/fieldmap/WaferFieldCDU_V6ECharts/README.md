# WaferFieldCDU_V6ECharts (ECharts 버전)

Wafer Field CDU 시각화를 ECharts로 모듈화한 구현입니다. 레거시 단일 파일을 폴더 구조로 분리하여 유지보수가 쉽고 확장 가능한 형태로 재구성했습니다.

**핵심 목표**
- Point 모드/Rect 모드 간 파리티 유지 (레이블, 색상, 토글 동작 동일)
- Shot Ruler, Wafer Radius 오버레이 제공 및 축/그리드 처리 일관화
- 툴팁과 라벨에서 NaN/undefined 방지, 사용자 친화적 포맷 제공
- 옵션 변경 시 notMerge/lazyUpdate 전략으로 상태 보존

---

## 폴더 개요
- `index.tsx`: 진입 컴포넌트. `useWaferEChartsOption`으로 옵션을 만들고 ReactECharts를 렌더링합니다.
- `hooks/useWaferEChartsOption.ts`: ECharts 옵션 조립. 축/그리드/visualMap/시리즈를 구성합니다.
- `hooks/useWaferData.ts`: 필드/다이 Rect, 포인트 데이터셋, 포함 판단(웨이퍼 내부), 전역/로컬 인덱스/시퀀스 재계산, 샷 시퀀스, 필드 평균을 계산합니다.
- `hooks/useAxesAndGrid.ts`: bbox와 토글에 따라 축 min/max와 그리드 패딩을 산출합니다.
- `hooks/useContainerSize.ts`: 축 범위를 바탕으로 컨테이너 크기(가로/세로)를 계산합니다.
- `components/series.ts`: 시리즈 빌더. 아웃라인(웨이퍼/필드/다이), 필드/다이 채움, 값/인덱스/시퀀스/샷 라벨, 포인트 모드 시리즈 등.
- `components/overlays.ts`: Shot Ruler(gx/gy 눈금/베이스라인), Wafer Radius 라벨/라인.
- `../WaferFieldCDU_V6ECharts.legacy.tsx`: 레거시 단일 파일. 비교/참고용으로만 유지합니다.

---

## 주요 프로퍼티 (SVG 버전과 공통)
- `viewPoint`: true면 포인트만 표시(점), Rect 채움 미표시. false면 Rect(필드/다이) 채움/라벨 표시.
- `showFieldFill`: Rect 모드에서 필드 평균 CDU 채움 사용.
- `showOutlinesInPointMode`: 포인트 모드에서도 웨이퍼/필드/다이 아웃라인을 표시.
- `showValues`/`viewDieIndex`/`viewDieSequence`/`viewShotSequence`: 라벨 토글.
- `showShotRuler`: Ruler 활성 시 축 눈금/라벨 숨김, gx/gy 베이스라인/눈금으로 대체.
- `shotRulerStepX`/`shotRulerStepY`: Ruler 눈금 간격.
- `showWaferRadius`: 반지름 라인/라벨 표시.
- `fieldArraySize`/`fieldSizeMicrometers`/`offsetMicrometers`: 지오메트리 제어(훅에서 mm로 변환).
- `fitToContent`: 포인트 모드에서 웨이퍼 밖 포인트 클리핑/축 범위 자동 조정.
- `gridLineColor`/`gridLineWidth`/`centerAxisCoordinates`: 그리드/라벨 스타일과 중앙 기준 라벨 모드(ΔX/ΔY).

---

## 사용 예시
```tsx
import WaferFieldCDU_V6ECharts from '@/components/atoms/fieldmap/WaferFieldCDU_V6ECharts'

export default function WaferEChartsPlayground() {
  return (
    <WaferFieldCDU_V6ECharts
      viewPoint={false}
      showFieldFill
      showShotRuler={false}
      showWaferRadius={true}
      fieldArraySize={[14,13]}
      fieldSizeMicrometers={[20000,30000]}
      offsetMicrometers={[0,0]}
      showValues={false}
      viewDieIndex={false}
      viewDieSequence={false}
      viewShotSequence={true}
    />
  )
}
```

---

## 동작 상세
- **웨이퍼 포함(strict)**: 다이/필드 Rect의 4개 모서리가 모두 웨이퍼 내부일 때만 포함됩니다. 포인트 모드 클리핑은 `fitToContent`에 따릅니다.
- **번호 재계산**: 글로벌 다이 시퀀스, 필드 내 다이 인덱스를 재계산하여 라벨 일관성 유지.
- **툴팁**: 커스텀/스캐터 시리즈 모두에서 X/Y/값을 안전 파싱; Rect 채움/아웃라인의 경우 중심/평균으로 폴백. undefined 방지.
- **축 라벨**: Shot Ruler가 켜지면 축 눈금/라벨 숨기고 Ruler로 대체. `centerAxisCoordinates`가 true면 ΔX/ΔY로 중앙 기준 라벨.
- **상태 보존**: notMerge/lazyUpdate를 고려해 옵션 업데이트 시 차트 재생성 최소화.

---

## 개발 메모
- **TypeScript**: ECharts 커스텀 시리즈 API 특성상 일부 빌더에 `any` 사용(로컬 범위에 한정).
- **옵션 조립**: `useWaferEChartsOption`에서 `seriesList`를 구성 → null 제거 → `EChartsOption['series']`로 캐스팅하여 TS union 충족.
- **패딩**: Ruler 활성 시 좌/하단 패딩 증가(눈금 라벨 공간).
- **컨테이너 크기**: 축 범위에서 픽셀/밀리미터 비율로 계산, 최소값 보장.

---

## 마이그레이션 (Legacy → Modular)
- 새로운 컴포넌트는 이 폴더의 `index.tsx`를 임포트하세요.
- 레거시 파일은 파리티 검증 이후 삭제 대상입니다(새 기능은 모듈 버전에만 반영).

---

## 트러블슈팅
- **툴팁 X/Y가 undefined**: 커스텀 시리즈에서 `params.data.value`가 아닌 `params.data`가 배열일 수도 있음. 포맷터에서 다중 경로로 파싱하고 Rect의 경우 중심 좌표로 폴백.
- **포인트 모드에서 축 라벨 겹침**: `showShotRuler` 사용 시 축 라벨을 숨깁니다. 라벨이 필요하면 `centerAxisCoordinates`를 해제하거나 패딩 값을 조정하세요.
- **성능**: `fitToContent`가 false면 외부 포인트/Rect까지 모두 표시되어 시야가 넓어집니다. 필요 시 라벨 토글로 텍스트 렌더링을 줄여주세요.

---

## 향후 개선 아이디어
- 테마 훅(컬러 팔레트/visualMap 프리셋).
- 툴팁 포맷 커스터마이즈(다이 인덱스/시퀀스, 좌표 소수점 자릿수).
- 축/visualMap 빌더 분리로 가독성 개선.
- Ruler Y 라벨 부호(상단 +, 하단 -)를 SVG와 완전 동기화.
