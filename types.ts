
export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

export interface SolverResult {
  latex: string;
  error?: string;
}
