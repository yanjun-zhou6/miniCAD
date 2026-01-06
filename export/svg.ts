import { Shape } from "../geometry/polygon";

export function toSVG(shape: Shape): string {
  const paths = shape.polygons.map(
    (p) => `M ${p.vertices.map((v) => `${v.x},${v.y}`).join(" L ")} Z`
  );

  return `
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="-150 -150 300 300">
  <path d="${paths.join(" ")}" fill="black" stroke="none" fill-rule="evenodd"/>
</svg>
`.trim();
}
