import { Shape } from "../geometry/polygon";
import { Vec2 } from "../geometry/vec";
import { segmentIntersection, pointInPolygon } from "../geometry/intersect";

const EPS = 1e-6;

function distance(a: Vec2, b: Vec2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function signedArea(vertices: Vec2[]): number {
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return area / 2;
}

function ensureCCW(vertices: Vec2[]): Vec2[] {
  if (signedArea(vertices) < 0) {
    return [...vertices].reverse();
  }
  return vertices;
}

// Find intersection points with additional metadata
interface IntersectionInfo {
  point: Vec2;
  subjectEdge: number;
  clipEdge: number;
  subjectT: number;
  clipT: number;
}

function findAllIntersections(
  subject: Vec2[],
  clip: Vec2[]
): IntersectionInfo[] {
  const intersections: IntersectionInfo[] = [];

  for (let i = 0; i < subject.length; i++) {
    const s1 = subject[i];
    const s2 = subject[(i + 1) % subject.length];

    for (let j = 0; j < clip.length; j++) {
      const c1 = clip[j];
      const c2 = clip[(j + 1) % clip.length];

      const intersection = segmentIntersection(s1, s2, c1, c2);
      if (intersection) {
        // Calculate parameters
        const subjectT =
          Math.abs(s2.x - s1.x) > Math.abs(s2.y - s1.y)
            ? (intersection.x - s1.x) / (s2.x - s1.x)
            : (intersection.y - s1.y) / (s2.y - s1.y);

        const clipT =
          Math.abs(c2.x - c1.x) > Math.abs(c2.y - c1.y)
            ? (intersection.x - c1.x) / (c2.x - c1.x)
            : (intersection.y - c1.y) / (c2.y - c1.y);

        intersections.push({
          point: intersection,
          subjectEdge: i,
          clipEdge: j,
          subjectT,
          clipT,
        });
      }
    }
  }

  return intersections;
}

// Get points on clip polygon between two intersection points
function getClipSegment(
  clip: Vec2[],
  startIntersection: IntersectionInfo,
  endIntersection: IntersectionInfo
): Vec2[] {
  const segment: Vec2[] = [];

  // Add the start intersection point
  segment.push(startIntersection.point);

  // If intersections are on the same edge, we might need to go around
  if (startIntersection.clipEdge === endIntersection.clipEdge) {
    // Check if we need to traverse the polygon
    if (Math.abs(startIntersection.clipT - endIntersection.clipT) > 0.5) {
      // Go the long way around
      let currentEdge = (startIntersection.clipEdge + 1) % clip.length;
      while (currentEdge !== endIntersection.clipEdge) {
        segment.push(clip[currentEdge]);
        currentEdge = (currentEdge + 1) % clip.length;
      }
    }
  } else {
    // Add vertices between the intersection edges
    let currentEdge = (startIntersection.clipEdge + 1) % clip.length;
    while (currentEdge !== (endIntersection.clipEdge + 1) % clip.length) {
      segment.push(clip[currentEdge]);
      currentEdge = (currentEdge + 1) % clip.length;
    }
  }

  // Add the end intersection point
  segment.push(endIntersection.point);

  return segment;
}

function complexSubtract(subject: Vec2[], clip: Vec2[]): Vec2[] {
  const intersections = findAllIntersections(subject, clip);

  if (intersections.length === 0) {
    return subject; // No intersections
  }

  if (intersections.length < 2) {
    return subject; // Need at least 2 intersections for proper subtraction
  }

  // Sort intersections by subject edge and parameter
  intersections.sort((a, b) => {
    if (a.subjectEdge !== b.subjectEdge) {
      return a.subjectEdge - b.subjectEdge;
    }
    return a.subjectT - b.subjectT;
  });

  const result: Vec2[] = [];
  let intersectionIndex = 0;

  for (let i = 0; i < subject.length; i++) {
    const current = subject[i];
    const next = subject[(i + 1) % subject.length];

    const currentInside = pointInPolygon(current, clip);

    // Add current vertex if it's outside
    if (!currentInside) {
      result.push(current);
    }

    // Process intersections on this edge
    const edgeIntersections: IntersectionInfo[] = [];
    while (
      intersectionIndex < intersections.length &&
      intersections[intersectionIndex].subjectEdge === i
    ) {
      edgeIntersections.push(intersections[intersectionIndex]);
      intersectionIndex++;
    }

    // Process pairs of intersections (entry/exit points)
    for (let j = 0; j < edgeIntersections.length; j += 2) {
      if (j + 1 < edgeIntersections.length) {
        const entryIntersection = edgeIntersections[j];
        const exitIntersection = edgeIntersections[j + 1];

        // Add the entry point
        result.push(entryIntersection.point);

        // Add the clip boundary segment between entry and exit
        const clipSegment = getClipSegment(
          clip,
          entryIntersection,
          exitIntersection
        );
        // Skip first and last points as they're the intersection points
        for (let k = 1; k < clipSegment.length - 1; k++) {
          result.push(clipSegment[k]);
        }

        // Add the exit point
        result.push(exitIntersection.point);
      }
    }
  }

  return result;
}

export function subtract(a: Shape, b: Shape): Shape {
  const aPts = ensureCCW(a.polygons[0].vertices);
  const bPts = ensureCCW(b.polygons[0].vertices);

  // Simple cases
  const aInsideB = aPts.every((p) => pointInPolygon(p, bPts));
  if (aInsideB) {
    return { polygons: [] };
  }

  const bInsideA = bPts.every((p) => pointInPolygon(p, aPts));
  if (bInsideA) {
    return {
      polygons: [{ vertices: aPts }, { vertices: [...bPts].reverse() }],
    };
  }

  // Check for any intersection
  const hasPointIntersection =
    bPts.some((p) => pointInPolygon(p, aPts)) ||
    aPts.some((p) => pointInPolygon(p, bPts));

  const intersections = findAllIntersections(aPts, bPts);
  const hasEdgeIntersection = intersections.length > 0;

  if (!hasPointIntersection && !hasEdgeIntersection) {
    return { polygons: [{ vertices: aPts }] };
  }

  // Complex intersection
  const result = complexSubtract(aPts, bPts);

  if (result.length < 3) {
    return { polygons: [] };
  }

  // Clean up duplicates
  const cleaned: Vec2[] = [];
  for (const point of result) {
    const last = cleaned[cleaned.length - 1];
    if (!last || distance(point, last) > EPS) {
      cleaned.push(point);
    }
  }

  if (
    cleaned.length > 2 &&
    distance(cleaned[0], cleaned[cleaned.length - 1]) <= EPS
  ) {
    cleaned.pop();
  }

  if (cleaned.length < 3) {
    return { polygons: [] };
  }

  return {
    polygons: [{ vertices: cleaned }],
  };
}
