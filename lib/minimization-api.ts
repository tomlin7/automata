export async function recognizeDFAFromImage(imageData: string) {
  const response = await fetch("/api/recognize-dfa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageData }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to recognize DFA from image")
  }

  return response.json()
}

export async function minimizeDFA(dfa: any) {
  const response = await fetch("/api/minimize-dfa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dfa }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to minimize DFA")
  }

  return response.json()
}
