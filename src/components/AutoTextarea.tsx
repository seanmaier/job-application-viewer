import { useLayoutEffect, useRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function AutoTextarea({ className, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const style = window.getComputedStyle(el);
    // scrollHeight is content + padding only; box-border sizing (Tailwind's
    // preflight default) needs the border included too, or the assigned
    // height ends up a couple px short and clips the last line.
    const borderY = style.boxSizing === 'border-box'
      ? parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)
      : 0;
    el.style.height = 'auto';
    const height = `${el.scrollHeight + borderY}px`;
    el.style.height = height;
    // A flex item's automatic minimum size resolves to 0 when its overflow
    // isn't visible (which is exactly our case), letting flex-shrink crush it
    // below content size in a tight column. An explicit min-height (unlike
    // flex-shrink: 0) blocks only that height-axis shrink, without also
    // preventing width-axis shrink where the textarea sits in a row
    // alongside another element (e.g. a remove button).
    el.style.minHeight = height;
  }, [rest.value]);

  return (
    <textarea
      ref={ref}
      className={className}
      style={{ resize: 'none', overflow: 'hidden' }}
      {...rest}
    />
  );
}
