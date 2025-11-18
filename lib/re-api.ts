export async function generateDFA(prompt: string) {
  const response = await fetch("/api/generate-dfa-re", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to generate DFA")
  }

  return response.json()
}
