import type { ReactNode } from "react";
import { StatePanel } from "@/components/ui/state-panel";

interface BlogStatePanelProps {
  action?: ReactNode;
  kind: "LOADING" | "ERROR" | "EMPTY";
  message: string;
}

export function BlogStatePanel({ action, kind, message }: BlogStatePanelProps) {
  const tone = kind === "LOADING" ? "loading" : kind === "ERROR" ? "error" : "empty";
  const title = kind === "LOADING" ? "Đang tải dữ liệu" : kind === "ERROR" ? "Không thể tải dữ liệu" : "Chưa có dữ liệu";
  return <StatePanel tone={tone} title={title} description={message} action={action} />;
}

