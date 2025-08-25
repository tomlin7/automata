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
  "states": ["state1", "state2"],
  "alphabet": ["symbol1", "symbol2"],
  "transitions": {
    "state1": {"symbol1": "state2", "symbol2": "state1"},
    "state2": {"symbol1": "state2", "symbol2": "state1"}
  },
  "startState": "state1",
  "acceptStates": ["state2"],
  "description": "Minimized DFA equivalent to the original",
  "dotCode": "digraph G {\\n  rankdir=LR;\\n  node [shape=circle];\\n  state1 [shape=doublecircle];\\n  state1 -> state2 [label=\\"symbol1\\"];\\n  state1 -> state1 [label=\\"symbol2\\"];\\n  state2 -> state2 [label=\\"symbol1\\"];\\n  state2 -> state1 [label=\\"symbol2\\"];\\n}",
  "minimizationSteps": [
    {
      "step": 1,
      "description": "Initial partition",
      "equivalenceClasses": [
        {"id": "A", "states": ["state1", "state2"], "representative": "state1", "isAccepting": false},
        {"id": "B", "states": ["state3"], "representative": "state3", "isAccepting": true}
      ],
      "action": "Separate accepting and non-accepting states"
    }
  ],
  "equivalenceClasses": [
    {"id": "A", "states": ["state1", "state2"], "representative": "state1", "isAccepting": false},
    {"id": "B", "states": ["state3"], "representative": "state3", "isAccepting": true}
  ],
  "removedStates": ["state2"],
  "stateReduction": 33
}

IMPORTANT: Only minimize the actual DFA provided. Do not use any placeholder or example data. Base your minimization solely on the structure, states, transitions, and accepting states of the given DFA.`

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
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