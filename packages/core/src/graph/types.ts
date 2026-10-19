export interface RawImport {
  specifier: string;
  kind: 'static' | 'dynamic';
}

export interface TsConfigPaths {
  baseUrl?: string;
  paths?: Record<string, string[]>;
}

export interface SourceFile {
  path: string;
  content: string;
  size?: number;
  language?: string | null;
  isTest?: boolean;
}
