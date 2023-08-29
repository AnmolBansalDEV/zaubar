"use client"

import Random from "random.json"
import { zodResolver } from "@hookform/resolvers/zod"
import { MessageCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
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
import { useToast } from "@/components/ui/use-toast"

export default function IndexPage() {
  const NEXT_PUBLIC_INFERENCE_API_AUTH = process.env.NEXT_PUBLIC_INFERENCE_API_AUTH;
  const { toast } = useToast()
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
    toast({
      description: "Your character is being created.",
    })
    const data = {"inputs": `${values.characterName} photo of front profile, looking in the eye, doing ${values.situation} if possible ,serious eyes, (${values.characterAppearance}) 50mm colored photography, ((background removed)) hard rim lighting photography-beta -ar 2:3 -beta -upbeta -beta -upbeta -beta -upbeta`}
  const response = await fetch(
		"https://api-inference.huggingface.co/models/SG161222/Realistic_Vision_V1.4",
		{
			headers: { Authorization: `Bearer ${NEXT_PUBLIC_INFERENCE_API_AUTH}` },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();
    if (!response.ok) {
      throw new Error(`Response status: ${response.statusText}`);
    }
    const url = URL.createObjectURL(result)
    if(typeof window !== 'undefined'){
      localStorage.setItem("formData", JSON.stringify(values))
      localStorage.setItem("blobURL", url)
    }
    router.push("/chat")
  }
  async function randomGen(){

    const values = {
     characterName: Random[0].names[Math.floor(Math.random()* Random[0].names.length)],
     location: Random[0].location[Math.floor(Math.random()* Random[0].location.length)],
     characterAppearance: "",
     situation: ""
    }
    toast({
      description: "Your character is being created.",
    })
    const data = {"inputs": `${values.characterName} full body photo of front profile, looking in the eye, doing ${values.situation} if possible ,serious eyes, (${values.characterAppearance}) 50mm colored photography, ((background ${location})) hard rim lighting photography-beta -ar 2:3 -beta -upbeta -beta -upbeta -beta -upbeta`}
  const response = await fetch(
		"https://api-inference.huggingface.co/models/SG161222/Realistic_Vision_V1.4",
		{
			headers: { Authorization: `Bearer ${NEXT_PUBLIC_INFERENCE_API_AUTH}` },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();
    if (!response.ok) {
      throw new Error(`Response status: ${response.statusText}`);
    }
    const url = URL.createObjectURL(result)
    if(typeof window !== 'undefined'){
      localStorage.setItem("formData", JSON.stringify(values))
      localStorage.setItem("blobURL", url)
    }
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
          <Button className="col-span-2 max-w-sm place-self-center" onClick={randomGen}>
            chat
            <MessageCircle className="ms-1 inline-block h-5 w-5" />
          </Button>
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
