'use client';

import { useMemo, DependencyList } from 'react';

/**
 * A helper hook to stabilize Firebase references/queries.
 * Important to prevent infinite re-renders with useCollection/useDoc.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
