import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type CyberButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type CyberButtonSize = "sm" | "md" | "lg";

interface CyberButtonSharedProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  leadingIcon?: ReactNode;
  loading?: boolean;
  size?: CyberButtonSize;
  trailingIcon?: ReactNode;
  variant?: CyberButtonVariant;
}

type CyberButtonAsButton = CyberButtonSharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CyberButtonSharedProps> & {
    href?: never;
  };

type CyberButtonAsLink = CyberButtonSharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CyberButtonSharedProps | "href"> & {
    href: string;
  };

export type CyberButtonProps = CyberButtonAsButton | CyberButtonAsLink;

const variantClasses: Record<CyberButtonVariant, string> = {
  primary:
    "border-primary-neon bg-primary-neon text-background-deep shadow-neon-cyan hover:border-text-pure hover:bg-text-pure",
  secondary:
    "border-secondary-purple bg-secondary-purple text-white shadow-neon-purple hover:bg-secondary-violet",
  outline:
    "border-white/15 bg-transparent text-text-pure hover:border-primary-neon/50 hover:bg-primary-neon/[0.06] hover:text-primary-neon",
  ghost:
    "border-transparent bg-transparent text-text-dark hover:bg-white/[0.05] hover:text-text-pure",
  danger:
    "border-status-danger/45 bg-status-danger/10 text-status-danger hover:bg-status-danger hover:text-background-deep",
};

const sizeClasses: Record<CyberButtonSize, string> = {
  sm: "min-h-9 px-3 text-[10px]",
  md: "min-h-11 px-4 text-[11px]",
  lg: "min-h-13 px-6 text-xs",
};

export function cyberButtonClasses({
  className,
  size = "md",
  variant = "primary",
}: Pick<CyberButtonSharedProps, "className" | "size" | "variant"> = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 border font-mono font-black uppercase tracking-[0.14em]",
    "transition-[color,background-color,border-color,box-shadow,transform] duration-[var(--motion-duration-normal)]",
    "focus-visible:bio-focus disabled:pointer-events-none disabled:opacity-45",
    "motion-safe:hover:-translate-y-px motion-reduce:transform-none",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function CyberButton(props: CyberButtonProps) {
  const {
    children,
    className,
    disabled = false,
    leadingIcon,
    loading = false,
    size = "md",
    trailingIcon,
    variant = "primary",
    ...rest
  } = props;
  const content = (
    <>
      {loading ? (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : (
        leadingIcon
      )}
      <span>{children}</span>
      {!loading && trailingIcon}
    </>
  );
  const classes = cyberButtonClasses({ className, size, variant });

  if ("href" in props && props.href) {
    const linkProps = rest as Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      "children" | "className" | "href"
    >;

    return (
      <Link
        {...linkProps}
        href={props.href}
        className={classes}
        aria-disabled={disabled || loading}
        tabIndex={disabled || loading ? -1 : linkProps.tabIndex}
        onClick={(event) => {
          if (disabled || loading) {
            event.preventDefault();
            return;
          }
          linkProps.onClick?.(event);
        }}
      >
        {content}
      </Link>
    );
  }

  const buttonProps = rest as Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "className" | "disabled"
  >;

  return (
    <button
      {...buttonProps}
      type={buttonProps.type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {content}
    </button>
  );
}
