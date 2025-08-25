"use client"

import { forwardRef } from "react"
import { AutomatonVisualization, AutomatonVisualizationRef } from "./automaton-visualization"

interface DFAVisualizationProps {
  dotCode: string
  showControls?: boolean
}

export const DFAVisualization = forwardRef<AutomatonVisualizationRef, DFAVisualizationProps>(
  ({ dotCode, showControls }, ref) => {
    return (
      <AutomatonVisualization 
        ref={ref}
        dotCode={dotCode} 
        type="dfa" 
        showControls={showControls}
      />
    )
  }
)

DFAVisualization.displayName = "DFAVisualization"
