import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Theme = "dark" | "light" | "kids";
type Tab = "chat" | "explore" | "history" | "settings";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  time: string;
}

const WELCOME_MSG: Message = {
  id: 0,
  role: "ai",
  text: "Привет! Я Kruel AI — твой интеллектуальный помощник. Спроси меня что угодно.",
  time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
};

const DEMO_REPLIES = [
  "Отличный вопрос! Я анализирую его прямо сейчас.",
  "Интересно! Позволь рассмотреть это подробнее.",
  "Понял тебя. Вот что я думаю по этому поводу.",
  "Конечно! Kruel AI к твоим услугам.",
  "Хороший вопрос. Давай разберём это вместе.",
];

export default function Index() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [kidsMode, setKidsMode] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [settingsSection, setSettingsSection] = useState<"main" | "theme" | "support">("main");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const effectiveTheme = kidsMode ? "kids" : theme;

  useEffect(() => {
    const body = document.body;
    body.classList.remove("theme-light", "theme-kids");
    if (effectiveTheme === "light") body.classList.add("theme-light");
    if (effectiveTheme === "kids") body.classList.add("theme-kids");
    return () => {
      body.classList.remove("theme-light", "theme-kids");
    };
  }, [effectiveTheme]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: input.trim(),
      time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const reply: Message = {
        id: Date.now() + 1,
        role: "ai",
        text: DEMO_REPLIES[Math.floor(Math.random() * DEMO_REPLIES.length)],
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 1400);
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "chat", label: "Чат", icon: "MessageSquare" },
    { id: "explore", label: "Поиск", icon: "Search" },
    { id: "history", label: "История", icon: "Clock" },
    { id: "settings", label: "Настройки", icon: "Settings" },
  ];

  const themeOptions: { id: Theme; label: string; emoji: string; desc: string }[] = [
    { id: "dark", label: "Тёмная", emoji: "🌑", desc: "Чёрный фон, красные акценты" },
    { id: "light", label: "Светлая", emoji: "☀️", desc: "Белый фон, чистый стиль" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--kruel-dark)", color: "var(--kruel-text)", fontFamily: "'Golos Text', sans-serif" }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ background: "var(--kruel-surface)", borderColor: "var(--kruel-border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center glow-pulse"
            style={{ background: "var(--kruel-red)" }}
          >
            <span className="font-orbitron text-white font-black text-sm">K</span>
          </div>
          <h1 className="font-orbitron font-bold text-xl tracking-wider" style={{ color: "var(--kruel-text)" }}>
            KRUEL <span style={{ color: "var(--kruel-red)" }}>AI</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {kidsMode && (
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: "#f5a62325", color: "#f5a623", border: "1px solid #f5a62340" }}
            >
              🧒 Детский режим
            </span>
          )}
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
          />
        </div>
      </header>

      {/* Tabs nav */}
      <nav
        className="flex items-center border-b px-2"
        style={{ background: "var(--kruel-surface)", borderColor: "var(--kruel-border)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "settings") setSettingsSection("main");
            }}
            title={tab.label}
            className="flex items-center justify-center px-6 py-3.5 transition-all relative"
            style={{
              color: activeTab === tab.id ? "var(--kruel-red)" : "var(--kruel-text-dim)",
              borderBottom: activeTab === tab.id ? "2px solid var(--kruel-red)" : "2px solid transparent",
              background: "transparent",
            }}
          >
            <Icon name={tab.icon} size={20} />
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-hidden flex flex-col" style={{ minHeight: 0 }}>

        {/* CHAT */}
        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4" style={{ minHeight: 0 }}>
              {messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className="animate-fade-in flex"
                  style={{
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    animationDelay: `${Math.min(i * 0.04, 0.3)}s`,
                  }}
                >
                  {msg.role === "ai" && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1"
                      style={{ background: "var(--kruel-red)" }}
                    >
                      <span className="font-orbitron text-white text-xs font-bold">K</span>
                    </div>
                  )}
                  <div style={{ maxWidth: "72%" }}>
                    <div
                      className="px-4 py-3 text-sm leading-relaxed"
                      style={
                        msg.role === "user"
                          ? {
                              background: "var(--kruel-red)",
                              color: "#fff",
                              borderRadius: "18px 18px 4px 18px",
                            }
                          : {
                              background: "var(--kruel-surface2)",
                              color: "var(--kruel-text)",
                              border: "1px solid var(--kruel-border)",
                              borderRadius: "18px 18px 18px 4px",
                            }
                      }
                    >
                      {msg.text}
                    </div>
                    <div
                      className="text-xs mt-1 px-1"
                      style={{
                        color: "var(--kruel-text-dim)",
                        textAlign: msg.role === "user" ? "right" : "left",
                      }}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-end gap-2 animate-fade-in">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--kruel-red)" }}
                  >
                    <span className="font-orbitron text-white text-xs font-bold">K</span>
                  </div>
                  <div
                    className="px-4 py-3 flex items-center gap-1.5"
                    style={{
                      background: "var(--kruel-surface2)",
                      border: "1px solid var(--kruel-border)",
                      borderRadius: "18px 18px 18px 4px",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="typing-dot block w-2 h-2 rounded-full"
                        style={{ background: "var(--kruel-red)", animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div
              className="px-4 pb-6 pt-3 border-t"
              style={{ background: "var(--kruel-surface)", borderColor: "var(--kruel-border)" }}
            >
              <div
                className="flex items-end gap-3 rounded-2xl px-4 py-3"
                style={{ background: "var(--kruel-surface2)", border: "1px solid var(--kruel-border)" }}
              >
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={kidsMode ? "Спроси меня что-нибудь! 😊" : "Напиши сообщение..."}
                  className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed"
                  style={{ color: "var(--kruel-text)", minHeight: "24px", maxHeight: "120px" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                  style={{
                    background: input.trim() ? "var(--kruel-red)" : "var(--kruel-border)",
                    color: "#fff",
                  }}
                >
                  <Icon name="Send" size={16} />
                </button>
              </div>
              <p className="text-center text-xs mt-2" style={{ color: "var(--kruel-text-dim)" }}>
                Enter — отправить · Shift+Enter — новая строка
              </p>
            </div>
          </div>
        )}

        {/* EXPLORE */}
        {activeTab === "explore" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "var(--kruel-surface2)", border: "1px solid var(--kruel-border)" }}
            >
              <Icon name="Search" size={28} style={{ color: "var(--kruel-red)" }} />
            </div>
            <h2 className="font-orbitron font-bold text-lg mb-2" style={{ color: "var(--kruel-text)" }}>
              Поиск
            </h2>
            <p className="text-sm text-center" style={{ color: "var(--kruel-text-dim)", maxWidth: "280px" }}>
              Умный поиск по знаниям Kruel AI. Скоро здесь появится поиск.
            </p>
          </div>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <div className="flex-1 overflow-y-auto px-4 py-6 animate-fade-in">
            <h2 className="font-orbitron font-semibold text-base mb-4 px-1" style={{ color: "var(--kruel-text)" }}>
              История чатов
            </h2>
            {[
              { title: "Как работает ИИ?", date: "Сегодня, 14:32", msgs: 8 },
              { title: "Помощь с кодом на Python", date: "Вчера, 20:10", msgs: 14 },
              { title: "Рецепты блюд", date: "25 апр", msgs: 5 },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-xl mb-2 cursor-pointer transition-all hover:opacity-80 animate-fade-in"
                style={{
                  background: "var(--kruel-surface2)",
                  border: "1px solid var(--kruel-border)",
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--kruel-red)20" }}
                  >
                    <Icon name="MessageSquare" size={16} style={{ color: "var(--kruel-red)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--kruel-text)" }}>{item.title}</p>
                    <p className="text-xs" style={{ color: "var(--kruel-text-dim)" }}>{item.date}</p>
                  </div>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "var(--kruel-border)", color: "var(--kruel-text-dim)" }}
                >
                  {item.msgs} сообщ.
                </span>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div className="flex-1 overflow-y-auto animate-fade-in">
            {settingsSection === "main" && (
              <div className="px-4 py-6">
                <h2 className="font-orbitron font-semibold text-base mb-6 px-1" style={{ color: "var(--kruel-text)" }}>
                  Настройки
                </h2>

                {/* Kids mode */}
                <div
                  className="flex items-center justify-between p-4 rounded-xl mb-3"
                  style={{ background: "var(--kruel-surface2)", border: "1px solid var(--kruel-border)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🧒</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--kruel-text)" }}>Детский режим</p>
                      <p className="text-xs" style={{ color: "var(--kruel-text-dim)" }}>Безопасный контент для детей</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setKidsMode((v) => !v)}
                    className="relative w-12 h-6 rounded-full transition-all duration-300"
                    style={{ background: kidsMode ? "#f5a623" : "var(--kruel-border)" }}
                  >
                    <span
                      className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300"
                      style={{ left: kidsMode ? "26px" : "4px" }}
                    />
                  </button>
                </div>

                {/* Theme */}
                <button
                  onClick={() => setSettingsSection("theme")}
                  className="w-full flex items-center justify-between p-4 rounded-xl mb-3 transition-all hover:opacity-80"
                  style={{ background: "var(--kruel-surface2)", border: "1px solid var(--kruel-border)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎨</span>
                    <div className="text-left">
                      <p className="text-sm font-medium" style={{ color: "var(--kruel-text)" }}>Тема оформления</p>
                      <p className="text-xs" style={{ color: "var(--kruel-text-dim)" }}>
                        {theme === "dark" ? "Тёмная" : "Светлая"}
                      </p>
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={16} style={{ color: "var(--kruel-text-dim)" }} />
                </button>

                {/* Support */}
                <button
                  onClick={() => setSettingsSection("support")}
                  className="w-full flex items-center justify-between p-4 rounded-xl mb-3 transition-all hover:opacity-80"
                  style={{ background: "var(--kruel-surface2)", border: "1px solid var(--kruel-border)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💬</span>
                    <div className="text-left">
                      <p className="text-sm font-medium" style={{ color: "var(--kruel-text)" }}>Техподдержка</p>
                      <p className="text-xs" style={{ color: "var(--kruel-text-dim)" }}>kruelcompany2@gmail.com</p>
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={16} style={{ color: "var(--kruel-text-dim)" }} />
                </button>

                <div className="mt-8 text-center">
                  <p className="font-orbitron text-xs tracking-wider" style={{ color: "var(--kruel-text-dim)" }}>
                    KRUEL AI v1.0.0
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--kruel-border)" }}>
                    © 2025 Kruel Company
                  </p>
                </div>
              </div>
            )}

            {settingsSection === "theme" && (
              <div className="px-4 py-6 animate-fade-in">
                <button
                  onClick={() => setSettingsSection("main")}
                  className="flex items-center gap-2 mb-6 text-sm hover:opacity-70 transition-all"
                  style={{ color: "var(--kruel-red)" }}
                >
                  <Icon name="ArrowLeft" size={16} />
                  Назад
                </button>
                <h2 className="font-orbitron font-semibold text-base mb-6" style={{ color: "var(--kruel-text)" }}>
                  Тема оформления
                </h2>
                <div className="space-y-3">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTheme(opt.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl transition-all"
                      style={{
                        background: theme === opt.id ? "rgba(224,32,32,0.1)" : "var(--kruel-surface2)",
                        border: theme === opt.id ? "1px solid var(--kruel-red)" : "1px solid var(--kruel-border)",
                      }}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold" style={{ color: "var(--kruel-text)" }}>{opt.label}</p>
                        <p className="text-xs" style={{ color: "var(--kruel-text-dim)" }}>{opt.desc}</p>
                      </div>
                      {theme === opt.id && (
                        <Icon name="Check" size={18} style={{ color: "var(--kruel-red)" }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {settingsSection === "support" && (
              <div className="px-4 py-6 animate-fade-in">
                <button
                  onClick={() => setSettingsSection("main")}
                  className="flex items-center gap-2 mb-6 text-sm hover:opacity-70 transition-all"
                  style={{ color: "var(--kruel-red)" }}
                >
                  <Icon name="ArrowLeft" size={16} />
                  Назад
                </button>
                <h2 className="font-orbitron font-semibold text-base mb-6" style={{ color: "var(--kruel-text)" }}>
                  Техподдержка
                </h2>

                <div
                  className="p-5 rounded-2xl mb-4"
                  style={{ background: "var(--kruel-surface2)", border: "1px solid var(--kruel-border)" }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📧</span>
                    <p className="font-semibold text-sm" style={{ color: "var(--kruel-text)" }}>Email поддержки</p>
                  </div>
                  <a
                    href="mailto:kruelcompany2@gmail.com"
                    className="text-sm font-medium hover:opacity-80 transition-all"
                    style={{ color: "var(--kruel-red)" }}
                  >
                    kruelcompany2@gmail.com
                  </a>
                </div>

                <div
                  className="p-5 rounded-2xl mb-4"
                  style={{ background: "var(--kruel-surface2)", border: "1px solid var(--kruel-border)" }}
                >
                  <p className="text-sm font-medium mb-2" style={{ color: "var(--kruel-text)" }}>Время ответа</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--kruel-text-dim)" }}>
                    Отвечаем в течение 24 часов в рабочие дни. Напиши нам — и мы поможем решить любой вопрос.
                  </p>
                </div>

                <a
                  href="mailto:kruelcompany2@gmail.com"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                  style={{ background: "var(--kruel-red)", color: "#fff" }}
                >
                  <Icon name="Mail" size={16} />
                  Написать в поддержку
                </a>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}