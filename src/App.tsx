import { AnonCanvas, type AnonCanvasApi } from "./anon-canvas";
import example from "./assets/example.png";
import { useRef } from "react";

function App() {
const ref = useRef<AnonCanvasApi | null>(null);
  return (
    <div style={{ display: "flex", gap: "20px", flexDirection: "column" }}>
      <AnonCanvas
        imageSrc={example}
        style={{ width: "400px", height: "400px" }}
		ref={ref}
		onZonesUpdate={(zones) => {
			console.log("Zones updated:", zones);
		}}
      />
      <AnonCanvas
        imageSrc={example}
        style={{ width: "200px", height: "400px" }}
        objectFit="cover"
		onZonesUpdate={(zones) => {
			console.log("Zones updated:", zones);
		}}
      />
    </div>
  );
}

export default App;
