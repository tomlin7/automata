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
}

Guidelines:
- Create a valid DFA that matches the description
- Each state must have exactly one transition for each symbol in the alphabet
- Generate proper DOT syntax for Graphviz rendering
- Use clear state names (q0, q1, q2, etc.)
- Ensure the automaton correctly recognizes the described language
- Generate proper DOT syntax with:
  - States as nodes with appropriate shapes (circle for normal, doublecircle for accepting)
  - Transitions as directed edges with labels
  - Start state marked appropriately
  - Clean, readable layout`

    const { text } = await generateText({
      model: google("gemini-2.5-flash-lite"),
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
