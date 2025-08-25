"use client"

import { AutomatonVisualization } from "./automaton-visualization"

interface NFAVisualizationProps {
  dotCode: string
}

export function NFAVisualization({ dotCode }: NFAVisualizationProps) {
  return <AutomatonVisualization dotCode={dotCode} type="nfa" />
}
