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

CRITICAL: You MUST ALWAYS include the "conversionSteps" array in your response, showing the step-by-step subset construction process.

Return your response as a valid JSON object with the following structure:

{
  "states": ["state1_new", "state2_new", "state3_new"],
  "alphabet": ["symbol1", "symbol2"],
  "transitions": {
    "state1_new": {"symbol1": "state2_new", "symbol2": "state1_new"},
    "state2_new": {"symbol1": "state3_new", "symbol2": "state2_new"},
    "state3_new": {"symbol1": "state3_new", "symbol2": "state1_new"}
  },
  "startState": "state1_new",
  "acceptStates": ["state3_new"],
  "description": "DFA converted from NFA using subset construction",
  "dotCode": "digraph G {\\n  rankdir=LR;\\n  node [shape=circle];\\n  state1_new [shape=doublecircle];\\n  state1_new -> state2_new [label=\\"symbol1\\"];\\n  state1_new -> state1_new [label=\\"symbol2\\"];\\n  state2_new -> state3_new [label=\\"symbol1\\"];\\n  state2_new -> state2_new [label=\\"symbol2\\"];\\n  state3_new -> state3_new [label=\\"symbol1\\"];\\n  state3_new -> state1_new [label=\\"symbol2\\"];\\n}",
  "conversionSteps": [
    {
      "step": 1,
      "description": "Compute epsilon closure of initial state",
      "newStates": ["state1_new"],
      "stateMapping": {"state1_new": ["state1"]}
    },
    {
      "step": 2,
      "description": "Process state1_new on input symbol1",
      "newStates": ["state2_new"],
      "stateMapping": {"state1_new": ["state1"], "state2_new": ["state2"]}
    }
  ]
}

REQUIRED GUIDELINES:
1. ALWAYS include "conversionSteps" array with at least 3-6 steps showing the subset construction process
2. Each step should have: step number, description, newStates array, and stateMapping object
3. Use subset construction algorithm to convert NFA to DFA
4. Create new state names that represent sets of NFA states (e.g., state1_new, state2_new, state12_new)
5. Handle epsilon transitions by computing epsilon closures
6. Show the process of discovering new states for each input symbol
7. Include steps for:
   - Initial state closure computation
   - Processing each discovered state on each input symbol
   - Discovering new states and their mappings
   - Final state determination
8. Generate proper DOT syntax for Graphviz rendering
9. States as nodes with appropriate shapes (circle for normal, doublecircle for accepting)
10. Transitions as directed edges with labels
11. Start state marked appropriately
12. Clean, readable layout

IMPORTANT: Only convert the actual NFA provided. Do not use any placeholder or example data. Base your conversion solely on the structure, states, transitions, and accepting states of the given NFA.

The conversionSteps are ESSENTIAL for educational purposes and MUST be included in every response.`

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
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

    // Validate that conversionSteps are present
    if (!dfaData.conversionSteps || !Array.isArray(dfaData.conversionSteps)) {
      console.warn("Response missing conversionSteps, adding default steps")
      dfaData.conversionSteps = [
        {
          step: 1,
          description: "Initial subset construction",
          newStates: dfaData.states.slice(0, 1),
          stateMapping: { [dfaData.states[0]]: [dfaData.startState] }
        }
      ]
    }

    return NextResponse.json(dfaData)
  } catch (error) {
    console.error("Error converting NFA to DFA:", error)
    return NextResponse.json({ error: "Failed to convert NFA to DFA" }, { status: 500 })
  }
}
