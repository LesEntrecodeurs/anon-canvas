import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type MouseEventHandler,
} from "react";
import { AnonZone, type AnonZoneProps, type Point } from "./anon-zone";

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

    const [basePoint, setBasePoint] = useState<Point | null>(null);
    const [anonZones, setAnonZones] = useState<AnonZone[]>(
      zones ? zones.map((zone) => new AnonZone(zone)) : [],
    );

    useEffect(() => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!ctx || !canvas) return;
      const image = new Image();
      image.src = imageSrc;

      image.onload = () => {
        canvas.width = width ?? image.width;
        canvas.height = height ?? image.height;
        ctx.drawImage(image, 0, 0);
        imageRef.current = image;
      };
    }, [canvasRef.current, width, height, imageSrc]);

    const saveAnonZone = (zone: AnonZone) => {
      setAnonZones((prev) => [...prev, zone]);
    };

    const deleteAnonZone = (id: string) => {
      setAnonZones((prev) => prev.filter((zone) => zone.id !== id));
    };

    const redrawCanvas = () => {
      const ctx = canvasRef.current?.getContext("2d");
      const image = imageRef.current;
      if (!ctx || !image) return;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(image, 0, 0);
      ctx.fillStyle = zoneColor;
      anonZones.forEach((zone) => {
        ctx.beginPath();
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
      });
    };

    const handleMouseDown: MouseEventHandler<HTMLCanvasElement> = (e) => {
      setBasePoint({
        x: e.clientX - (canvasRef.current?.offsetLeft || 0),
        y: e.clientY - (canvasRef.current?.offsetTop || 0),
      });

      props.onMouseDown?.(e);
    };

    const handleMouseUp: MouseEventHandler<HTMLCanvasElement> = (e) => {
      const currentPoint = {
        x: e.clientX - (canvasRef.current?.offsetLeft || 0),
        y: e.clientY - (canvasRef.current?.offsetTop || 0),
      };
      saveAnonZone(
        new AnonZone({
          x: basePoint?.x || 0,
          y: basePoint?.y || 0,
          width: currentPoint.x - (basePoint?.x || 0),
          height: currentPoint.y - (basePoint?.y || 0),
        }),
      );
      setBasePoint(null);

      props.onMouseUp?.(e);
    };

    const handleMouseLeave: MouseEventHandler<HTMLCanvasElement> = (e) => {
      if (basePoint) {
        const currentPoint = {
          x: e.clientX - (canvasRef.current?.offsetLeft || 0),
          y: e.clientY - (canvasRef.current?.offsetTop || 0),
        };
        saveAnonZone(
          new AnonZone({
            x: basePoint?.x || 0,
            y: basePoint?.y || 0,
            width: currentPoint.x - (basePoint?.x || 0),
            height: currentPoint.y - (basePoint?.y || 0),
          }),
        );
      }
      setBasePoint(null);

      props.onMouseLeave?.(e);
    };

    const handleMouseMove: MouseEventHandler<HTMLCanvasElement> = (e) => {
      if (!basePoint) return;

      const ctx = canvasRef.current?.getContext("2d");
      const image = imageRef.current;

      if (!ctx || !image) return;

      const currentPoint = {
        x: e.clientX - (canvasRef.current?.offsetLeft || 0),
        y: e.clientY - (canvasRef.current?.offsetTop || 0),
      };

      const width = currentPoint.x - basePoint.x;
      const height = currentPoint.y - basePoint.y;

      redrawCanvas();
      ctx.fillStyle = zoneColor;
      ctx.beginPath();
      ctx.fillRect(basePoint.x, basePoint.y, width, height);

      props.onMouseMove?.(e);
    };

    const handleDoubleClick: MouseEventHandler<HTMLCanvasElement> = (e) => {
      const currentPoint = {
        x: e.clientX - (canvasRef.current?.offsetLeft || 0),
        y: e.clientY - (canvasRef.current?.offsetTop || 0),
      };

      for (const zone of anonZones) {
        if (zone.isInside(currentPoint)) {
          deleteAnonZone(zone.id);
          return;
        }
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

    useEffect(() => {
      redrawCanvas();
    }, [anonZones]);

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
