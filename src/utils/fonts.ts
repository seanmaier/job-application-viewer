import type { AppFont } from '../types';

export const FONT_STACKS: Record<AppFont, string> = {
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', Times, serif",
  mono: "'SF Mono', 'Cascadia Code', 'Consolas', 'Courier New', monospace",
};

export const FONT_LABELS: Record<AppFont, string> = {
  sans: 'sans',
  serif: 'serif',
  mono: 'mono',
};

export const ALL_FONTS: AppFont[] = ['sans', 'serif', 'mono'];
