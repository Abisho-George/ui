"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";

/** What a page tells the shell to show in the sticky page header. */
export interface PageHeaderInfo {
  /** The page's own name — "which page they're in". */
  title: string;
  /** Parent route to go back to. Omit on a top-level page (no back button). */
  backHref?: string;
}

interface PageHeaderContextValue {
  header: PageHeaderInfo | null;
  setHeader: (info: PageHeaderInfo | null) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null);

/** Wraps a shell (StaffShell, the student shell) so its pages can publish
 * a header and the shell can render it — one sticky bar per shell, fed by
 * whichever page is currently mounted. */
export function PageHeaderProvider({ children }: { children: React.ReactNode }) {
  const [header, setHeader] = useState<PageHeaderInfo | null>(null);
  return <PageHeaderContext.Provider value={{ header, setHeader }}>{children}</PageHeaderContext.Provider>;
}

/** Called by a page to say what the sticky header should show while it's
 * mounted. Runs before paint (useLayoutEffect) so navigating between pages
 * doesn't flash the previous page's title for a frame, and clears itself
 * on unmount so a page can never leak its header onto the next one. */
export function usePageHeader(info: PageHeaderInfo) {
  const ctx = useContext(PageHeaderContext);
  const { title, backHref } = info;
  useLayoutEffect(() => {
    ctx?.setHeader({ title, backHref });
    return () => ctx?.setHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, backHref]);
}

/** Read by the shell to render the current page's header. */
export function useCurrentPageHeader(): PageHeaderInfo | null {
  return useContext(PageHeaderContext)?.header ?? null;
}
