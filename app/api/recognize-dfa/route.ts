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
  "states": ["state1", "state2", "state3"],
  "alphabet": ["symbol1", "symbol2"],
  "transitions": {
    "state1": {"symbol1": "state2", "symbol2": "state1"},
    "state2": {"symbol1": "state3", "symbol2": "state2"},
    "state3": {"symbol1": "state3", "symbol2": "state1"}
  },
  "startState": "state1",
  "acceptStates": ["state3"],
  "description": "Description of what this DFA accepts",
  "dotCode": "digraph G {\\n  rankdir=LR;\\n  node [shape=circle];\\n  state1 [shape=doublecircle];\\n  state1 -> state2 [label=\\"symbol1\\"];\\n  state1 -> state1 [label=\\"symbol2\\"];\\n  state2 -> state3 [label=\\"symbol1\\"];\\n  state2 -> state2 [label=\\"symbol2\\"];\\n  state3 -> state3 [label=\\"symbol1\\"];\\n  state3 -> state1 [label=\\"symbol2\\"];\\n}"
}

Instructions:
- Identify all states (nodes) in the automaton from the image
- Determine the input alphabet (symbols on transitions) from the image
- Extract all transitions between states from the image
- Identify the start state (usually marked with an arrow pointing to it)
- Identify accepting/final states (usually double circles)
- Generate accurate DOT code for Graphviz rendering
- Provide a clear description of what the automaton accepts

Generate proper DOT syntax with:
- States as nodes with appropriate shapes (circle for normal, doublecircle for accepting)
- Transitions as directed edges with labels
- Start state marked appropriately
- Clean, readable layout

IMPORTANT: Only analyze the actual DFA image provided. Do not use any placeholder or example data. Base your extraction solely on what you can see in the image.`

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      messages: [
        {
          role: "user" as const,
          content: [
            { type: "text" as const, text: "Analyze this DFA image and extract its structure." },
            { type: "image" as const, image: imageData }
          ]
        }
      ],
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