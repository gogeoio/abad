interface Edge {
  new(vertices: Array<Vertex>);
  hexagons(): Array<Hexagon>;

  vertices: Array<Vertex>;
}

interface HalfEdge {
  new(edge: Edge, direction?: number);
  vertices(): Array<Edge>;
  va(): Vertex;
  vb(): Vertex;
}

interface Point {
  x: number;
  y: number;
}

interface Vertex extends Point {
  edges: Array<Edge>;
  pushEdge(edge: Edge);
}

interface Hexagon {
  new(halfEdges: Array<HalfEdge>, attributes?: any);
  byRadius(radius: number, attributes?: any): Hexagon;
  vertices(): Array<Vertex>;
}

interface HexagonalStatic {
  Hexagon: Hexagon;
  precision(precision?: number);
}

declare var Hexagonal: HexagonalStatic;