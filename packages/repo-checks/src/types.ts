export interface RepoFile {
  path: string;
  content: string;
}

export interface Violation {
  path: string;
  line?: number;
  message: string;
}

export type Check = (files: RepoFile[]) => Violation[];
