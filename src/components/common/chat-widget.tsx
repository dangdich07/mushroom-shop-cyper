"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { Bot, LoaderCircle, Send, Sparkles, X } from "lucide-react";
import { RoamingChatRobot } from "./roaming-chat-robot";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Xin chào! Tôi là Trợ lý Nấm F1. Tôi có thể giúp bạn tìm hiểu về nấm, sản phẩm CyberMushroom và cách mua hàng trên website.",
};

const SUGGESTIONS = ["Tư vấn nấm dược liệu", "Sản phẩm nào đang có?", "Cách theo dõi đơn hàng"];

export function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;

  async function sendMessage(content: string) {
    const normalized = content.trim();
    if (!normalized || pending) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: normalized };
    const conversation = [...messages.filter((message) => message.id !== "welcome"), userMessage].slice(-11);
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation.map(({ role, content: text }) => ({ role, content: text })) }),
      });
      const result = await response.json() as { reply?: string; error?: string };
      if (!response.ok || !result.reply) throw new Error(result.error || "Trợ lý chưa thể phản hồi lúc này.");
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: result.reply! }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Trợ lý chưa thể phản hồi lúc này.");
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return <div className="fixed bottom-5 right-4 z-50 font-mono sm:bottom-6 sm:right-6">{isOpen ? <section aria-label="Trợ lý Nấm F1" className="flex h-[min(36rem,calc(100dvh-2rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden border border-primary-neon/25 bg-background-deep shadow-[0_0_50px_rgba(0,245,255,.12)]"><header className="flex min-h-16 items-center justify-between border-b border-white/10 bg-primary-neon/10 px-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center bg-primary-neon text-background-deep"><Bot aria-hidden="true" className="h-5 w-5" /></span><div><h2 className="font-heading text-xs font-black uppercase tracking-widest text-text-pure">Trợ lý Nấm F1</h2><p className="mt-1 flex items-center gap-1 text-[9px] uppercase tracking-wider text-primary-neon"><Sparkles aria-hidden="true" className="h-3 w-3" />AI chuyên biệt CyberMushroom</p></div></div><button type="button" onClick={() => setIsOpen(false)} aria-label="Đóng trợ lý" className="flex min-h-11 min-w-11 items-center justify-center text-text-dark hover:text-text-pure focus-visible:bio-focus"><X aria-hidden="true" className="h-5 w-5" /></button></header><div ref={scrollRef} role="log" aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">{messages.map((message) => <div key={message.id} className={`max-w-[88%] whitespace-pre-wrap break-words border px-3 py-2.5 text-xs leading-5 ${message.role === "user" ? "ml-auto border-primary-neon/30 bg-primary-neon/10 text-text-pure" : "border-white/10 bg-white/[.03] text-text-muted"}`}>{message.content}</div>)}{messages.length === 1 && <div className="flex flex-wrap gap-2">{SUGGESTIONS.map((suggestion) => <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)} className="min-h-9 border border-white/10 px-2.5 text-left text-[9px] uppercase text-text-dark hover:border-primary-neon/30 hover:text-primary-neon focus-visible:bio-focus">{suggestion}</button>)}</div>}{pending && <div className="flex max-w-[88%] items-center gap-2 border border-white/10 bg-white/[.03] px-3 py-2.5 text-[10px] text-text-dark"><LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" />Đang tổng hợp câu trả lời...</div>}{error && <div role="alert" className="border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] leading-5 text-red-300">{error}</div>}</div><form onSubmit={submit} className="border-t border-white/10 p-3"><label htmlFor="mushroom-ai-input" className="sr-only">Nhập câu hỏi cho trợ lý</label><div className="flex gap-2"><input ref={inputRef} id="mushroom-ai-input" value={input} onChange={(event) => setInput(event.target.value)} maxLength={800} disabled={pending} autoComplete="off" placeholder="Hỏi về nấm hoặc CyberMushroom..." className="min-h-11 min-w-0 flex-1 border border-white/10 bg-background-dark px-3 text-xs text-text-pure placeholder:text-text-dark focus-visible:bio-focus disabled:opacity-60" /><button type="submit" disabled={pending || !input.trim()} aria-label="Gửi câu hỏi" className="flex min-h-11 min-w-11 items-center justify-center bg-primary-neon text-background-deep hover:bg-primary-cyan focus-visible:bio-focus disabled:cursor-not-allowed disabled:opacity-40"><Send aria-hidden="true" className="h-4 w-4" /></button></div><p className="mt-2 text-[8px] uppercase tracking-wider text-text-dark">Không chia sẻ mật khẩu hoặc thông tin thanh toán</p></form></section> : <RoamingChatRobot onOpen={() => setIsOpen(true)} />}</div>;
}
