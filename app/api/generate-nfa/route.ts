import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const systemPrompt = `You are an expert in automata theory. Generate a Non-deterministic Finite Automaton (NFA) based on the given description.

Return your response as a valid JSON object with the following structure:

{
  "states": ["state1", "state2", "state3"],
  "alphabet": ["symbol1", "symbol2"],
  "transitions": {
    "state1": {"symbol1": ["state1", "state2"], "symbol2": ["state1"]},
    "state2": {"symbol1": [], "symbol2": ["state3"]},
    "state3": {"symbol1": ["state3"], "symbol2": ["state3"]}
  },
  "epsilonTransitions": {
    "state1": ["state3"]
  },
  "startState": "state1",
  "acceptStates": ["state3"],
  "description": "Description of what this NFA accepts",
  "dotCode": "digraph G {\\n  rankdir=LR;\\n  node [shape=circle];\\n  state1 [shape=doublecircle];\\n  state1 -> state1 [label=\\"symbol1,symbol2\\"];\\n  state1 -> state2 [label=\\"symbol1\\"];\\n  state2 -> state3 [label=\\"symbol2\\"];\\n  state3 -> state3 [label=\\"symbol1,symbol2\\"];\\n}"
}

Guidelines:
- Create a valid NFA that matches the description
- Include epsilon (ε) transitions if needed
- Generate proper DOT syntax for Graphviz rendering
- Use clear state names (state1, state2, state3, etc.)
- Ensure the automaton correctly recognizes the described language
- Generate proper DOT syntax with:
  - States as nodes with appropriate shapes (circle for normal, doublecircle for accepting)
  - Transitions as directed edges with labels
  - Epsilon transitions marked appropriately
  - Clean, readable layout

IMPORTANT: Only generate an NFA based on the actual prompt provided. Do not use any placeholder or example data. Base your generation solely on the description given.`

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      prompt: `Generate an NFA for: ${prompt}`,
      temperature: 0.1,
    })

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse response" }, { status: 500 })
    }

    const nfaData = JSON.parse(jsonMatch[0])

    return NextResponse.json(nfaData)
  } catch (error) {
    console.error("Error generating NFA:", error)
    return NextResponse.json({ error: "Failed to generate NFA" }, { status: 500 })
  }
}
