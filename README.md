# anon-zone

**anon-zone** is a reusable React component for drawing and managing mask zones over images. It is designed for applications where anonymizing part of an image is required, such as hiding personal information on medical scans (e.g., ultrasounds).

![AnonCanvas demo](./doc/demo.gif)

## Features

- Load any image and draw one or more rectangular mask zones
- Add, move and delete individual zones
- Export the resulting anonymized image as a PNG (Blob or Base64)
- Built with React and Canvas
- Lightweight API

## Installation

```bash
npm install anon-zone
# or
yarn add anon-zone
```

## Usage

```tsx
import { AnonCanvas, type AnonCanvasApi } from "anon-canvas";
import example from "/example.png";
import { useRef } from "react";

function App() {
  const ref = useRef<AnonCanvasApi | null>(null);

  const handleSave = async () => {
    const anonCanvas = ref.current;
    if (!anonCanvas) return;

    const image = await anonCanvas.toBlob();

    if (!image) return;

    const a = document.createElement("a");
    a.href = URL.createObjectURL(image);
    a.download = "image.png";
    a.click();
  };
  return (
    <div>
      <AnonCanvas imageSrc={example} width={500} height={500} ref={ref} />
      <button
        onClick={() => {
          ref.current?.reset();
        }}
      >
        Reset
      </button>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

export default App;
```

## Props

### `imageSrc` (string) – required

The source URL of the image to be displayed (can be local or external).
This is the base image on which anonymization zones will be applied.

### `zones` (AnonZoneProps[]) – optional

An array of predefined anonymization zones. Each zone should follow the shape:

```ts
{
  x: number;
  y: number;
  width: number;
  height: number;
}
```

If provided, these zones will be rendered automatically.

### `zoneColor` (string) – optional

The color used to render anonymization zones.
Default: black.

### `width` (number) – optional

The displayed width of the canvas in CSS pixels.
If not set, the canvas will use the image's natural width.

### `height` (number) – optional

The displayed height of the canvas in CSS pixels.
If not set, the canvas will use the image's natural height.

### `...rest` – optional

Any other valid props for a native <canvas> element can be passed (e.g. className, onClick, style, etc.).
This is enabled via React’s ComponentPropsWithoutRef<"canvas">.</canvas>

## API

An instance of the AnonCanvas component exposes the following methods through the ref:

- `toBlob`: Returns a Promise that resolves to a Blob of the anonymized image.
- `toBase64`: Returns a Promise that resolves to a Base64 string of the anonymized image.
- `reset`: Resets the canvas to its original state, removing all anonymization zones.
