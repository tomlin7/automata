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
  "states": ["q0", "q1", "q2"],
  "alphabet": ["a", "b"],
  "transitions": {
    "q0": {"a": ["q0", "q1"], "b": ["q0"]},
    "q1": {"a": [], "b": ["q2"]},
    "q2": {"a": ["q2"], "b": ["q2"]}
  },
  "epsilonTransitions": {
    "q0": ["q2"]
  },
  "startState": "q0",
  "acceptStates": ["q2"],
  "description": "NFA that accepts strings containing 'ab' as substring",
  "dotCode": "digraph G {\\n  rankdir=LR;\\n  node [shape=circle];\\n  q0 [shape=doublecircle];\\n  q0 -> q0 [label=\\"a,b\\"];\\n  q0 -> q1 [label=\\"a\\"];\\n  q1 -> q2 [label=\\"b\\"];\\n  q2 -> q2 [label=\\"a,b\\"];\\n}"
}

Guidelines:
- Create a valid NFA that matches the description
- Include epsilon (ε) transitions if needed
- Generate proper DOT syntax for Graphviz rendering
- Use clear state names (q0, q1, q2, etc.)
- Ensure the automaton correctly recognizes the described language
- Generate proper DOT syntax with:
  - States as nodes with appropriate shapes (circle for normal, doublecircle for accepting)
  - Transitions as directed edges with labels
  - Epsilon transitions marked appropriately
  - Clean, readable layout`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
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
