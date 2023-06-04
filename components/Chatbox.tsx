"use client"

import React, { FC, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollArea } from './ui/scroll-area'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { ArrowRight, Wand2Icon } from 'lucide-react'
import MessageBubble from './MessageBubble'
import { MessageType } from "langchain/schema";

type Message =  {
  text: string;
  type: MessageType;
}

const Chatbox:FC = () => {
  const [input, setInput] = useState("")
  const [canSend, setCanSend] = useState(true);
  const chatboxRef = useRef<HTMLDivElement>(null);
  const [pastMessages, setPastMessages] = useState<Message[]>([]);

  useEffect(() => {
    const messages = window.sessionStorage.getItem("pastMessages");
    if (messages) {
      setPastMessages(JSON.parse(messages));
    }

  }, []);
  useEffect(() => {
    window.sessionStorage.setItem("pastMessages", JSON.stringify(pastMessages));
  }, [pastMessages]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
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
      try {
        setCanSend(false);
        const magicPrompt = "Tell me anything, related to your character or the location. It should be interesting";
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            magicPrompt,
            pastMessages,
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
    <section className="absolute right-0 flex h-[500px] w-[300px] flex-col items-center justify-center rounded-md border">
      <ScrollArea className="h-full w-full p-4">
        {/* messaages of ai and user goes here */}
        {hasHistory && pastMessages.map((message, index) => (
        message.type === "ai" ? <MessageBubble key={index} isBot={true} message={message.text} /> :
        <MessageBubble key={index} isBot={false} message={message.text} />
        ) )}
        <div ref={chatboxRef} />
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex w-full items-center justify-end gap-2 rounded-md border">
      <Input placeholder='type in your questions...' value={input} onChange={(e) => setInput(e.target.value)} className="w-2/3 border-none" />

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button disabled={isDisabled} className="w-10 p-0">
            <ArrowRight className="h-4 w-4" />
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
          <Button onClick={magicFunc} disabled={!canSend} className="w-10 bg-fuchsia-500 p-0 hover:bg-fuchsia-900">
            <Wand2Icon className="h-4 w-4" />
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
