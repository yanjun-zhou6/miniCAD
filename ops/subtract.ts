import { Shape } from "../geometry/polygon";
import { Vec2, sub, cross } from "../geometry/vec";
import { segmentIntersection, pointInPolygon } from "../geometry/intersect";

type Node = {
  p: Vec2;
  next?: Node;
  prev?: Node;
  neighbor?: Node;
  intersect: boolean;
  entry: boolean;
  visited: boolean;
  alpha?: number;
};

/**
 * Build a circular doubly-linked list
 */
function buildList(points: Vec2[]): Node {
  const nodes = points.map((p) => ({
    p,
    intersect: false,
    entry: false,
    visited: false,
  })) as Node[];

  for (let i = 0; i < nodes.length; i++) {
    nodes[i].next = nodes[(i + 1) % nodes.length];
    nodes[i].prev = nodes[(i - 1 + nodes.length) % nodes.length];
  }

  return nodes[0];
}

/**
 * Insert node after start, ordered by alpha
 */
function insertNode(start: Node, node: Node) {
  let curr = start;
  while (
    curr.next !== start &&
    curr.next!.intersect &&
    curr.next!.alpha! < node.alpha!
  ) {
    curr = curr.next!;
  }

  node.next = curr.next;
  node.prev = curr;
  curr.next!.prev = node;
  curr.next = node;
}

/**
 * Classify intersection nodes as entry / exit
 */
function markEntryExit(subject: Node, clip: Vec2[]) {
  let curr = subject;
  let inside = pointInPolygon(curr.p, clip);

  do {
    if (curr.intersect) {
      curr.entry = !inside;
      inside = !inside;
    }
    curr = curr.next!;
  } while (curr !== subject);
}

/**
 * Walk result polygons
 */
function buildResult(subject: Node): Vec2[][] {
  const result: Vec2[][] = [];

  let curr = subject;
  do {
    if (curr.intersect && !curr.visited && curr.entry) {
      const polygon: Vec2[] = [];
      let node: Node | undefined = curr;

      while (node && !node.visited) {
        node.visited = true;
        polygon.push(node.p);

        if (node.intersect) {
          node = node.neighbor!;
        }
        node = node.next;
      }

      if (polygon.length > 2) {
        result.push(polygon);
      }
    }
    curr = curr.next!;
  } while (curr !== subject);

  return result;
}

/**
 * Main subtract operation: A - B
 */
export function subtract(a: Shape, b: Shape): Shape {
  const aPts = a.polygons[0].vertices;
  const bPts = b.polygons[0].vertices;

  const aList = buildList(aPts);
  const bList = buildList(bPts);

  // 1. Find intersections
  let aNode = aList;
  do {
    let bNode = bList;
    do {
      const i = segmentIntersection(
        aNode.p,
        aNode.next!.p,
        bNode.p,
        bNode.next!.p
      );

      if (i) {
        const aAlpha =
          Math.abs(aNode.p.x - aNode.next!.p.x) >
          Math.abs(aNode.p.y - aNode.next!.p.y)
            ? (i.x - aNode.p.x) / (aNode.next!.p.x - aNode.p.x)
            : (i.y - aNode.p.y) / (aNode.next!.p.y - aNode.p.y);

        const bAlpha =
          Math.abs(bNode.p.x - bNode.next!.p.x) >
          Math.abs(bNode.p.y - bNode.next!.p.y)
            ? (i.x - bNode.p.x) / (bNode.next!.p.x - bNode.p.x)
            : (i.y - bNode.p.y) / (bNode.next!.p.y - bNode.p.y);

        const aInt: Node = {
          p: i,
          intersect: true,
          entry: false,
          visited: false,
          alpha: aAlpha,
        };

        const bInt: Node = {
          p: i,
          intersect: true,
          entry: false,
          visited: false,
          alpha: bAlpha,
        };

        aInt.neighbor = bInt;
        bInt.neighbor = aInt;

        insertNode(aNode, aInt);
        insertNode(bNode, bInt);
      }

      bNode = bNode.next!;
    } while (bNode !== bList);

    aNode = aNode.next!;
  } while (aNode !== aList);

  // 2. Mark entry / exit
  markEntryExit(aList, bPts);

  // 3. Build result polygons
  const polygons = buildResult(aList).map((vertices) => ({ vertices }));

  return { polygons };
}
