import React, { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  TitleComponent,
  VisualMapComponent,
  GridComponent,
} from 'echarts/components';
import { HeatmapChart, CustomChart, ScatterChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import type {
  TooltipComponentOption,
  TitleComponentOption,
  VisualMapComponentOption,
  GridComponentOption,
} from 'echarts/components';
import type { HeatmapSeriesOption, CustomSeriesOption, ScatterSeriesOption } from 'echarts/charts';
import type { ComposeOption } from 'echarts/core';

// register required components
echarts.use([
  TooltipComponent,
  TitleComponent,
  VisualMapComponent,
  GridComponent,
  HeatmapChart,
  ScatterChart,
  CustomChart,
  CanvasRenderer,
]);

type ECOption = ComposeOption<
  | TooltipComponentOption
  | TitleComponentOption
  | VisualMapComponentOption
  | GridComponentOption
  | HeatmapSeriesOption
  | ScatterSeriesOption
  | CustomSeriesOption
>;

/**
 * LL: 연속 좌표 데이터를 격자(heatmap용)로 변환
 * @param points [x, y, value][] 형태의 연속 좌표 데이터
 * @param gridCount NxN 격자 크기
 * @param min, max 좌표 범위
 * @returns { data, xLabels, yLabels, minValue, maxValue }
 */
function binGrid(
  points: [number, number, number][],
  gridCount: number = 10,
  min: number = -100,
  max: number = 100
) {
  const range = max - min;
  const cellSize = range / gridCount;
  
  // 격자별 값 누적
  const grid = new Map<string, number[]>();
  
  for (const [x, y, value] of points) {
    const gridX = Math.floor((x - min) / cellSize);
    const gridY = Math.floor((y - min) / cellSize);
    
    // 범위 초과 포인트는 무시
    if (gridX < 0 || gridX >= gridCount || gridY < 0 || gridY >= gridCount) continue;
    
    const key = `${gridX},${gridY}`;
    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key)!.push(value);
  }
  
  // 격자별 평균값 계산 및 heatmap 데이터 형식으로 변환
  const data: [number, number, number][] = [];
  let minValue = Infinity;
  let maxValue = -Infinity;
  
  grid.forEach((values, key) => {
    const [gridX, gridY] = key.split(',').map(Number);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    data.push([gridX, gridY, avg]);
    minValue = Math.min(minValue, avg);
    maxValue = Math.max(maxValue, avg);
  });
  
  // x, y 축 라벨 생성
  const xLabels = Array.from({ length: gridCount }, (_, i) => 
    `${(min + i * cellSize).toFixed(0)}`
  );
  const yLabels = Array.from({ length: gridCount }, (_, i) => 
    `${(min + i * cellSize).toFixed(0)}`
  );
  
  return { data, xLabels, yLabels, minValue, maxValue };
}

interface WaferFieldCDUChartProps {
  // scatter: 연속 좌표 점 표시 | heatmap: 격자 기반 열지도 | both: 둘 다 오버랩
  mode?: 'scatter' | 'heatmap' | 'both';
}

