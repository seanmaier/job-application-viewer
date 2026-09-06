import { useLayoutEffect, useRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function AutoTextarea({ className, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
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
