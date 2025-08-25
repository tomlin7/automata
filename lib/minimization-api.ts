import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function recognizeDFAFromImage(imageData: string) {
  const systemPrompt = `You are an expert in automata theory and image recognition. Analyze the uploaded image of a Deterministic Finite Automaton (DFA) and extract its structure.

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
}`

  const { text } = await generateText({
    model: google("gemini-1.5-flash"),
    system: systemPrompt,
    prompt: `Analyze this DFA image and extract its structure. Image data: ${imageData.substring(0, 100)}...`,
    temperature: 0.1,
  })

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Failed to parse response")
  }

  return JSON.parse(jsonMatch[0])
}

export async function minimizeDFA(dfa: any) {
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
    model: google("gemini-1.5-flash"),
    system: systemPrompt,
    prompt: `Minimize this DFA: ${JSON.stringify(dfa)}`,
    temperature: 0.1,
  })

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Failed to parse response")
  }

  return JSON.parse(jsonMatch[0])
}
