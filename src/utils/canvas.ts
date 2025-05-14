export const setupCanvas = (
  canvas: HTMLCanvasElement,
  width?: number,
  height?: number,
) => {
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const w = width ?? canvas.clientWidth;
  const h = height ?? canvas.clientHeight;
  canvas.width = w;
  canvas.style.width = `${w}px`;

  canvas.height = h;
  canvas.style.height = `${h}px`;

  canvas.style.cursor = "crosshair";
};

export const drawImage = (
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  objectFit: "contain" | "cover",
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  let drawWidth = w;
  let drawHeight = h;

  if (objectFit === "contain") {
    const canvasRatio = w / h;
    const imageRatio = image.width / image.height;
    if (imageRatio > canvasRatio) {
      drawWidth = w;
      drawHeight = w / imageRatio;
    } else {
      drawHeight = h;
      drawWidth = h * imageRatio;
    }
  }

  const dx = (w - drawWidth) / 2;
  const dy = (h - drawHeight) / 2;

  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
};
