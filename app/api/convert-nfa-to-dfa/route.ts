import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { nfa } = await request.json()

    if (!nfa) {
      return NextResponse.json({ error: "NFA data is required" }, { status: 400 })
    }

    const systemPrompt = `You are an expert in automata theory. Convert the given Non-deterministic Finite Automaton (NFA) to a Deterministic Finite Automaton (DFA) using the subset construction algorithm.

Return your response as a valid JSON object with the following structure:

{
  "states": ["q0_set", "q1_set", "q2_set"],
  "alphabet": ["0", "1"],
  "transitions": {
    "q0_set": {"0": "q1_set", "1": "q0_set"},
    "q1_set": {"0": "q2_set", "1": "q1_set"},
    "q2_set": {"0": "q2_set", "1": "q0_set"}
  },
  "startState": "q0_set",
  "acceptStates": ["q2_set"],
  "description": "DFA converted from NFA using subset construction",
  "dotCode": "digraph G {\\n  rankdir=LR;\\n  node [shape=circle];\\n  q0_set [shape=doublecircle];\\n  q0_set -> q1_set [label=\\"0\\"];\\n  q0_set -> q0_set [label=\\"1\\"];\\n  q1_set -> q2_set [label=\\"0\\"];\\n  q1_set -> q1_set [label=\\"1\\"];\\n  q2_set -> q2_set [label=\\"0\\"];\\n  q2_set -> q0_set [label=\\"1\\"];\\n}",
  "conversionSteps": [
    {
      "step": 1,
      "description": "Initial state closure",
      "newStates": ["q0_set"],
      "stateMapping": {"q0_set": ["q0"]}
    }
  ]
}

Guidelines:
- Use subset construction algorithm to convert NFA to DFA
- Create new state names that represent sets of NFA states (e.g., q0_set, q1_set)
- Handle epsilon transitions by computing epsilon closures
- Generate proper DOT syntax for Graphviz rendering
- Include conversion steps showing the subset construction process
- Generate proper DOT syntax with:
  - States as nodes with appropriate shapes (circle for normal, doublecircle for accepting)
  - Transitions as directed edges with labels
  - Start state marked appropriately
  - Clean, readable layout`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      prompt: `Convert this NFA to DFA using subset construction: ${JSON.stringify(nfa)}`,
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
    console.error("Error converting NFA to DFA:", error)
    return NextResponse.json({ error: "Failed to convert NFA to DFA" }, { status: 500 })
  }
}
