import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type MouseEventHandler,
} from "react";
import { AnonZone, type AnonZoneProps, type Point } from "./anon-zone";
import { drawImage, setupCanvas } from "./utils/canvas";

interface AnonCanvasProps
  extends Omit<ComponentPropsWithoutRef<"canvas">, "width" | "height"> {
  imageSrc: string;
  zones?: AnonZoneProps[];
  zoneColor?: string;
  width?: number;
  height?: number;
}

export interface AnonCanvasApi {
  reset: () => void;
  toBlob: () => Promise<Blob | null>;
  toBase64: () => string | null;
}

export const AnonCanvas = forwardRef<AnonCanvasApi, AnonCanvasProps>(
  (
    { imageSrc, zones, zoneColor = "red", className, width, height, ...props },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const [startedDrawingPoint, setStartedDrawingPoint] =
      useState<Point | null>(null);
    const [anonZones, setAnonZones] = useState<AnonZone[]>(
      zones ? zones.map((zone) => new AnonZone(zone)) : [],
    );

    const [movingZone, setMovingZone] = useState<AnonZone | null>(null);

    useEffect(() => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!ctx || !canvas) return;

      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = imageSrc;
      image.alt = "Anon Image";

      image.onload = () => {
        const w = width ?? image.width;
        const h = height ?? image.height;

        setupCanvas(canvas, w, h);
        drawImage(image, canvas);
        imageRef.current = image;
      };
    }, [canvasRef.current, width, height, imageSrc]);

    const redrawCanvas = () => {
      const ctx = canvasRef.current?.getContext("2d");
      const image = imageRef.current;
      if (!ctx || !image) return;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      drawImage(image, canvasRef.current!);
      ctx.fillStyle = zoneColor;
      anonZones.forEach((zone) => {
        ctx.beginPath();
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
      });
    };

    useEffect(() => {
      redrawCanvas();
    }, [anonZones]);

    const saveAnonZone = (zone: AnonZone) => {
      setAnonZones((prev) => [...prev, zone]);
    };

    const deleteAnonZone = (id: string) => {
      setAnonZones((prev) => prev.filter((zone) => zone.id !== id));
    };

    const getHoveredZone = (point: Point) => {
      return anonZones.find((zone) => zone.isInside(point));
    };

    const getCurrentPoint = (e: MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const handleMouseDown: MouseEventHandler<HTMLCanvasElement> = (e) => {
      const hoveredZone = getHoveredZone(getCurrentPoint(e));

      if (hoveredZone) {
        setMovingZone(hoveredZone);
      } else {
        setStartedDrawingPoint(getCurrentPoint(e));
      }

      props.onMouseDown?.(e);
    };

    const handleMouseUp: MouseEventHandler<HTMLCanvasElement> = (e) => {
      if (startedDrawingPoint) {
        const currentPoint = getCurrentPoint(e);
        saveAnonZone(
          new AnonZone({
            x: startedDrawingPoint?.x || 0,
            y: startedDrawingPoint?.y || 0,
            width: currentPoint.x - (startedDrawingPoint?.x || 0),
            height: currentPoint.y - (startedDrawingPoint?.y || 0),
          }),
        );
        setStartedDrawingPoint(null);
      } else if (movingZone) {
        setMovingZone(null);
      }

      props.onMouseUp?.(e);
    };

    const handleMouseLeave: MouseEventHandler<HTMLCanvasElement> = (e) => {
      if (startedDrawingPoint) {
        const currentPoint = {
          x: e.clientX - (canvasRef.current?.offsetLeft || 0),
          y: e.clientY - (canvasRef.current?.offsetTop || 0),
        };
        saveAnonZone(
          new AnonZone({
            x: startedDrawingPoint?.x || 0,
            y: startedDrawingPoint?.y || 0,
            width: currentPoint.x - (startedDrawingPoint?.x || 0),
            height: currentPoint.y - (startedDrawingPoint?.y || 0),
          }),
        );
      } else if (movingZone) {
        setMovingZone(null);
      }
      setStartedDrawingPoint(null);

      props.onMouseLeave?.(e);
    };

    const handleMouseMove: MouseEventHandler<HTMLCanvasElement> = (e) => {
      const ctx = canvasRef.current?.getContext("2d");
      const currentPoint = getCurrentPoint(e);

      if (!ctx) return;

      const hoveredZone = getHoveredZone(getCurrentPoint(e));
      if (hoveredZone || movingZone) {
        canvasRef.current!.style.cursor = "pointer";
      } else {
        canvasRef.current!.style.cursor = "crosshair";
      }

      if (startedDrawingPoint) {
        const width = currentPoint.x - startedDrawingPoint.x;
        const height = currentPoint.y - startedDrawingPoint.y;

        redrawCanvas();
        ctx.fillStyle = zoneColor;
        ctx.beginPath();
        ctx.fillRect(
          startedDrawingPoint.x,
          startedDrawingPoint.y,
          width,
          height,
        );
      } else if (movingZone) {
        setAnonZones((prev) =>
          prev.map((zone) => {
            if (zone.id === movingZone?.id) {
              zone.x = currentPoint.x - movingZone.width / 2;
              zone.y = currentPoint.y - movingZone.height / 2;
            }

            return zone;
          }),
        );
      }

      props.onMouseMove?.(e);
    };

    const handleDoubleClick: MouseEventHandler<HTMLCanvasElement> = (e) => {
      const currentPoint = getCurrentPoint(e);

      const hoveredZone = getHoveredZone(currentPoint);

      if (hoveredZone) {
        deleteAnonZone(hoveredZone.id);
      }

      props.onDoubleClick?.(e);
    };

    const reset = () => {
      setAnonZones([]);
    };

    const toBlob: () => Promise<Blob | null> = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        });
      });
    };

    const toBase64 = () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.toDataURL("image/png", 1);
    };

    useImperativeHandle(ref, () => ({
      reset,
      toBlob,
      toBase64,
    }));

    return (
      <canvas
        ref={canvasRef}
        className={className}
        {...props}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
      />
    );
  },
);
