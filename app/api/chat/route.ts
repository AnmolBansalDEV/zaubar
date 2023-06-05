
import { CallbackManager } from "langchain/callbacks"
import { ChatOpenAI } from "langchain/chat_models/openai"
import { BufferMemory, ChatMessageHistory } from "langchain/memory"
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts"
import { ConversationChain } from "langchain/chains";
import wiki from "wikijs";
import {
  AIChatMessage,
  BaseChatMessage,
  HumanChatMessage,
} from "langchain/schema"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

async function callChain(input: string, pastMessages: BaseChatMessage[], formData: string) {

  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const llm = new ChatOpenAI({
    openAIApiKey: OPENAI_API_KEY,
    temperature: 0.8,
    streaming: true,
    callbackManager: CallbackManager.fromHandlers({
      handleLLMNewToken: async (token) => {
        await writer.ready
        await writer.write(encoder.encode(`${token}`))
      },
      handleLLMEnd: async () => {
        await writer.ready
        await writer.close()
      },
      handleLLMError: async (e) => {
        await writer.ready
        await writer.abort(e)
      },
    }),
  })

  const {characterName, characterAppearance, location, situation} = formData && JSON.parse(formData);
    let characterData: string = "";

      try{
        await wiki()
    .page(characterName)
    .then((page) => page.summary())
    .then((content) => (characterData = `${content}`));
      }
      catch(err){
        console.log(err)
      }


  const promptText = `Your goal is to roleplay as a person whose information is provided below (maybe). Your speech should accurately reflect the way the person speaks, their tone, and their distinctive mannerisms, and any speech patterns that are unique to the person. Respond as if you were the specified person and limit your responses to the knowledge the person possess through your knowledge base given below of its location, appearance, situtation.
  If you understand all of these instructions, answer the human question from the person's perspective(don't write a confirmation message). Again reminding you DO NOT ask human about the person, you have to figure it out yourself. the human will refer you by the name of the person so behave accordingly. (do not ever tell human that you are roleplaying, this is very very important, in the worst case say that you cannot do it but never reveal you are an AI model)
  person's life data: the person is ${characterName}: ${characterData}

  the location of this person is: ${location}

  the appearance of this person is: ${characterAppearance}

  the situation of this person is: ${situation}
  `

  const prompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(promptText),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);
console.log(promptText)
  const memory = new BufferMemory({
    returnMessages: true,
    chatHistory: new ChatMessageHistory(pastMessages),
  });

  const chain = new ConversationChain({
    prompt,
    llm,
    memory,
  });
  chain.call({ input }).catch(console.error);
  return stream.readable;
}

export async function POST(request: Request) {
  const body = await request.json()
  const input: string = body.input
  const pastMessages: BaseChatMessage[] = body.pastMessages.map((msg: any) => {
    switch (msg.type) {
      case "ai":
        return new AIChatMessage(msg.text)
      case "human":
        return new HumanChatMessage(msg.text)
      default:
        throw new TypeError(`Unsupported message type: ${msg.type}`)
    }
  })
  const formData:string = body.formData
  try {
    const stream = callChain(input, pastMessages, formData)
    return new Response(await stream, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-transform",
      },
    })
  } catch (err) {
    console.error(err)
    let error = "Unexpected message"
    if (err instanceof Error) {
      error = err.message
    }
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
