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
      "language": "Description of the language",
      "confidence": 0.0-1.0,
      "description": "Detailed description of what the language accepts",
      "examples": ["example1", "example2", "example3"],
      "pattern": "Regular expression or pattern description if applicable",
      "reasoning": "Explanation of why this language matches the DFA structure"
    }
  ],
  "analysis": {
    "totalStates": number,
    "acceptingStates": number,
    "alphabet": ["symbol1", "symbol2"],
    "observations": [
      "Key observation about the DFA structure",
      "Another important observation"
    ]
  }
}

Provide 3-5 different language predictions with varying confidence levels based on the actual DFA structure. Focus on common patterns like:
- Even/odd counts of symbols
- Strings ending with specific patterns
- Binary numbers with specific properties
- Palindromes or near-palindromes
- Strings with specific symbol distributions
- Divisibility properties for binary numbers

IMPORTANT: Only analyze the actual DFA provided. Do not use any placeholder or example data. Base your predictions solely on the structure, states, transitions, and accepting states of the given DFA.`

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