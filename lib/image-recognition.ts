export async function recognizeNFAFromImage(imageData: string) {
  const response = await fetch("/api/recognize-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageData, type: "nfa" }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to recognize NFA from image")
  }

  return response.json()
}

export async function convertNFAToDFA(nfa: any) {
  const response = await fetch("/api/convert-nfa-to-dfa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nfa }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to convert NFA to DFA")
  }

  return response.json()
}
