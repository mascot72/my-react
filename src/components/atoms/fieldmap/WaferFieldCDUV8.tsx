import React from "react";

const WaferPointCDU_V6: React.FC = () => {
  // === Constants ===
  const waferRadius = 150; // mm
  const shotCols = 14;
  const shotRows = 13;
  const fieldWidth = 23456; // µm
  const fieldHeight = 32430; // µm
  const scaleFactor = 1 / 1000; // µm → mm
  const svgWidth = 800; // px

  // === Derived ===
  const waferDiameterPx = svgWidth * 0.9;
  const scale = waferDiameterPx / (waferRadius * 2); // mm→px
  const waferRadiusPx = waferRadius * scale;
  const stepX = fieldWidth * scaleFactor; // mm
  const stepY = fieldHeight * scaleFactor; // mm

  // === Random Point Data ===
  const numPoints = Math.floor(Math.random() * 930) + 70;
  const pointData = Array.from({ length: numPoints }, () => {
    const idxX = Math.floor(Math.random() * shotCols) - Math.floor(shotCols / 2);
    const idxY = Math.floor(Math.random() * shotRows) - Math.floor(shotRows / 2);
    const x = Math.random() * fieldWidth;
    const y = Math.random() * fieldHeight;
    return {
      x,
      y,
      value: (Math.random() - 0.5) * 2, // CDU -1~+1
      indexX: idxX,
      indexY: idxY,
      siteSeq: Math.floor(Math.random() * 10),
    };
  });

  // === Convert to absolute wafer coordinates (mm) ===
  const points = pointData.map((p) => ({
    ...p,
    absX: (p.indexX * stepX) + (p.x * scaleFactor - fieldWidth * scaleFactor / 2),
    absY: (p.indexY * stepY) + (p.y * scaleFactor - fieldHeight * scaleFactor / 2),
  }));

  // === Wafer mask filter ===
  const inWafer = points.filter(
    (p) => Math.hypot(p.absX, p.absY) <= waferRadius
  );

  // === Euclidean Distance Merge ===
  const mergeDistance = 2.0 / 1000; // 2000nm = 0.002mm
  const groups: number[][] = [];
  const visited = new Set<number>();

  inWafer.forEach((p, i) => {
    if (visited.has(i)) return;
    const group = [i];
    visited.add(i);

    for (let j = 0; j < inWafer.length; j++) {
      if (visited.has(j)) continue;
      const q = inWafer[j];
      const dist = Math.hypot(p.absX - q.absX, p.absY - q.absY);
      if (dist <= mergeDistance) {
        group.push(j);
        visited.add(j);
      }
    }
    groups.push(group);
  });

  // === Color mapping ===
  function cduToColor(v: number) {
    const t = (v + 1) / 2;
    const r = Math.floor(255 * t);
    const g = Math.floor(255 * (1 - Math.abs(t - 0.5) * 2));
    const b = Math.floor(255 * (1 - t));
    return `rgb(${r},${g},${b})`;
  }

  // === SVG Rendering ===
  return (
    <svg
      width={svgWidth}
      height={svgWidth + 80}
      viewBox={`-${svgWidth / 2} -${svgWidth / 2} ${svgWidth} ${svgWidth}`}
      style={{ background: "white", display: "block", margin: "auto" }}
    >
      {/* wafer outline */}
      <circle cx="0" cy="0" r={waferRadiusPx} stroke="#555" strokeWidth="1" fill="none" />

      {/* shot outlines */}
      {Array.from({ length: shotCols * shotRows }).map((_, i) => {
        const col = (i % shotCols) - Math.floor(shotCols / 2);
        const row = Math.floor(i / shotCols) - Math.floor(shotRows / 2);
        const cx = col * stepX * scale;
        const cy = row * stepY * scale;
        return (
          <rect
            key={i}
            x={cx - (fieldWidth * scaleFactor * scale) / 2}
            y={cy - (fieldHeight * scaleFactor * scale) / 2}
            width={fieldWidth * scaleFactor * scale}
            height={fieldHeight * scaleFactor * scale}
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="0.3"
          />
        );
      })}

      {/* merged groups */}
      {groups.map((g, gi) => {
        const pts = g.map((idx) => inWafer[idx]);
        const avgX = pts.reduce((s, p) => s + p.absX, 0) / pts.length;
        const avgY = pts.reduce((s, p) => s + p.absY, 0) / pts.length;
        const avgVal = pts.reduce((s, p) => s + p.value, 0) / pts.length;
        const color = cduToColor(avgVal);

        return (
          <g key={gi}>
            {pts.map((p, pi) => (
              <circle
                key={pi}
                cx={p.absX * scale}
                cy={-p.absY * scale}
                r={1.2}
                fill={color}
                stroke="none"
              />
            ))}
            <text
              x={avgX * scale}
              y={-avgY * scale - 3}
              fontSize="4"
              textAnchor="middle"
              fill="#111"
            >
              {avgVal.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* color bar */}
      <defs>
        <linearGradient id="cduBar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00f" />
          <stop offset="50%" stopColor="#0f0" />
          <stop offset="100%" stopColor="#f00" />
        </linearGradient>
      </defs>
      <rect
        x={-waferRadiusPx * 0.5}
        y={waferRadiusPx + 20}
        width={waferRadiusPx}
        height={8}
        fill="url(#cduBar)"
      />
      <text x={-waferRadiusPx * 0.55} y={waferRadiusPx + 35} fontSize="9" fill="#333">
        CDU(-)
      </text>
      <text x={waferRadiusPx * 0.45} y={waferRadiusPx + 35} fontSize="9" fill="#333">
        (+)
      </text>
    </svg>
  );
};

export default WaferPointCDU_V6;
