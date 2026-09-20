import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-brand text-white hover:bg-brand-dark disabled:opacity-60",
  outline:
    "border border-border bg-card text-fg hover:border-brand",
  ghost: "text-muted hover:text-fg",
  danger: "text-danger hover:underline",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
