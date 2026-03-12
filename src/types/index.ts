// Shared TypeScript interfaces for NexusCode

/** Represents a single file in the virtual file system */
export interface VirtualFile {
  id: string;
  name: string;
  language: string;
  path: string;
}

/** Represents a connected user in the collaboration session */
export interface CollabUser {
  id: number;
  name: string;
  color: string;
}

/** Awareness state broadcast by each client */
export interface AwarenessState {
  user: CollabUser;
  cursor: CursorPosition | null;
  activeFile: string | null;
}

/** Cursor position within a document */
export interface CursorPosition {
  lineNumber: number;
  column: number;
}

/** Map of awareness client IDs to their state */
export type AwarenessStates = Map<number, AwarenessState>;

/** Language detection mapping for file extensions */
export const LANGUAGE_MAP: Record<string, string> = {
  ts: "typescript",
  tsx: "typescriptreact",
  js: "javascript",
  jsx: "javascriptreact",
  json: "json",
  html: "html",
  css: "css",
  md: "markdown",
  py: "python",
  rs: "rust",
  go: "go",
  java: "java",
  c: "c",
  cpp: "cpp",
  rb: "ruby",
  sh: "shell",
  yml: "yaml",
  yaml: "yaml",
  xml: "xml",
  sql: "sql",
  txt: "plaintext",
};

/** Infer Monaco language from a filename */
export function inferLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return LANGUAGE_MAP[ext] ?? "plaintext";
}
