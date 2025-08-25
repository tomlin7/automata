import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 })
    }

    const systemPrompt = `You are an expert in automata theory and image recognition. Analyze the uploaded image of a Deterministic Finite Automaton (DFA) and extract its structure.

Return your response as a valid JSON object with the following structure:

{
  "states": ["q0", "q1", "q2"],
  "alphabet": ["0", "1"],
  "transitions": {
    "q0": {"0": "q1", "1": "q0"},
    "q1": {"0": "q2", "1": "q1"},
    "q2": {"0": "q2", "1": "q0"}
  },
  "startState": "q0",
  "acceptStates": ["q2"],
  "description": "DFA that accepts strings ending with '00'",
  "dotCode": "digraph G {\\n  rankdir=LR;\\n  node [shape=circle];\\n  q0 [shape=doublecircle];\\n  q0 -> q1 [label=\\"0\\"];\\n  q0 -> q0 [label=\\"1\\"];\\n  q1 -> q2 [label=\\"0\\"];\\n  q1 -> q1 [label=\\"1\\"];\\n  q2 -> q2 [label=\\"0\\"];\\n  q2 -> q0 [label=\\"1\\"];\\n}"
}`

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: `Analyze this DFA image and extract its structure. Image data: ${imageData.substring(0, 100)}...`,
      temperature: 0.1,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse response" }, { status: 500 })
    }

    const dfaData = JSON.parse(jsonMatch[0])

    return NextResponse.json(dfaData)
  } catch (error) {
    console.error("Error recognizing DFA:", error)
    return NextResponse.json({ error: "Failed to recognize DFA" }, { status: 500 })
  }
} 