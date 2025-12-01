// WaferMap.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";

/**
 * Props:
 *  - width, height (px)
 *  - dieCols, dieRows (전체 die grid)
 *  - dieWidth, dieHeight (µm)
 *  - splitX, splitY (shotsplit)
 *  - offsetX, offsetY (µm)
 *  - points: array of { x: number, y: number, indexX:number, indexY:number, value:number }
 *
 * Notes:
 *  - Coordinates: incoming points x,y are die-local coordinates in µm (left-bottom origin within die)
 *  - Center alignment is applied for rendering (aligned indices = index - center)
 */

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// color map: value -> hsl (blue->green->red)
function valueToHsl(value, min, max) {
  if (!isFinite(value)) return "hsl(240 80% 60%)";
  const norm = (value - min) / Math.max(1e-9, max - min);
  const hue = (1 - clamp(norm, 0, 1)) * 240; // 240=blue -> 0=red
  const light = 52;
  return `hsl(${hue}deg 80% ${light}%)`;
}

export default function WaferMap({
  width = 1000,
  height = 800,
  dieCols = 28,
  dieRows = 26,
  dieWidth = 10000, // µm
  dieHeight = 10000, // µm
  splitX = 2,
  splitY = 3,
  offsetX = 0,
  offsetY = 0,
  points = null, // if null, sample data will be generated
  showShots = true,
  showDies = true,
  showPoints = true,
}) {
  // derived
  const shotWidth = dieWidth * splitX;
  const shotHeight = dieHeight * splitY;
  const totalShotsX = Math.ceil(dieCols / splitX);
  const totalShotsY = Math.ceil(dieRows / splitY);

  // center alignment offsets (in die-index units)
  const centerDieX = (dieCols - 1) / 2.0;
  const centerDieY = (dieRows - 1) / 2.0;

  // sample points generator
  const samplePoints = useMemo(() => {
    if (Array.isArray(points) && points.length > 0) return points;
    const arr = [];
    // generate regular probe-card points inside each die (3x3) with some value pattern
    const ptsPerDieX = 3;
    const ptsPerDieY = 3;
    for (let dy = 0; dy < dieRows; dy++) {
      for (let dx = 0; dx < dieCols; dx++) {
        for (let py = 0; py < ptsPerDieY; py++) {
          for (let px = 0; px < ptsPerDieX; px++) {
            const fx = (px + 0.5) / ptsPerDieX;
            const fy = (py + 0.5) / ptsPerDieY;
            // local coordinates in µm
            const lx = fx * dieWidth;
            const ly = fy * dieHeight;
            // value: create a smooth gradient based on die pos so heatmap looks interesting
            const base = Math.sin((dx - dieCols/2)/dieCols * Math.PI * 2) * 0.5
                       + Math.cos((dy - dieRows/2)/dieRows * Math.PI * 2) * 0.5;
            const noise = (Math.random()-0.5) * 0.1;
            const value = base + noise;
            arr.push({ x: lx, y: ly, indexX: dx, indexY: dy, value });
          }
        }
      }
    }
    return arr;
  }, [points, dieCols, dieRows, dieWidth, dieHeight]);

  // Convert die-local points -> shot-based coordinates + aligned indices
  const converted = useMemo(() => {
    const arr = [];
    for (const p of samplePoints) {
      // shotIndex by split
      const shotIndexX = Math.floor(p.indexX / splitX);
      const shotIndexY = Math.floor(p.indexY / splitY);

      // die local index within shot
      const dieLocalX = p.indexX % splitX;
      const dieLocalY = p.indexY % splitY;

      // shot-local coords (left-bottom of shot)
      const shotLocalX = dieLocalX * dieWidth + p.x;
      const shotLocalY = dieLocalY * dieHeight + p.y;

      // global shot-based coords (left-bottom origin at shot grid origin)
      const shotX = shotIndexX * shotWidth + shotLocalX + offsetX;
      const shotY = shotIndexY * shotHeight + shotLocalY + offsetY;

      // compute dieIndex and aligned die index (center alignment)
      const dieIndexX = shotIndexX * splitX + dieLocalX;
      const dieIndexY = shotIndexY * splitY + dieLocalY;

      const alignedDieX = dieIndexX - centerDieX;
      const alignedDieY = dieIndexY - centerDieY;

      arr.push({
        ...p,
        shotIndexX,
        shotIndexY,
        dieLocalX,
        dieLocalY,
        shotLocalX,
        shotLocalY,
        shotX,
        shotY,
        dieIndexX,
        dieIndexY,
        alignedDieX,
        alignedDieY,
      });
    }
    return arr;
  }, [samplePoints, splitX, splitY, dieWidth, dieHeight, shotWidth, shotHeight, offsetX, offsetY, centerDieX, centerDieY]);

  // compute bounding box in µm for all shot coords (for scaling)
  const bounds = useMemo(() => {
    const xs = converted.map(p => p.shotX);
    const ys = converted.map(p => p.shotY);
    const minX = Math.min(...xs, 0);
    const maxX = Math.max(...xs, totalShotsX * shotWidth);
    const minY = Math.min(...ys, 0);
    const maxY = Math.max(...ys, totalShotsY * shotHeight);
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  }, [converted, shotWidth, shotHeight, totalShotsX, totalShotsY]);

  // scale: map µm -> px keeping wafer centered
  const padding = 20;
  const usableW = width - padding * 2;
  const usableH = height - padding * 2;
  const scale = Math.min(usableW / bounds.width, usableH / bounds.height);

  // Pan / zoom state
  const [view, setView] = useState({
    tx: width / 2,
    ty: height / 2,
    scale: 1,
  });
  const svgRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    // init translation such that bounds center at svg center
    const centerPxX = width / 2;
    const centerPxY = height / 2;
    const initialScale = scale;
    setView({ tx: centerPxX, ty: centerPxY, scale: initialScale });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, scale]);

  // helpers: µm -> px (center-aligned: convert shot-based µm coords so that origin at bounds.minX,minY maps)
  function umToPx([ux, uy]) {
    // translate so that bounds.min is at ( -bounds.width/2 , -bounds.height/2 ) relative to center
    const centerUmX = (bounds.minX + bounds.maxX) / 2;
    const centerUmY = (bounds.minY + bounds.maxY) / 2;
    const relX = (ux - centerUmX) * scale * view.scale;
    const relY = (uy - centerUmY) * scale * view.scale;
    // SVG y downwards: invert y
    const px = view.tx + relX;
    const py = view.ty - relY;
    return [px, py];
  }

  // hover / selection
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);

  // min/max for color mapping
  const vals = converted.map(p => p.value);
  const vMin = Math.min(...vals);
  const vMax = Math.max(...vals);

  // events: wheel zoom
  function onWheel(e) {
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.12 : 0.88;
    const newScale = clamp(view.scale * factor, 0.2, 20);
    setView(v => ({ ...v, scale: newScale }));
  }

  // drag pan handlers
  function onMouseDown(e) {
    e.preventDefault();
    dragRef.current = { sx: e.clientX, sy: e.clientY, tx: view.tx, ty: view.ty };
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", onUp);
  }
  function onDrag(e) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.sx;
    const dy = e.clientY - dragRef.current.sy;
    setView(v => ({ ...v, tx: dragRef.current.tx + dx, ty: dragRef.current.ty + dy }));
  }
  function onUp() {
    dragRef.current = null;
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", onUp);
  }

  // utility: draw rectangle in µm space (left-bottom origin) mapped to px
  function rectUmToSvg(xUm, yUm, wUm, hUm) {
    // convert four corners
    const [x1, y1] = umToPx([xUm, yUm]);
    const [x2, y2] = umToPx([xUm + wUm, yUm + hUm]);
    // because y is inverted, x1,y1 may be bottom-left
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);
    return { x, y, w, h };
  }

  // build shot boxes (µm coords)
  const shotBoxes = useMemo(() => {
    const boxes = [];
    for (let sy = 0; sy < totalShotsY; sy++) {
      for (let sx = 0; sx < totalShotsX; sx++) {
        const left = sx * shotWidth + offsetX;
        const bottom = sy * shotHeight + offsetY;
        boxes.push({ shotIndexX: sx, shotIndexY: sy, left, bottom, w: shotWidth, h: shotHeight });
      }
    }
    return boxes;
  }, [totalShotsX, totalShotsY, shotWidth, shotHeight, offsetX, offsetY]);

  // build die boxes (µm coords)
  const dieBoxes = useMemo(() => {
    const boxes = [];
    for (let dy = 0; dy < dieRows; dy++) {
      for (let dx = 0; dx < dieCols; dx++) {
        // die index to shot
        const shotIndexX = Math.floor(dx / splitX);
        const shotIndexY = Math.floor(dy / splitY);
        const dieLocalX = dx % splitX;
        const dieLocalY = dy % splitY;
        const shotLeft = shotIndexX * shotWidth + offsetX;
        const shotBottom = shotIndexY * shotHeight + offsetY;
        const left = shotLeft + dieLocalX * dieWidth;
        const bottom = shotBottom + dieLocalY * dieHeight;
        boxes.push({ dieIndexX: dx, dieIndexY: dy, left, bottom, w: dieWidth, h: dieHeight, shotIndexX, shotIndexY });
      }
    }
    return boxes;
  }, [dieCols, dieRows, dieWidth, dieHeight, splitX, splitY, shotWidth, shotHeight, offsetX, offsetY]);

  return (
    <div style={{ display: "flex", gap: 12, userSelect: "none", fontFamily: "Inter, Arial, sans-serif" }}>
      <div>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          style={{ background: "#fff", border: "1px solid #ddd", cursor: dragRef.current ? "grabbing" : "grab" }}
        >
          {/* background center cross */}
          <g>
            <line x1={width/2 - 10} y1={height/2} x2={width/2 + 10} y2={height/2} stroke="#eee" strokeWidth={1}/>
            <line x1={width/2} y1={height/2 - 10} x2={width/2} y2={height/2 + 10} stroke="#eee" strokeWidth={1}/>
          </g>

          {/* shots overlay */}
          {showShots && shotBoxes.map(sb => {
            const { x, y, w, h } = rectUmToSvg(sb.left, sb.bottom, sb.w, sb.h);
            const isSelected = selected && selected.type === "shot" && selected.shotIndexX === sb.shotIndexX && selected.shotIndexY === sb.shotIndexY;
            return (
              <g key={`shot-${sb.shotIndexX}-${sb.shotIndexY}`}>
                <rect x={x} y={y} width={w} height={h} fill="none" stroke={isSelected ? "#ff6b6b" : "#9fb0d6"} strokeWidth={isSelected ? 2.2 : 1.2} />
                <text x={x + 6} y={y + 14} fontSize={10} fill="#234" pointerEvents="none">{`S[${sb.shotIndexX},${sb.shotIndexY}]`}</text>
              </g>
            );
          })}

          {/* die overlay */}
          {showDies && dieBoxes.map(db => {
            const { x, y, w, h } = rectUmToSvg(db.left, db.bottom, db.w, db.h);
            const isSelected = selected && selected.type === "die" && selected.dieIndexX === db.dieIndexX && selected.dieIndexY === db.dieIndexY;
            return (
              <g key={`die-${db.dieIndexX}-${db.dieIndexY}`}>
                <rect x={x} y={y} width={w} height={h} fill="none" stroke={isSelected ? "#ffa94d" : "#f1f5f9"} strokeWidth={isSelected ? 1.6 : 0.6} />
              </g>
            );
          })}

          {/* points (probe-card style) */}
          {showPoints && converted.map((pt, i) => {
            const [px, py] = umToPx([pt.shotX, pt.shotY]);
            const r = Math.max(1.2, 3 * Math.max(0.6, view.scale * 0.7));
            const color = valueToHsl(pt.value, vMin, vMax);
            return (
              <circle
                key={`pt-${i}`}
                cx={px}
                cy={py}
                r={r}
                fill={color}
                stroke="#fff"
                strokeWidth={0.4}
                onMouseEnter={(e) => setHover({ pt, px: e.clientX, py: e.clientY })}
                onMouseLeave={() => setHover(null)}
                onClick={() => setSelected({ type: "point", pt })}
                style={{ cursor: "pointer" }}
              />
            );
          })}

          {/* labels: show selected highlight */}
          {selected && selected.type === "point" && (() => {
            const p = selected.pt;
            const [px, py] = umToPx([p.shotX, p.shotY]);
            return (
              <g>
                <circle cx={px} cy={py} r={12} fill="none" stroke="#ff6b6b" strokeWidth={1.6} />
              </g>
            );
          })()}
        </svg>
      </div>

      {/* side panel */}
      <div style={{ width: 340 }}>
        <h3 style={{ margin: 0 }}>Wafer Viewer (center-aligned)</h3>
        <div style={{ fontSize: 12, color: "#444", marginTop: 6 }}>
          Pan: drag, Zoom: mouse wheel. Click a point to select. Shot/Die overlays shown.
        </div>

        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ padding: 8, background: "#fbfbff", border: "1px solid #eef" }}>
            <div style={{ fontSize: 12, color: "#333", fontWeight: 700 }}>Scale</div>
            <div style={{ fontSize: 12, color: "#666" }}>µm → px scale: {(scale * view.scale).toFixed(6)}</div>
          </div>
          <div style={{ padding: 8, background: "#fbfbff", border: "1px solid #eef" }}>
            <div style={{ fontSize: 12, color: "#333", fontWeight: 700 }}>Grid</div>
            <div style={{ fontSize: 12, color: "#666" }}>Die: {dieCols}×{dieRows}</div>
            <div style={{ fontSize: 12, color: "#666" }}>Shot split: {splitX}×{splitY} → Shots: {totalShotsX}×{totalShotsY}</div>
          </div>
        </div>

        <div style={{ marginTop: 12, padding: 8, borderRadius: 8, background: "#fff", border: "1px solid #efefef" }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Selected</div>
          {!selected && <div style={{ color: "#666", marginTop: 8 }}>None — click a point, die or shot.</div>}
          {selected && selected.type === "point" && (() => {
            const p = selected.pt;
            return (
              <div style={{ marginTop: 8 }}>
                <div><strong>Value:</strong> {p.value.toFixed(4)}</div>
                <div><strong>Die idx:</strong> [{p.indexX}, {p.indexY}]</div>
                <div><strong>Die local:</strong> [{p.dieLocalX}, {p.dieLocalY}]</div>
                <div><strong>Shot idx:</strong> [{p.shotIndexX}, {p.shotIndexY}]</div>
                <div><strong>Shot local (µm):</strong> {p.shotLocalX.toFixed(2)}, {p.shotLocalY.toFixed(2)}</div>
                <div><strong>Shot-based pos (µm):</strong> {p.shotX.toFixed(2)}, {p.shotY.toFixed(2)}</div>
                <div><strong>Aligned die idx:</strong> [{p.alignedDieX.toFixed(2)}, {p.alignedDieY.toFixed(2)}]</div>
              </div>
            );
          })()}
        </div>

        {/* hover tooltip */}
        {hover && (
          <div style={{
            position: "fixed",
            left: hover.px + 12,
            top: hover.py + 8,
            pointerEvents: "none",
            background: "rgba(20,20,20,0.9)",
            color: "white",
            padding: "6px 8px",
            borderRadius: 6,
            fontSize: 12,
            zIndex: 50
          }}>
            <div>value: {hover.pt.value.toFixed(4)}</div>
            <div>die: [{hover.pt.indexX},{hover.pt.indexY}]</div>
            <div>shot: [{hover.pt.shotIndexX},{hover.pt.shotIndexY}]</div>
            <div>shotPos: {hover.pt.shotX.toFixed(1)}, {hover.pt.shotY.toFixed(1)} µm</div>
            <div>alignedDie: [{hover.pt.alignedDieX.toFixed(2)},{hover.pt.alignedDieY.toFixed(2)}]</div>
          </div>
        )}

        {/* legend */}
        <div style={{ marginTop: 12, padding: 8, background: "#fff", border: "1px solid #efefef", borderRadius: 8 }}>
          <div style={{ fontWeight: 700 }}>Heatmap legend</div>
          <div style={{ height: 14, marginTop: 8, display: "flex", gap: 0 }}>
            {/* render gradient bar */}
            <div style={{ flex: 1, height: "100%", background: `linear-gradient(90deg, hsl(240deg 80% 52%), hsl(120deg 80% 48%), hsl(0deg 80% 48%))` }}></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 6 }}>
            <div>{vMin.toFixed(3)}</div>
            <div>{((vMin+vMax)/2).toFixed(3)}</div>
            <div>{vMax.toFixed(3)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
