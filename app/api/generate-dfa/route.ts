import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const systemPrompt = `You are an expert in automata theory. Generate a Deterministic Finite Automaton (DFA) based on the given description.

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

Guidelines:
- Create a valid DFA that matches the description
- Each state must have exactly one transition for each symbol in the alphabet
- Generate proper DOT syntax for Graphviz rendering
- Use clear state names (state1, state2, state3, etc.)
- Ensure the automaton correctly recognizes the described language
- Generate proper DOT syntax with:
  - States as nodes with appropriate shapes (circle for normal, doublecircle for accepting)
  - Transitions as directed edges with labels
  - Start state marked appropriately
  - Clean, readable layout

IMPORTANT: Only generate a DFA based on the actual prompt provided. Do not use any placeholder or example data. Base your generation solely on the description given.`

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      prompt: `Generate a DFA for: ${prompt}`,
      temperature: 0.1,
    })

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse response" }, { status: 500 })
    }

    const dfaData = JSON.parse(jsonMatch[0])

    return NextResponse.json(dfaData)
  } catch (error) {
    console.error("Error generating DFA:", error)
    return NextResponse.json({ error: "Failed to generate DFA" }, { status: 500 })
  }
}
