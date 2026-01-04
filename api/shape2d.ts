import { Shape } from "../geometry/polygon";
import { translate, rotate, scale } from "../ops/transform";
import { subtract } from "../ops/subtract";

export class Shape2D {
  constructor(public readonly shape: Shape) {}

  translate(x: number, y: number): Shape2D {
    return new Shape2D(translate(this.shape, x, y));
  }

  rotate(rad: number): Shape2D {
    return new Shape2D(rotate(this.shape, rad));
  }

  scale(x: number, y: number): Shape2D {
    return new Shape2D(scale(this.shape, x, y));
  }

  subtract(other: Shape2D): Shape2D {
    return new Shape2D(subtract(this.shape, other.shape));
  }
}
