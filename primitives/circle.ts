import { Shape } from "../geometry/polygon";
import { Vec2 } from "../geometry/vec";

export function circle(radius: number, segments = 32): Shape {
  const vertices: Vec2[] = [];

  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;

    vertices.push({
      x: Math.cos(a) * radius,
      y: Math.sin(a) * radius,
    });
  }

  return {
    polygons: [{ vertices }],
  };
}
