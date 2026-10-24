import React, { useLayoutEffect, useRef } from 'react';

type AutoTextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'>;

/** Textarea tự giãn chiều cao theo nội dung. */
export function AutoTextarea({ value, className = '', ...rest }: AutoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return <textarea ref={ref} rows={1} value={value} className={`resize-none overflow-hidden ${className}`} {...rest} />;
}