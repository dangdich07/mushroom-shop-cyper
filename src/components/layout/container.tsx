import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  clean?: boolean;
  wide?: boolean;
}

export function Container({ children, className, clean = false, wide = false, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8",
        !clean && (wide ? "max-w-[var(--layout-wide-max)]" : "max-w-[var(--layout-content-max)]"),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
