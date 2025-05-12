import { useRef } from "react";
import { AnonCanvas, type AnonCanvasApi } from "./anon-canvas";
import example from "/example.png";

function App() {
  const ref = useRef<AnonCanvasApi | null>(null);
  return (
    <div>
      <AnonCanvas
        imageSrc={example}
        zoneColor="#363637"
        ref={ref}
        width={800}
        height={800}
      />
      <button
        onClick={() => {
          ref.current?.reset();
        }}
      >
        Reset
      </button>
    </div>
  );
}

export default App;
