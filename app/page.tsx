"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { MessageCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { siteConfig } from "@/config/site"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Icons } from "@/components/icons"
import { useRouter } from "next/navigation"

export default function IndexPage() {
  const router = useRouter()
  const formSchema = z.object({
    characterName: z.string().min(3, { message: "Character Name is required" }),
    characterAppearance: z.string().optional(),
    location: z.string().min(3, { message: "Location is required" }),
    situation: z.string().optional(),
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      characterName: "",
      characterAppearance: "",
      location: "",
      situation: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const res = await fetch("/api/createCharacter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        formData: values,
      }),
    });
    if (res.status !== 200) {
      throw new Error(`Response status: ${res.statusText}`);
    }
    console.log(values)
    router.push("/chat")
  }

  return (
    <section className="container grid place-content-center items-center gap-6 pb-8 pt-6 md:py-10">
      <Icons.logo className="h-32 w-32 place-self-center rounded-lg border-2 border-solid border-gray-500 shadow-2xl" />
      <div className="flex max-w-[980px] flex-col items-center gap-2">
        <h1 className="text-center text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Discover the Lives
          <br className="hidden sm:inline" />
          of Historical Characters
        </h1>
      </div>
      <div className="mt-7 flex max-w-[980px] items-center gap-2">
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
        <Separator orientation="vertical" className="mx-8 h-52" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-x-4 space-y-8">
          <h4 className="col-span-2 text-center text-base">
            Generate your own character
            </h4>
            <FormField
              control={form.control}
              name="characterName"
              render={({ field }) => (
                <FormItem className="mt-8">
                  <FormLabel>Character name</FormLabel>
                  <FormControl>
                    <Input placeholder="Mahatma Gandhi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="characterAppearance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Character Appearance</FormLabel>
                  <FormControl>
                    <Input placeholder="iconic round spectacles" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>location</FormLabel>
                  <FormControl>
                    <Input placeholder="sabarmati ashram, India" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="situation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Situation</FormLabel>
                  <FormControl>
                    <Input placeholder="spinning the spinning wheel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="col-span-2 max-w-sm place-self-center" type="submit">Generate Character</Button>
          </form>
        </Form>
      </div>
    </section>
  )
}
