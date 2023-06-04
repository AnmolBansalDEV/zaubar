import { PineconeClient } from "@pinecone-database/pinecone"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { PineconeStore } from "langchain/vectorstores/pinecone"
import wiki from "wikijs"

type RequestBody = {
  characterAppearance?: string
  characterName: string
  location: string
  situation?: string
}
// Define vectorStore at module level

async function loadData({
  characterAppearance,
  characterName,
  location,
  situation,
}: RequestBody) {
  let characterData: string = ""
  await wiki()
    .page(characterName)
    .then((page) => page.content())
    .then((content) => (characterData = `${content}`))

  // const splitter = RecursiveCharacterTextSplitter.fromLanguage("js", {
  //   chunkSize: 300,
  //   chunkOverlap: 0,
  // })
  // const CharacterOutput = await splitter.createDocuments([characterData])

  const embeddings = new OpenAIEmbeddings()
  const client = new PineconeClient()
  await client.init({
    apiKey: `${process.env.PINECONE_API_KEY}`,
    environment: `${process.env.PINECONE_ENVIRONMENT}`,
  })
  const pineconeIndex = client.Index(`${process.env.PINECONE_INDEX}`)

  // Load the docs into the vector store
  await PineconeStore.fromTexts(characterData.split("."), {meta: "this is the information about the person you have to roleplay"},embeddings, {
    pineconeIndex,
  })
  await PineconeStore.fromTexts(
    [
      "this is the person you have to role play, you'll find all life information about this person here. use this information to answer questions",
    ],
    {metadata: "very important information regarding the role you have to play"},
    embeddings,
    {
      pineconeIndex,
    }
  )
}

export async function POST(request: Request) {
  const body = await request.json()
  const {
    characterAppearance,
    characterName,
    location,
    situation,
  }: RequestBody = body.formData
  try {
    await loadData({ characterAppearance, characterName, location, situation })
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
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
