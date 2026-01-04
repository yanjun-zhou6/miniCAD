import { Vec2, cross, sub } from "./vec";

export function segmentIntersection(
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2
): Vec2 | null {
  const r = sub(a2, a1);
  const s = sub(b2, b1);

  const denom = cross(r, s);
  if (Math.abs(denom) < 1e-8) return null;

  const t = cross(sub(b1, a1), s) / denom;
  const u = cross(sub(b1, a1), r) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: a1.x + t * r.x,
      y: a1.y + t * r.y,
    };
  }

  return null;
}

export function pointInPolygon(p: Vec2, poly: Vec2[]): boolean {
  let inside = false;

  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;

    const intersect =
      yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}
