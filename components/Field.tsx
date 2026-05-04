"use client";

import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldProps = {
  label: string;
  hint?: string;
};

type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldProps;
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps;

const baseInput =
  "w-full min-h-[52px] rounded-xl border border-ink/15 bg-white px-4 text-lg text-ink placeholder:text-ink/30 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10";

export function TextField({ label, hint, className = "", ...rest }: InputProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink/70">{label}</span>
      <input className={`${baseInput} ${className}`} {...rest} />
      {hint ? <span className="mt-1 block text-xs text-ink/50">{hint}</span> : null}
    </label>
  );
}

export function TextArea({ label, hint, className = "", ...rest }: TextareaProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink/70">{label}</span>
      <textarea
        className={`${baseInput} py-3 leading-snug ${className}`}
        rows={3}
        {...rest}
      />
      {hint ? <span className="mt-1 block text-xs text-ink/50">{hint}</span> : null}
    </label>
  );
}
