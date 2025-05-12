import { useRef } from "react";
import { AnonCanvas, type AnonCanvasApi } from "./anon-canvas";

const IMAGE_SRC =
  "https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function App() {
  const ref = useRef<AnonCanvasApi | null>(null);
  return (
    <div>
      <AnonCanvas imageSrc={IMAGE_SRC} zoneColor="black" ref={ref} />
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
