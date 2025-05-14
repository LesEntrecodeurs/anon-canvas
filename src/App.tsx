import { AnonCanvas } from "./anon-canvas";
import example from "./assets/example.png";

function App() {
  return (
    <div style={{ display: "flex", gap: "20px", flexDirection: "column" }}>
      <AnonCanvas
        imageSrc={example}
        style={{ width: "400px", height: "400px" }}
      />
      <AnonCanvas
        imageSrc={example}
        style={{ width: "200px", height: "400px" }}
        objectFit="cover"
      />
    </div>
  );
}

export default App;
