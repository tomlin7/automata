import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { dfa } = await request.json()

    if (!dfa) {
      return NextResponse.json({ error: "DFA data is required" }, { status: 400 })
    }

    const systemPrompt = `You are an expert in automata theory and formal language theory. Analyze the given Deterministic Finite Automaton (DFA) and predict what language it recognizes.

Return your response as a valid JSON object with the following structure:

{
  "predictions": [
    {
      "language": "Even number of 0s",
      "confidence": 0.85,
      "description": "Accepts strings with an even number of 0 symbols",
      "examples": ["", "1", "00", "101", "1001", "1100"],
      "pattern": "Regular expression or pattern description",
      "reasoning": "Explanation of why this language matches the DFA"
    }
  ],
  "analysis": {
    "totalStates": 3,
    "acceptingStates": 1,
    "alphabet": ["0", "1"],
    "observations": [
      "The DFA has a specific pattern in its transitions",
      "Accepting states are positioned in a particular way",
      "The structure suggests a specific language family"
    ]
  }
}

Provide 3-5 different language predictions with varying confidence levels. Focus on common patterns like:
- Even/odd counts of symbols
- Strings ending with specific patterns
- Binary numbers with specific properties
- Palindromes or near-palindromes
- Strings with specific symbol distributions
- Divisibility properties for binary numbers

Make sure the confidence levels are realistic and the examples actually belong to the predicted language.`

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      prompt: `Analyze this DFA and predict what language it recognizes: ${JSON.stringify(dfa)}`,
      temperature: 0.3,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse response" }, { status: 500 })
    }

    const predictionData = JSON.parse(jsonMatch[0])

    return NextResponse.json(predictionData)
  } catch (error) {
    console.error("Error predicting language:", error)
    return NextResponse.json({ error: "Failed to predict language" }, { status: 500 })
  }
} 