const WaferFieldCDUChart: React.FC<WaferFieldCDUChartProps> = ({ mode: propMode = 'heatmap' }) => {
  // visualization mode state
  const [mode, setMode] = React.useState<'scatter' | 'heatmap' | 'both'>(propMode);

  // wafer radius in logical units
  const waferRadius = 100;

  // grid binning 파라미터
  const gridCount = 10;

  // generate sample CDU data (memoized)
  const rawData = useMemo(() => {
    return Array.from({ length: 300 }, () => {
      const x = Math.random() * 2 * waferRadius - waferRadius;
      const y = Math.random() * 2 * waferRadius - waferRadius;
      const distance = Math.hypot(x, y);
      if (distance > waferRadius) return null;
      return [x, y, Math.random() * 10 - 5] as [number, number, number];
    }).filter(Boolean) as [number, number, number][];
  }, [waferRadius]);

  // 격자화(binning) 처리 (heatmap용)
  const { data: binnedData, xLabels, yLabels, minValue, maxValue } = useMemo(() => {
    return binGrid(rawData, gridCount, -waferRadius - 10, waferRadius + 10);
  }, [rawData, gridCount, waferRadius]);

  const option = useMemo<ECOption>(() => {
    // helper: interpolate color from stops
    const colorStops = ['#00f', '#0ff', '#0f0', '#ff0', '#f00'];
    function hexToRgb(hex: string) {
      const h = hex.replace('#', '');
      const bigint = parseInt(h, 16);
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }
    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }
    function valueToColor(v: number, minV: number, maxV: number) {
      if (!isFinite(minV) || !isFinite(maxV) || minV === maxV) return colorStops[2];
      const t = (v - minV) / (maxV - minV);
      const idx = Math.min(Math.floor(t * (colorStops.length - 1)), colorStops.length - 2);
      const localT = (t * (colorStops.length - 1)) - idx;
      const c0 = hexToRgb(colorStops[idx]);
      const c1 = hexToRgb(colorStops[idx + 1]);
      const r = Math.round(lerp(c0[0], c1[0], localT));
      const g = Math.round(lerp(c0[1], c1[1], localT));
      const b = Math.round(lerp(c0[2], c1[2], localT));
      return `rgb(${r},${g},${b})`;
    }

          // single custom series draws either heatmap rects, scatter points, or both depending on mode
    const seriesData = [0]; // single dummy data item; renderItem will draw everything

    const commonGrid = { left: 40, right: 40, top: 30, bottom: 40 };

  const cfg: ECOption & Record<string, unknown> = {
      backgroundColor: '#111',
      title: { text: `Field CDU Map (${mode === 'heatmap' ? 'Heatmap' : mode === 'scatter' ? 'Scatter' : 'Both'})`, left: 'center', textStyle: { color: '#fff' } },
      tooltip: { show: true },
      grid: commonGrid,
      visualMap: { min: Math.min(minValue, ...rawData.map((d) => d[2])), max: Math.max(maxValue, ...rawData.map((d) => d[2])), calculable: true, orient: 'vertical', right: 10, top: 'middle', inRange: { color: colorStops }, text: ['High', 'Low'], textStyle: { color: '#fff' } },
      xAxis: {},
      yAxis: {},
      series: [
        ({
          name: 'Combined',
          type: 'custom',
          // allow any here because echarts renderItem API types are verbose and project linter
          // disallows explicit any in most places — keep this narrow exemption
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderItem: (_: any, api: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const children: unknown[] = [];
            // heatmap rects (grid indices)
            if (mode === 'heatmap' || mode === 'both') {
              for (const [gx, gy, val] of binnedData) {
                // center positions using fractional indices
                const p1 = api.coord([gx - 0.5, gy - 0.5]);
                const p2 = api.coord([gx + 0.5, gy + 0.5]);
                if (!p1 || !p2) continue;
                const x = Math.min(p1[0], p2[0]);
                const y = Math.min(p1[1], p2[1]);
                const w = Math.abs(p2[0] - p1[0]);
                const h = Math.abs(p2[1] - p1[1]);
                children.push({
                  type: 'rect',
                  shape: { x, y, width: w, height: h },
                  style: { fill: valueToColor(val, Math.min(minValue, ...rawData.map((d) => d[2])), Math.max(maxValue, ...rawData.map((d) => d[2]))), stroke: 'rgba(0,0,0,0.2)' },
                });
              }
            }
            // scatter points
            if (mode === 'scatter' || mode === 'both') {
              const symbolSize = 8;
              for (const [xv, yv, val] of rawData) {
                const c = api.coord([xv, yv]);
                if (!c) continue;
                children.push({ type: 'circle', shape: { cx: c[0], cy: c[1], r: symbolSize / 2 }, style: { fill: valueToColor(val, Math.min(minValue, ...rawData.map((d) => d[2])), Math.max(maxValue, ...rawData.map((d) => d[2]))), stroke: '#222' } });
              }
            }
            return { type: 'group', children };
          },
          data: seriesData,
        } as unknown as CustomSeriesOption),
        // shared wafer outline drawn once as a separate series (on top)
        ({
          name: 'WaferOutline',
          type: 'custom',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderItem: (_: any, api: any) => {
            // Compute center and radius symmetrically so the circle is centered the same
            // in both category (heatmap) and value (scatter) axis modes.
            const center = mode === 'heatmap'
              ? api.coord([(gridCount - 1) / 2, (gridCount - 1) / 2])
              : api.coord([0, 0]);

            const left = mode === 'heatmap'
              ? api.coord([0, (gridCount - 1) / 2])
              : api.coord([-waferRadius, 0]);
            const right = mode === 'heatmap'
              ? api.coord([gridCount - 1, (gridCount - 1) / 2])
              : api.coord([waferRadius, 0]);

            const radius = left && right ? Math.abs(right[0] - left[0]) / 2 : 0;
            const children: unknown[] = [];
            children.push({ type: 'circle', shape: { cx: center ? center[0] : 0, cy: center ? center[1] : 0, r: radius }, style: { stroke: '#888', lineWidth: 2, fill: 'none' } });
            return { type: 'group', children };
          },
          data: [0],
          z: 100,
        } as unknown as CustomSeriesOption),
      ],
    };

    // axis setup depending on mode
    if (mode === 'heatmap') {
      cfg.xAxis = { type: 'category', data: xLabels, show: true, splitLine: { show: false } };
      cfg.yAxis = { type: 'category', data: yLabels, show: true, splitLine: { show: false } };
    } else {
      cfg.xAxis = { type: 'value', min: -waferRadius - 10, max: waferRadius + 10, show: true, splitLine: { show: true } };
      cfg.yAxis = { type: 'value', min: -waferRadius - 10, max: waferRadius + 10, show: true, splitLine: { show: true } };
    }

    return cfg as ECOption;
  }, [mode, binnedData, xLabels, yLabels, minValue, maxValue, gridCount, rawData, waferRadius]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  // init chart (only once)
  useEffect(() => {
    if (!containerRef.current) return;
    // initialize once
    chartRef.current = echarts.init(containerRef.current);

    // resize observer to keep chart responsive
    const ro = new ResizeObserver(() => chartRef.current?.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  // update option when data or settings change
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.setOption(option, { notMerge: false, lazyUpdate: true });
  }, [option]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
      {/* 토글 버튼 */}
      <div style={{ padding: '10px', background: '#222', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setMode('scatter')}
          style={{
            padding: '8px 16px',
            background: mode === 'scatter' ? '#0066ff' : '#555',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}>
          Scatter (연속 좌표)
        </button>
        <button
          onClick={() => setMode('heatmap')}
          style={{
            padding: '8px 16px',
            background: mode === 'heatmap' ? '#0066ff' : '#555',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}>
          Heatmap (격자화)
        </button>
      </div>

      {/* 차트 컨테이너 */}
      <div ref={containerRef} style={{ width: '100%', height: 500, background: '#111' }} />
    </div>
  );
};

export default WaferFieldCDUChart;
