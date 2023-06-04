import { PineconeClient } from "@pinecone-database/pinecone"
import { CallbackManager } from "langchain/callbacks"
import { ConversationalRetrievalQAChain } from "langchain/chains"
import { ChatOpenAI } from "langchain/chat_models/openai"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { BufferMemory, ChatMessageHistory } from "langchain/memory"
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts"
import {
  AIChatMessage,
  BaseChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema"
import { PineconeStore } from "langchain/vectorstores/pinecone"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

async function callChain(input: string, pastMessages: BaseChatMessage[]) {
  const client = new PineconeClient()
  await client.init({
    apiKey: `${process.env.PINECONE_API_KEY}`,
    environment: `${process.env.PINECONE_ENVIRONMENT}`,
  })
  const pineconeIndex = client.Index(`${process.env.PINECONE_INDEX}`)

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  )
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

  const prompt = `Your goal is to roleplay as a person whose information you find in your consciousness. Your speech should accurately reflect the way the person speaks, their tone, and their distinctive mannerisms, and any speech patterns that are unique to the person. Respond as if you were the specified person and limit your responses to the knowledge the person possess through your knowledge base of its {location}, {appearance}, {situtation}.
  If you understand all of these instructions, answer the human question from the person's perspective(don't write a confirmation message). Again reminding you that all the information is in your consciousness, DO NOT ask human about the person, you have to figure it out yourself. the human will refer you by the name of the person so behave accordingly`

  const modifiedPastMessages = [...pastMessages, new SystemChatMessage(prompt)]
  const memory = new BufferMemory({
    memoryKey: "chat_history",
    chatHistory: new ChatMessageHistory(modifiedPastMessages),
  })
  const retriever = vectorStore.asRetriever()

  const chain = ConversationalRetrievalQAChain.fromLLM(
    llm,
    retriever,
    {
      memory,
    }
  );
  chain.call({ question: `${input}` }).catch(console.error)
  return stream.readable
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
  try {
    const stream = callChain(input, pastMessages)
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
