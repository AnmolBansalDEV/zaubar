
type RequestBody = {
  characterAppearance?: string
  characterName: string
  location: string
  situation?: string
}
// // Define vectorStore at module level


async function generateCharacter({ characterAppearance, characterName, location, situation }: RequestBody){

  const data = {"inputs": "Astronaut riding a horse"}
  const response = await fetch(
		"https://api-inference.huggingface.co/models/SG161222/Realistic_Vision_V1.4",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.blob();
    const blobUrl = window.URL.createObjectURL(result);
	return blobUrl;
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
    const res = await generateCharacter({ characterAppearance, characterName, location, situation })
    return new Response(JSON.stringify(res)), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-transform",
      },
    }
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


