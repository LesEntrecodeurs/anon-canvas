import { useRef } from "react";
import { AnonCanvas, type AnonCanvasApi } from "./anon-canvas";
import example from "/example.png";

function App() {
  const ref = useRef<AnonCanvasApi | null>(null);
  return (
    <div>
      <AnonCanvas imageSrc={example} ref={ref} width={500} height={500} />
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
