"use client";

import { useSyncExternalStore } from "react";

/**
 * Which (section, test) reports have been "sent to students" — set from the
 * test's own page, read back as a KPI on the class page. A plain
 * module-level store rather than component state, since the two pages
 * that need it are different routes and neither owns the other: this is
 * the same "resets on reload, not before" local-state contract every other
 * simulated action in this app already follows, just visible from two
 * screens instead of one.
 * 🔧 BACKEND REQUIRED — nothing is actually sent; this only tracks that a
 * send was requested, for this browser session.
 */

type ShareKey = string; // `${section}~${testKey}`

const shared = new Set<ShareKey>();
const listeners = new Set<() => void>();
let version = 0;

function key(section: string, testKey: string): ShareKey {
  return `${section}~${testKey}`;
}

function emit() {
  version++;
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function markReportShared(section: string, testKey: string) {
  shared.add(key(section, testKey));
  emit();
}

export function isReportShared(section: string, testKey: string): boolean {
  return shared.has(key(section, testKey));
}

/** Reactive read for one (section, test) pair — re-renders when it's shared. */
export function useReportShared(section: string, testKey: string): boolean {
  return useSyncExternalStore(subscribe, () => isReportShared(section, testKey), () => false);
}

// getSnapshot must return a stable (===) value when nothing changed, or
// useSyncExternalStore re-renders forever — cache the derived array per
// section and only recompute it when the store's version has moved on.
const keysCache = new Map<string, { version: number; keys: string[] }>();

/** Reactive read of every test key shared for a section, for the class
 * page's "Reports shared" KPI. */
export function useSharedTestKeys(section: string): string[] {
  const getSnapshot = () => {
    const cached = keysCache.get(section);
    if (cached && cached.version === version) return cached.keys;
    const prefix = `${section}~`;
    const keys = [...shared].filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length));
    keysCache.set(section, { version, keys });
    return keys;
  };
  return useSyncExternalStore(subscribe, getSnapshot, () => []);
}
