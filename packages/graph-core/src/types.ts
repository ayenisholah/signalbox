export interface SubgraphInput {
  name: string;
  sdl: string;
  owner?: string;
}

export interface SubgraphRef {
  name: string;
  owner?: string;
}

/** Plain data, so a Web Worker can post it. */
export interface ComposedGraph {
  success: true;
  sdl: string;
  fields: Map<string, SubgraphRef[]>;
  types: Map<string, TypeData>;
  warnings: string[];
}

export interface TypeData {
  isEntity: boolean;
  subgraphs: SubgraphRef[];
}

export type TypeKind = "object" | "interface" | "input" | "enum" | "union" | "scalar";

export interface MapField {
  name: string;
  type: string;
  namedType: string;
  subgraphs: SubgraphRef[];
}

export interface MapType extends TypeData {
  name: string;
  kind: TypeKind;
  fields: MapField[];
  members: string[];
}

export interface MapSubgraph extends SubgraphRef {
  entities: string[];
  fieldCount: number;
}

/** Arrays only, so it can be written to JSON and handed to the browser. */
export interface GraphMap {
  subgraphs: MapSubgraph[];
  types: MapType[];
}

export interface CompositionFailure {
  success: false;
  errors: string[];
}

export type CompositionResult = ComposedGraph | CompositionFailure;

export type ChangeKind = "removed" | "type-changed" | "arguments-changed" | "required-input-added";

export interface SchemaChange {
  coordinate: string;
  kind: ChangeKind;
}

export interface OperationInput {
  name: string;
  document: string;
}

export interface Screen {
  name: string;
  operations: string[];
}

export interface AffectedOperation {
  name: string;
  fields: string[];
  errors: string[];
}

export interface ImpactInput {
  before: string;
  after: string;
  operations: OperationInput[];
  screens?: Screen[];
}

export interface Impact {
  changes: SchemaChange[];
  operations: AffectedOperation[];
  screens: Screen[];
}
