"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbStep {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  steps: BreadcrumbStep[];
}

export function Breadcrumb({ steps }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-text-dark mb-6 overflow-x-auto whitespace-nowrap py-1">
      <Link href="/" className="hover:text-primary-neon transition-colors flex items-center gap-1">
        <Home className="w-3 h-3" /> CORE
      </Link>
      
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3 h-3 text-text-dark/40 shrink-0" />
          {step.href ? (
            <Link href={step.href} className="hover:text-primary-neon transition-colors">
              {step.label}
            </Link>
          ) : (
            <span className="text-primary-cyan font-bold">{step.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}