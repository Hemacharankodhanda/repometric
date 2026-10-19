import type { CategoryId, RepoSnapshot, SignalResult } from '../types';

export interface SignalContext {
  snapshot: RepoSnapshot;
  now: Date;
}

export interface Signal {
  readonly id: string;
  readonly categoryId: CategoryId;
  readonly label: string;
  readonly max: number;
  compute(context: SignalContext): SignalResult;
}
