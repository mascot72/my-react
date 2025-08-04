# Canvas 기반 Heatmap 시각화 알고리즘 설명

## 1. 개념 요약

이 코드는 여러 데이터 포인트의 위치와 값을 기반으로, 캔버스의 각 픽셀에 색상과 투명도를 계산하여 2D 히트맵을 시각화하는 알고리즘입니다.  
주로 웨이퍼 맵, 온도 분포, 센서 데이터 등 다양한 분야의 2차원 데이터 시각화에 활용됩니다.

---

## 2. 동작 흐름 도식화

### (1) 데이터 포인트 영향력 분포

```
+-------------------------+
|                         |
|   o         o           |   o : 데이터 포인트
|                         |
|        o                |
|                         |
+-------------------------+
```

- 각 데이터 포인트는 자신의 위치(x, y)와 값(value)을 가짐
- 반경(radius) 내의 모든 픽셀에 대해 거리 기반 가중치(weight)를 계산하여 영향력을 분포시킴

### (2) 픽셀별 누적값 및 가중치 계산

```
픽셀마다
  - 여러 데이터 포인트의 영향력(weight * value)을 누적
  - 전체 가중치(weight)도 누적
  - 최종적으로 valueData / weightData로 평균값 산출
```

### (3) 색상 팔레트(gradient) 적용

```
[0.0]---파랑---녹색---노랑---빨강---[1.0]
   |     |      |      |      |
   v     v      v      v      v
픽셀값에 따라 색상 결정 (gradient)
```

- 평균값(0~1)을 0~255로 변환하여 색상 팔레트에서 색상 추출

### (4) 투명도(Opacity) 처리

```
픽셀값이 낮으면 투명, 높으면 불투명
(minOpacity ~ maxOpacity 범위 내에서 제한)
```

### (5) 최종 이미지 렌더링

```
캔버스에 RGBA 이미지 데이터로 출력
```

---

## 3. 주요 코드 구조

- **데이터 포인트 반복**  
  각 데이터 포인트가 모든 픽셀에 미치는 영향(가중치 \* 값)을 누적
- **거리 기반 가중치 LUT**  
  거리 제곱에 따라 미리 계산된 가중치 테이블을 사용해 연산 효율화
- **색상 팔레트 생성**  
  gradient 설정값을 기반으로 256픽셀짜리 팔레트 생성 후 색상 추출
- **픽셀별 RGBA 계산**  
  평균값에 따라 색상과 투명도 결정, RGBA 배열에 할당
- **캔버스 출력**  
  `putImageData`로 최종 이미지 렌더링

---

## 4. 참고 자료

- [Heatmap 알고리즘 설명 (Wikipedia)](https://en.wikipedia.org/wiki/Heat_map)
- [Javascript Canvas 기반 Heatmap 구현 예시 (GitHub)](https://github.com/pa7/heatmap.js)
- [CanvasRenderingContext2D.putImageData 공식 문서](https://developer.mozilla.org/ko/docs/Web/API/CanvasRenderingContext2D/putImageData)
- [데이터 시각화와 픽셀 기반 처리 개념](https://www.vis4.net/blog/posts/heatmaps/)
- [heatmap.js 공식 사이트](https://www.patrick-wied.at/static/heatmapjs/)

---

## 5. 활용 예시

- 반도체 웨이퍼 맵
- 온도 분포 지도
- 센서 네트워크 시각화
- 지리 정보 기반 데이터 시각화

---

## 6. 요약

이 알고리즘은 데이터 포인트의 영향력을 거리 기반으로 분포시키고, 픽셀별로 누적하여 평균값을 구한 뒤, 색상 팔레트와 투명도를 적용해 시각화합니다.  
실제 구현 및 활용 시 gradient, radius,
