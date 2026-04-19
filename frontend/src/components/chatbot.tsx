"use client";

import { FormEvent, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export function Chatbot() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I can help explain model metrics, decline curves, and forecasting workflow.",
    },
  ]);
  const [input, setInput] = useState("");

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: userMessage }]);

    try {
      const response = await fetch(`${apiBase}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: data.reply ?? "No response." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Backend not running. Start FastAPI to enable chatbot replies.",
        },
      ]);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-3 text-lg font-semibold">AI Chatbot</h3>
      <div className="mb-3 h-44 space-y-2 overflow-y-auto rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800">
        {messages.map((m) => (
          <p key={m.id} className={m.role === "user" ? "text-blue-600" : "text-zinc-700 dark:text-zinc-200"}>
            <strong>{m.role === "user" ? "You" : "AI"}:</strong> {m.text}
          </p>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about forecasting..."
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </section>
  );
}
