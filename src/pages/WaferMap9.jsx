// App.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import WaferMap from "../components/atoms/diemapTransform/WaferMap.jsx";

export default function WaferMap9() {
  return (
    <div style={{ padding: 12 }}>
      <h2>Wafer Map Viewer — Center-Aligned, Shot/Die Overlay, Heatmap</h2>
      <WaferMap
        width={1200}
        height={820}
        dieCols={28}
        dieRows={26}
        dieWidth={10000}   // µm (10 mm)
        dieHeight={10000}  // µm (10 mm)
        splitX={2}
        splitY={3}
        offsetX={0}
        offsetY={0}
        showShots={true}
        showDies={true}
        showPoints={true}
        // points={yourArray} // optional: pass real measurement array
      />
    </div>
  );
}

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(<App />);
