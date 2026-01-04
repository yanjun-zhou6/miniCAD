import { Shape } from "../geometry/polygon";
import { Vec2 } from "../geometry/vec";

export function transform(shape: Shape, fn: (v: Vec2) => Vec2): Shape {
  return {
    polygons: shape.polygons.map((p) => ({
      vertices: p.vertices.map(fn),
    })),
  };
}

export function translate(shape: Shape, dx: number, dy: number): Shape {
  return transform(shape, (v) => ({
    x: v.x + dx,
    y: v.y + dy,
  }));
}

export function rotate(shape: Shape, rad: number): Shape {
  const c = Math.cos(rad);
  const s = Math.sin(rad);

  return transform(shape, (v) => ({
    x: v.x * c - v.y * s,
    y: v.x * s + v.y * c,
  }));
}

export function scale(shape: Shape, sx: number, sy: number): Shape {
  return transform(shape, (v) => ({
    x: v.x * sx,
    y: v.y * sy,
  }));
}
