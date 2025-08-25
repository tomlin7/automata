import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { dfa } = await request.json()

    if (!dfa) {
      return NextResponse.json({ error: "DFA data is required" }, { status: 400 })
    }

    const systemPrompt = `You are an expert in automata theory. Minimize the given Deterministic Finite Automaton (DFA) using the Hopcroft algorithm or equivalent minimization technique.

Return your response as a valid JSON object with the following structure:

{
  "states": ["q0", "q1"],
  "alphabet": ["0", "1"],
  "transitions": {
    "q0": {"0": "q1", "1": "q0"},
    "q1": {"0": "q1", "1": "q0"}
  },
  "startState": "q0",
  "acceptStates": ["q1"],
  "description": "Minimized DFA equivalent to the original",
  "dotCode": "digraph G {\\n  rankdir=LR;\\n  node [shape=circle];\\n  q0 [shape=doublecircle];\\n  q0 -> q1 [label=\\"0\\"];\\n  q0 -> q0 [label=\\"1\\"];\\n  q1 -> q1 [label=\\"0\\"];\\n  q1 -> q0 [label=\\"1\\"];\\n}",
  "minimizationSteps": [
    {
      "step": 1,
      "description": "Initial partition",
      "equivalenceClasses": [
        {"id": "A", "states": ["q0", "q1"], "representative": "q0", "isAccepting": false},
        {"id": "B", "states": ["q2"], "representative": "q2", "isAccepting": true}
      ],
      "action": "Separate accepting and non-accepting states"
    }
  ],
  "equivalenceClasses": [
    {"id": "A", "states": ["q0", "q1"], "representative": "q0", "isAccepting": false},
    {"id": "B", "states": ["q2"], "representative": "q2", "isAccepting": true}
  ],
  "removedStates": ["q1"],
  "stateReduction": 33
}`

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: `Minimize this DFA: ${JSON.stringify(dfa)}`,
      temperature: 0.1,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse response" }, { status: 500 })
    }

    const minimizedData = JSON.parse(jsonMatch[0])

    return NextResponse.json(minimizedData)
  } catch (error) {
    console.error("Error minimizing DFA:", error)
    return NextResponse.json({ error: "Failed to minimize DFA" }, { status: 500 })
  }
} 