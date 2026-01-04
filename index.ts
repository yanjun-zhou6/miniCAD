import { rectangle } from "./primitives/rectangle";
import { circle } from "./primitives/circle";
import { Shape2D } from "./api/shape2d";
import { toSVG } from "./export/svg";

// const base = new Shape2D(rectangle(120, 80));
const hole = new Shape2D(circle(25)).translate(60, 40);

// const result = base.subtract(hole);
console.log(toSVG(hole.shape));
