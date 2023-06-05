import React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

type Props = {
  message: string,
  url?: string | null,
  isBot: boolean,
}

function MessageBubble({ message, isBot, url }: Props) {
  return (
    <div
      className={`mt-2 flex w-full max-w-xs space-x-3 ${
        !isBot && "ml-auto justify-end space-x-reverse"
      }`}
    >
      <Avatar className={!isBot ? "order-2" : ""}>
        <AvatarImage src={isBot? `${url}` : "https://github.com/shadcn.png"} />
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
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
