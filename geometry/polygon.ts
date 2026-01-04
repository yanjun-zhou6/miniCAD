import { Vec2 } from "./vec";

export type Polygon = {
  vertices: Vec2[]; // CCW
};

export type Shape = {
  polygons: Polygon[];
};
