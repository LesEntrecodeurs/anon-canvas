export interface Point {
  x: number;
  y: number;
}

export interface AnonZoneProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class AnonZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(props: AnonZoneProps) {
    this.id = crypto.randomUUID();
    this.x = props.x;
    this.y = props.y;
    this.width = props.width;
    this.height = props.height;
  }

  isInside(point: Point): boolean {
    const startX = this.x;
    const endX = this.x + this.width;
    const startY = this.y;
    const endY = this.y + this.height;

    // Use of math.min and math.max to handle negative coordinates
    return (
      point.x > Math.min(startX, endX) &&
      point.x < Math.max(startX, endX) &&
      point.y > Math.min(startY, endY) &&
      point.y < Math.max(startY, endY)
    );
  }
}
