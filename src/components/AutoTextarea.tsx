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
    el.style.height = `${el.scrollHeight + borderY}px`;
  }, [rest.value]);

  return (
    <textarea
      ref={ref}
      className={className}
      style={{ resize: 'none', overflow: 'hidden', flexShrink: 0 }}
      {...rest}
    />
  );
}
