import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

type Props = {
  message: string
  timestamp?: string
  isBot: boolean
}

function MessageBubble({ message, isBot, timestamp }: Props) {
  return (
    <div
      className={`mt-2 flex w-full max-w-xs space-x-3 ${
        !isBot && "ml-auto justify-end space-x-reverse"
      }`}
    >
      <Avatar className={!isBot && "order-2"}>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>{isBot ? "AI" : "U"}</AvatarFallback>
      </Avatar>
      <div>
        <div
          className={`${
            isBot
              ? "rounded-r-lg rounded-bl-lg bg-primary p-3 text-secondary"
              : "rounded-l-lg rounded-br-lg bg-primary p-3 text-secondary"
          }`}
        >
          <p className="font-sans text-sm">{message}</p>
          {/* <span className="mt-1 flex justify-end text-xs">{timestamp}</span> */}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
