import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const systemPrompt = `You are an expert in automata theory and image recognition. Analyze the uploaded image of a non-deterministic finite automaton and extract its structure.

The image contains a hand-drawn or digital finite automaton. Extract:
- States (circles with labels)
- Transitions (arrows with labels)
- Start state (arrow pointing to it)
- Accept states (double circles)

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
  "description": "A DFA that accepts strings ending with '00'",
  "dotCode": "digraph G {\\n  rankdir=LR;\\n  node [shape=circle];\\n  q0 [shape=doublecircle];\\n  q0 -> q1 [label=\\"0\\"];\\n  q0 -> q0 [label=\\"1\\"];\\n  q1 -> q2 [label=\\"0\\"];\\n  q1 -> q1 [label=\\"1\\"];\\n  q2 -> q2 [label=\\"0\\"];\\n  q2 -> q0 [label=\\"1\\"];\\n}"
}

Instructions:
- Identify all states (nodes) in the automaton
- Determine the input alphabet (symbols on transitions)
- Extract all transitions between states
- Identify the start state (usually marked with an arrow pointing to it)
- Identify accepting/final states (usually double circles)
- Generate accurate DOT code for Graphviz rendering
- Provide a clear description of what the automaton accepts

Generate proper DOT syntax with:
- States as nodes with appropriate shapes (circle for normal, doublecircle for accepting)
- Transitions as directed edges with labels
- Start state marked appropriately
- Clean, readable layout`

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: `Analyze this automaton image and extract its structure. Image data: ${imageData.substring(0, 100)}...`,
      temperature: 0.1,
    })

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse response" }, { status: 500 })
    }

    const automatonData = JSON.parse(jsonMatch[0])

    return NextResponse.json(automatonData)
  } catch (error) {
    console.error("Error processing image:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}
