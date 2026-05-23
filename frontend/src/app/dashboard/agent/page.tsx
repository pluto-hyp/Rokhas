"use client";

import { useState, useRef, useEffect } from "react";
import { askAgent, ChatMessage } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function AgentPage() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "agent",
      content: "Hello. I am the Rokhas Architectural Assistant. How can I assist you with your permits or urban planning queries today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      if (!token) throw new Error("Not authenticated");
      const agentMsg = await askAgent(userMsg.content, token);
      setMessages((prev) => [...prev, agentMsg]);
    } catch (error) {
      console.error("Agent failed", error);
      setMessages((prev) => [
        ...prev,
        {
          id: "error",
          role: "agent",
          content: "I encountered an error processing your request. Please ensure the backend services are running.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height))] max-w-5xl mx-auto w-full p-4 lg:p-6 gap-4">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Rokhas Agent
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Precision guidance for urban planning and regulatory compliance.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs font-medium text-muted-foreground bg-muted/30 px-4 py-2 rounded-xl border border-border/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-3 text-emerald-500" />
            Secure Session
          </div>
          <div className="w-px h-3 bg-border/40" />
          <div className="flex items-center gap-2">
            <Sparkles className="size-3 text-amber-500" />
            Rokhas Engine
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-xl rounded-2xl relative">
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>

        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="p-6 space-y-8 max-w-3xl mx-auto w-full">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500",
                  msg.role === "user" ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "size-10 shrink-0 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110",
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted border border-border/40 text-muted-foreground"
                )}>
                  {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={cn(
                  "flex flex-col gap-1.5 max-w-[85%]",
                  msg.role === "user" ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm border",
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground border-primary rounded-tr-none" 
                      : "bg-background border-border/40 text-foreground rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium px-2">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start gap-4 animate-in fade-in duration-300 max-w-3xl mx-auto w-full">
                <div className="size-10 shrink-0 rounded-xl bg-muted border border-border/40 text-muted-foreground flex items-center justify-center shadow-sm">
                  <Bot size={20} />
                </div>
                <div className="px-6 py-4 rounded-2xl bg-muted/30 border border-border/40 rounded-tl-none flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-6 bg-background/80 border-t border-border/40 backdrop-blur-md">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-center group">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about building codes, permit status, or regulations..."
              className="h-14 pl-6 pr-16 rounded-2xl bg-muted/20 border-border/40 focus:bg-background transition-all shadow-inner text-base"
              disabled={isTyping}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isTyping}
              className="absolute right-2 h-10 w-10 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 group-hover:bg-primary/90"
            >
              {isTyping ? <Loader2 className="size-5 animate-spin" /> : <Send size={20} />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground mt-4 font-medium opacity-60">
            Rokhas AI may occasionally produce inaccurate information about specific municipal codes.
          </p>
        </div>
      </Card>
    </div>
  );
}
