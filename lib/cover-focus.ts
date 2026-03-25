import type { CSSProperties } from "react";

export const DEFAULT_COVER_FOCUS = 50;

type CoverFocusInput = {
  coverFocusX?: unknown;
  coverFocusY?: unknown;
};

export const normalizeCoverFocusValue = (value: unknown, fallback = DEFAULT_COVER_FOCUS) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(0, parsed));
};

export const resolveCoverFocus = (input?: CoverFocusInput) => ({
  x: normalizeCoverFocusValue(input?.coverFocusX),
  y: normalizeCoverFocusValue(input?.coverFocusY),
});

export const buildCoverObjectPosition = (input?: CoverFocusInput): CSSProperties => {
  const { x, y } = resolveCoverFocus(input);
  return { objectPosition: `${x}% ${y}%` };
};
