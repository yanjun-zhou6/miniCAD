import { Shape } from "../geometry/polygon";
import { pointInPolygon } from "../geometry/intersect";

export function subtract(a: Shape, b: Shape): Shape {
  const pa = a.polygons[0].vertices;
  const pb = b.polygons[0].vertices;

  const result = pa.filter((v) => !pointInPolygon(v, pb));

  return {
    polygons: result.length >= 3 ? [{ vertices: result }] : [],
  };
}
