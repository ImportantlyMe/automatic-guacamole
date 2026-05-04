"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const styles: Record<Variant, string> = {
  primary:
    "bg-ink text-paper active:bg-black/80 disabled:bg-black/30",
  secondary:
    "bg-white text-ink border border-ink/20 active:bg-black/5 disabled:opacity-50",
  ghost: "bg-transparent text-ink active:bg-black/5",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className = "", variant = "primary", type = "button", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`min-h-[52px] px-5 rounded-xl text-base font-semibold tracking-tight transition-colors ${styles[variant]} ${className}`}
      {...rest}
    />
  );
});
