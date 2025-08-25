"use client"

import { AutomatonVisualization } from "./automaton-visualization"

interface DFAVisualizationProps {
  dotCode: string
}

export function DFAVisualization({ dotCode }: DFAVisualizationProps) {
  return <AutomatonVisualization dotCode={dotCode} type="dfa" />
}
