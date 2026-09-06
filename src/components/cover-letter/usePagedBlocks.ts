import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export interface Block {
  key: string;
  node: ReactNode;
}

// 297mm A4 height minus 10mm top + 10mm bottom print padding, converted at the
// same 794px/210mm scale the on-screen .doc-page width already uses.
const PAGE_CONTENT_HEIGHT_PX = 1040;

function samePages(a: string[][], b: string[][]): boolean {
  return a.length === b.length && a.every((page, i) => (
    page.length === b[i].length && page.every((key, j) => key === b[i][j])
  ));
}

/**
 * Greedily groups `blocks` into page-sized chunks by measuring their rendered
 * height (via offsetTop, which already accounts for collapsed margins) against
 * an off-screen clone. Purely a visual aid for previewing where a print page
 * break would fall — the actual print/PDF output paginates independently via
 * CSS break-inside/break-after.
 */
export function usePagedBlocks(blocks: Block[], enabled: boolean) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[][]>(() => [blocks.map((b) => b.key)]);

  useLayoutEffect(() => {
    if (!enabled) {
      const single = [blocks.map((b) => b.key)];
      setPages((prev) => (samePages(prev, single) ? prev : single));
      return;
    }

    const container = measureRef.current;
    if (!container) return;
    const children = Array.from(container.children) as HTMLElement[];

    const next: string[][] = [];
    let current: string[] = [];
    // offsetTop is relative to the .doc-page's own border box, so the first
    // block already sits at its top padding — start the budget from there,
    // not from 0, or the first page's content budget would be short-changed
    // by that padding.
    let pageStart = children[0]?.offsetTop ?? 0;

    blocks.forEach((b, i) => {
      const el = children[i];
      if (!el) return;
      const bottom = el.offsetTop + el.offsetHeight;
      if (current.length > 0 && bottom - pageStart > PAGE_CONTENT_HEIGHT_PX) {
        next.push(current);
        current = [];
        pageStart = el.offsetTop;
      }
      current.push(b.key);
    });
    if (current.length > 0) next.push(current);
    const result = next.length > 0 ? next : [[]];

    setPages((prev) => (samePages(prev, result) ? prev : result));
  }, [enabled, blocks]);

  return { measureRef, pages };
}
