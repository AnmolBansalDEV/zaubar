"use client"

import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollArea } from './ui/scroll-area'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { ArrowRight, Wand2 } from 'lucide-react'
import MessageBubble from './MessageBubble'
import { MessageType } from "langchain/schema";

type Message =  {
  text: string;
  type: MessageType;
}
type props = {
  url: string | null,
}
const Chatbox = ({url}: props) => {
  const [input, setInput] = useState("")
  const [canSend, setCanSend] = useState(true);
  const chatboxRef = useRef<HTMLDivElement>(null);
  const [pastMessages, setPastMessages] = useState<Message[]>([]);

  useEffect(() => {
    const messages = localStorage.getItem("pastMessages");
    if (messages) {
      setPastMessages(JSON.parse(messages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pastMessages", JSON.stringify(pastMessages));
  }, [pastMessages]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const formData = typeof window !== 'undefined' && localStorage.getItem("formData")
      try {
        setCanSend(false);
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input,
            pastMessages,
            formData
          }),
        });
        if (res.status !== 200) {
          throw new Error(`Response status: ${res.statusText}`);
        }
        if (!res?.body) {
          throw new Error("Response has no body.");
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        setPastMessages((history) => [
          ...history,
          { text: input, type: "human" },
        ]);
        setInput(""); // Clear the input value
        let aiResponse = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const chunk = decoder.decode(value);
          aiResponse += chunk;
        }
        reader.cancel();
        setPastMessages((history) => [
          ...history,
          { text: aiResponse, type: "ai" },
        ]);
      } catch (err) {
        let message = "Unknown error.";
        if (err instanceof Error) {
          message = err.message;
        }
        console.log("error message is:", message);
        console.error(err);
      } finally {
        setCanSend(true);
      }
    },
    [input, pastMessages]
  );

  const hasHistory = useMemo(
    () => Boolean(pastMessages.length),
    [pastMessages]
  );
  const isDisabled = useMemo(
    () => !input || !canSend,
    [input, canSend]
  );

  useEffect(() => {
    if (chatboxRef && chatboxRef.current) {
      chatboxRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [pastMessages]);


  const magicFunc = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const formData = typeof window !== 'undefined' && localStorage.getItem("formData")
      try {
        setCanSend(false);
        const magicPrompt = "Tell me something interesting";
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: magicPrompt,
            pastMessages,
            formData
          }),
        });
        if (res.status !== 200) {
          throw new Error(`Response status: ${res.statusText}`);
        }
        if (!res?.body) {
          throw new Error("Response has no body.");
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let aiResponse = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const chunk = decoder.decode(value);
          aiResponse += chunk;
        }
        reader.cancel();
        setPastMessages((history) => [
          ...history,
          { text: aiResponse, type: "ai" },
        ]);
      } catch (err) {
        let message = "Unknown error.";
        if (err instanceof Error) {
          message = err.message;
        }
        console.log("error message is:", message);
        console.error(err);
      } finally {
        setCanSend(true);
      }
    },
    [pastMessages]
  );


  return (
    <section className="flex h-[500px] w-[400px] flex-col items-center justify-center rounded-md border">
      <ScrollArea className="w-full h-full p-4">
        {/* messaages of ai and user goes here */}
        {hasHistory && pastMessages.map((message, index) => (
        message.type === "ai" ? <MessageBubble key={index} url={url} isBot={true} message={message.text} /> :
        <MessageBubble key={index} isBot={false} message={message.text} />
        ) )}
        <div ref={chatboxRef} />
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex items-center justify-end w-full gap-2 border rounded-md">
      <Input placeholder='type in your questions...' value={input} onChange={(e) => setInput(e.target.value)} className="w-2/3 border-none" />

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button disabled={isDisabled} className="w-10 p-0">
            <ArrowRight className="w-4 h-4" />
            <span className="sr-only">send</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Ask character</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={magicFunc} disabled={!canSend} className="w-10 p-0 bg-fuchsia-500 hover:bg-fuchsia-900">
            <Wand2 className="w-4 h-4" />
            <span className="sr-only">tell me anything</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tell Me Anything</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
      </form>
    </section>
  )
}

export default Chatbox
