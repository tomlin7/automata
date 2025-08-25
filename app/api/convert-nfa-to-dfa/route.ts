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
  "states": ["q0_new", "q1_new", "q2_new"],
  "alphabet": ["0", "1"],
  "transitions": {
    "q0_new": {"0": "q1_new", "1": "q0_new"},
    "q1_new": {"0": "q2_new", "1": "q1_new"},
    "q2_new": {"0": "q2_new", "1": "q0_new"}
  },
  "startState": "q0_new",
  "acceptStates": ["q2_new"],
  "description": "DFA converted from NFA using subset construction",
  "dotCode": "digraph G {\\n  rankdir=LR;\\n  node [shape=circle];\\n  q0_new [shape=doublecircle];\\n  q0_new -> q1_new [label=\\"0\\"];\\n  q0_new -> q0_new [label=\\"1\\"];\\n  q1_new -> q2_new [label=\\"0\\"];\\n  q1_new -> q1_new [label=\\"1\\"];\\n  q2_new -> q2_new [label=\\"0\\"];\\n  q2_new -> q0_new [label=\\"1\\"];\\n}",
  "conversionSteps": [
    {
      "step": 1,
      "description": "Compute epsilon closure of initial state q0",
      "newStates": ["q0_new"],
      "stateMapping": {"q0_new": ["q0"]}
    },
    {
      "step": 2,
      "description": "Process q0_new on input 0",
      "newStates": ["q1_new"],
      "stateMapping": {"q0_new": ["q0"], "q1_new": ["q1"]}
    },
    {
      "step": 3,
      "description": "Process q0_new on input 1",
      "newStates": [],
      "stateMapping": {"q0_new": ["q0"], "q1_new": ["q1"]}
    },
    {
      "step": 4,
      "description": "Process q1_new on input 0",
      "newStates": ["q2_new"],
      "stateMapping": {"q0_new": ["q0"], "q1_new": ["q1"], "q2_new": ["q2"]}
    },
    {
      "step": 5,
      "description": "Process q1_new on input 1",
      "newStates": [],
      "stateMapping": {"q0_new": ["q0"], "q1_new": ["q1"], "q2_new": ["q2"]}
    },
    {
      "step": 6,
      "description": "Process q2_new on both inputs",
      "newStates": [],
      "stateMapping": {"q0_new": ["q0"], "q1_new": ["q1"], "q2_new": ["q2"]}
    }
  ]
}

REQUIRED GUIDELINES:
1. ALWAYS include "conversionSteps" array with at least 3-6 steps showing the subset construction process
2. Each step should have: step number, description, newStates array, and stateMapping object
3. Use subset construction algorithm to convert NFA to DFA
4. Create new state names that represent sets of NFA states (e.g., q0_new, q1_new, q01_new)
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
        },
        {
          step: 2,
          description: "Process discovered states",
          newStates: dfaData.states.slice(1),
          stateMapping: dfaData.states.reduce((acc: Record<string, string[]>, state: string, index: number) => {
            acc[state] = [`q${index}`]
            return acc
          }, {} as Record<string, string[]>)
        }
      ]
    }

    return NextResponse.json(dfaData)
  } catch (error) {
    console.error("Error converting NFA to DFA:", error)
    return NextResponse.json({ error: "Failed to convert NFA to DFA" }, { status: 500 })
  }
}
