import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChatWidget } from "../context/ChatWidgetContext";
import { CHATBOT_NAME } from "../constants/brand";
import {
  createMessage,
  getBotReply,
  WELCOME_MESSAGE,
  type ChatMessage,
} from "../lib/chatbot";
import { ChatIcon } from "./ChatIcon";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderBotText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part.split("\n").map((line, j) => (
      <span key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line}
      </span>
    ));
  });
}

const QUICK_REPLIES = [
  "Hi",
  "Help me lose weight",
  "Gaining weight too fast",
  "Find a dietitian near me",
];

export function ChatWidget() {
  const { user } = useAuth();
  const { isOpen, openChat, closeChat } = useChatWidget();
  const chatContext = user
    ? { city: user.city, postcode: user.postcode }
    : null;
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeChat();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeChat]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, createMessage("user", trimmed)]);
    setInput("");
    setTyping(true);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        createMessage("bot", getBotReply(trimmed, chatContext)),
      ]);
      setTyping(false);
    }, 600);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <button
          type="button"
          onClick={openChat}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          aria-label={`Open ${CHATBOT_NAME} chat`}
        >
          <ChatIcon className="h-7 w-7" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end p-0 sm:p-4 sm:pb-6 sm:pr-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-widget-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-sage-900/30 sm:bg-transparent"
            aria-label="Close chat"
            onClick={closeChat}
          />
          <div
            ref={panelRef}
            className="relative flex h-[min(520px,85vh)] w-full flex-col rounded-t-2xl border border-sage-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:h-[500px] sm:max-w-md sm:rounded-2xl"
          >
            <header className="flex items-center justify-between gap-2 border-b border-teal-700 bg-gradient-to-r from-teal-700 to-teal-800 px-4 py-3 text-white sm:rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 font-bold text-xs">
                  MS
                </span>
                <div>
                  <h2
                    id="chat-widget-title"
                    className="text-sm font-semibold leading-tight"
                  >
                    {CHATBOT_NAME}
                  </h2>
                  <p className="text-[11px] text-white/80">
                    Wellbeing assistant · UK
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeChat}
                className="rounded-lg p-2 hover:bg-cream/20"
                aria-label="Close chat"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-teal-600 text-white"
                        : "bg-white text-sage-800 shadow-sm dark:bg-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {msg.role === "bot" ? renderBotText(msg.text) : msg.text}
                    <p
                      className={`mt-0.5 text-[10px] ${
                        msg.role === "user" ? "text-sage-200" : "text-sage-500"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white px-3 py-2 text-sm text-sage-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
                    {CHATBOT_NAME} is typing…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-sage-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="rounded-full border border-sage-200 bg-sage-50 px-2.5 py-0.5 text-[11px] text-sage-700 hover:bg-sage-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 rounded-xl border border-sage-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  aria-label="Chat message"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || typing}
                  className="rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  Send
                </button>
              </form>
              <p className="mt-2 text-center text-[10px] text-sage-500">
                Not for emergencies ·{" "}
                <Link
                  to="/contact"
                  className="underline"
                  onClick={closeChat}
                >
                  Contact us
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Footer / inline trigger with chat icon */
export function ChatOpenButton({
  variant = "footer",
}: {
  variant?: "footer" | "inline";
}) {
  const { openChat, isOpen } = useChatWidget();

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={openChat}
        className="inline-flex items-center gap-1.5 font-medium text-teal-700 underline hover:text-teal-900 dark:text-teal-400"
      >
        <ChatIcon className="h-4 w-4" />
        Chat with Mind Scope
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openChat}
      className="inline-flex items-center gap-2 rounded-lg border border-sage-200 bg-white px-4 py-2 text-sm font-medium text-sage-700 shadow-sm hover:bg-sage-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      aria-expanded={isOpen}
    >
      <ChatIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
      Mind Scope chat
    </button>
  );
}
