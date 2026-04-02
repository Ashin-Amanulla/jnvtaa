import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

const variantClass = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

export function SketchButton({
  to,
  href,
  variant = "primary",
  className,
  children,
  ...props
}) {
  const cls = cn(variantClass[variant] || variantClass.primary, "focus-ring", className);

  if (href) {
    return (
      <a href={href} className={cls} {...props}>
        {children}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}
