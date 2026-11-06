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
  warnings: string[];
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
