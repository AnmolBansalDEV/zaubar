import Link from "next/link"
import { MessageCircle } from "lucide-react"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/icons"

export default function IndexPage() {
  return (
    <section className="container grid place-content-center items-center gap-6 pb-8 pt-6 md:py-10">
      <Icons.logo className="h-32 w-32 place-self-center rounded-lg border-2 border-solid border-gray-500 shadow-2xl" />
      <div className="flex max-w-[980px] flex-col items-center gap-2">
        <h1 className="text-center text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Discover the Lives
          <br className="hidden sm:inline" />
          of Historical Characters
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          {/* //text goes here */}
        </p>
      </div>
      <div className="flex max-w-[980px] items-center gap-2">
        <div className="flex flex-col items-center gap-4">
          <h4 className="text-center text-base">
            Chat with Randomly Generated
            <br className="hidden sm:inline" />
            Historical Characters
          </h4>
          <Link href="/chat" className={buttonVariants({ variant: "default" })}>
            chat
            <MessageCircle className="ms-1 inline-block h-5 w-5" />
          </Link>
        </div>
        <Separator orientation="vertical" className="m-4 h-40" />
        
      </div>
    </section>
  )
}
