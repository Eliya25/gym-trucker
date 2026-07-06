import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-emerald-900 disabled:text-emerald-300/50",
  secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
  danger: "bg-red-600 text-white hover:bg-red-500 disabled:bg-red-900",
  ghost: "bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
