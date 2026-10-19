'use client';

import React from 'react';
import { FixCard } from './FixCard';
import type { Fix } from '@repometric/core';

export function FixItem({
  fix,
  isDone,
  onToggleDone,
}: {
  fix: Fix;
  isDone?: boolean;
  onToggleDone?: (id: string, done: boolean) => void;
}) {
  return <FixCard fix={fix} isDone={isDone} onToggleDone={onToggleDone} />;
}

export * from './FixCard';
