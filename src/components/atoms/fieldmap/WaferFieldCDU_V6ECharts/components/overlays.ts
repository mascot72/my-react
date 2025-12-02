/* eslint-disable @typescript-eslint/no-explicit-any */
export function createShotRulerSeries(args: {
  axisMinX: number
  axisMinY: number
  yTickData: Array<[number, number]>
  xTickData: Array<[number, number]>
}): any[] {
  const { axisMinX, axisMinY, yTickData, xTickData } = args
  return [
    {
      name: 'ShotRulerY',
      type: 'custom',
      renderItem: (_params: unknown, api: unknown) => {
        const a = api as any
        const gy = a.value(0)
        const y = a.value(1)
        const p = a.coord([axisMinX, y])
        return {
          type: 'text',
          style: { x: p[0] + 8, y: p[1], text: String(gy), textAlign: 'left', textVerticalAlign: 'middle', fill: '#6b7280', fontSize: 11 },
          silent: true,
        }
      },
      data: yTickData,
      z: 50,
    },
    {
      name: 'ShotRulerX',
      type: 'custom',
      renderItem: (_params: unknown, api: unknown) => {
        const a = api as any
        const gx = a.value(0)
        const x = a.value(1)
        const p = a.coord([x, axisMinY])
        return {
          type: 'text',
          style: { x: p[0], y: p[1] - 8, text: String(gx), textAlign: 'center', textVerticalAlign: 'bottom', fill: '#6b7280', fontSize: 11 },
          silent: true,
        }
      },
      data: xTickData,
      z: 50,
    },
  ]
}

export function createWaferRadiusSeries(args: {
  offsetMmX: number
  offsetMmY: number
  waferRadius: number
}): any[] {
  const { offsetMmX, offsetMmY, waferRadius } = args
  return [
    {
      name: 'WaferRadius',
      type: 'custom',
      renderItem: (_p: unknown, api: unknown) => {
        const a = api as any
        const c = a.coord([offsetMmX, offsetMmY])
        const e = a.coord([offsetMmX + waferRadius, offsetMmY])
        const mx = c[0] + (e[0] - c[0]) * 0.6
        const my = c[1] + (e[1] - c[1]) * 0.6
        return {
          type: 'group',
          children: [
            { type: 'line', shape: { x1: c[0], y1: c[1], x2: e[0], y2: e[1] }, style: { stroke: '#374151', lineWidth: 1.2 } },
            { type: 'text', style: { x: mx, y: my - 6, text: `R=${waferRadius} mm`, fill: '#374151', textAlign: 'center', textVerticalAlign: 'bottom', fontSize: 11 } },
          ],
          silent: true,
        }
      },
      data: [[0]],
      z: 55,
    },
  ]
}
