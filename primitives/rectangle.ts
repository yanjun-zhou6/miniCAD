import { Shape } from "../geometry/polygon";

export function rectangle(width: number, height: number): Shape {
  return {
    polygons: [
      {
        vertices: [
          { x: 0, y: 0 },
          { x: width, y: 0 },
          { x: width, y: height },
          { x: 0, y: height },
        ],
      },
    ],
  };
}
