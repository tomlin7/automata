export async function predictLanguage(dfa: any) {
  const response = await fetch("/api/predict-language", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dfa }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to predict language")
  }

  return response.json()
} 