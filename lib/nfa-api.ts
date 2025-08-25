export async function generateNFA(prompt: string) {
  const response = await fetch("/api/generate-nfa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to generate NFA")
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
