import { rectangle } from "./primitives/rectangle";
import { circle } from "./primitives/circle";
import { Shape2D } from "./api/shape2d";
import { toSVG } from "./export/svg";

// Complex intersection case - circle extending beyond rectangle
const rect = new Shape2D(rectangle(120, 80));
const cutter = new Shape2D(circle(40)).translate(90, 40);

const result = rect.subtract(cutter);

console.log(toSVG(result.shape));
