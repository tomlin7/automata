"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Copy } from "lucide-react"
import Link from "next/link"
import { DFAVisualization } from "@/components/dfa-visualization"
import { TransitionTable } from "@/components/transition-table"
import { MinimizationSteps } from "@/components/minimization-steps"
import { ChatInterface } from "@/components/chat-interface"
import { generateDFA } from "@/lib/dfa-api"
import { minimizeDFA } from "@/lib/minimization-api"
import { AutomatonVisualizationRef } from "@/components/automaton-visualization"

interface DFAResult {
  states: string[]
  alphabet: string[]
  transitions: Record<string, Record<string, string>>
  startState: string
  acceptStates: string[]
  description: string
  dotCode: string
}

interface MinimizedDFAResult extends DFAResult {
  minimizationSteps: Array<{
    step: number
    description: string
    equivalenceClasses: Array<{
      id: string
      states: string[]
      representative: string
      isAccepting: boolean
    }>
    action: string
  }>
  equivalenceClasses: Array<{
    id: string
    states: string[]
    representative: string
    isAccepting: boolean
  }>
  removedStates: string[]
  stateReduction: number
}

export default function PromptToDFAPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [dfaResult, setDfaResult] = useState<DFAResult | null>(null)
  const [minimizedDfaResult, setMinimizedDfaResult] = useState<MinimizedDFAResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const originalDfaRef = useRef<AutomatonVisualizationRef>(null)
  const minimizedDfaRef = useRef<AutomatonVisualizationRef>(null)

  const examples = [
    "DFA that accepts strings with an even number of 0s",
    "Automaton for strings that start and end with the same symbol",
    "DFA accepting strings with at least two consecutive 1s",
    "Finite automaton for binary numbers divisible by 3",
  ]

  const handleSubmit = async (prompt: string) => {
    setIsLoading(true)
    setError(null)
    setMinimizedDfaResult(null)

    try {
      const result = await generateDFA(prompt)
      setDfaResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate DFA")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMinimize = async () => {
    if (!dfaResult) return

    setIsLoading(true)
    setError(null)
    
    try {
      const minimizedResult = await minimizeDFA(dfaResult)
      setMinimizedDfaResult(minimizedResult)
    } catch (err) {
      setError("Failed to minimize DFA")
    } finally {
      setIsLoading(false)
    }
  }

  const copyOriginalDiagram = () => {
    originalDfaRef.current?.copyPNG()
  }

  const exportOriginalDiagram = () => {
    originalDfaRef.current?.exportPNG()
  }

  const copyMinimizedDiagram = () => {
    minimizedDfaRef.current?.copyPNG()
  }

  const exportMinimizedDiagram = () => {
    minimizedDfaRef.current?.exportPNG()
  }

  const hasResponse = !!dfaResult

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#E68A4E" }}>
      {/* Header */}
      <header className="border-b border-white/20 bg-white/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">DFA</h1>
                <p className="text-xs sm:text-sm text-white/80 truncate">Generate DFA easily</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <ChatInterface
        onSubmit={handleSubmit}
        isLoading={isLoading}
        examples={examples}
        placeholder="Describe the DFA you want to create..."
        hasResponse={hasResponse}
      >
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-100">{error}</p>
            </div>
          )}

          {dfaResult && (
            <>
              {/* Original DFA Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-6">Original DFA</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {/* DFA Visualization */}
                  <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-white text-base sm:text-lg">State Diagram</CardTitle>
                        <div className="flex gap-1 sm:gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={copyOriginalDiagram}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                          >
                            <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline ml-1 sm:ml-2">Copy</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={exportOriginalDiagram}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                          >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline ml-1 sm:ml-2">Export</span>
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-white/80 text-sm">{dfaResult.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DFAVisualization 
                        ref={originalDfaRef}
                        dotCode={dfaResult.dotCode} 
                        showControls={false}
                      />
                    </CardContent>
                  </Card>

                  {/* Transition Table */}
                  <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white text-base sm:text-lg">Transition Table</CardTitle>
                      <CardDescription className="text-white/80 text-sm">Formal representation of state transitions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TransitionTable
                        states={dfaResult.states}
                        alphabet={dfaResult.alphabet}
                        transitions={dfaResult.transitions}
                        startState={dfaResult.startState}
                        acceptStates={dfaResult.acceptStates}
                      />
                    </CardContent>
                  </Card>

                  {/* DFA Properties */}
                  <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white text-base sm:text-lg">DFA Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-white/80">States:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dfaResult.states.map((state) => (
                              <Badge key={state} variant="secondary" className="text-xs bg-white/20 text-white border-white/20">
                                {state}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-white/80">Alphabet:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dfaResult.alphabet.map((symbol) => (
                              <Badge key={symbol} variant="outline" className="text-xs bg-white/10 border-white/20 text-white">
                                {symbol}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-white/80">Start State:</span>
                          <Badge variant="default" className="text-xs ml-2 bg-white/20 text-white border-white/20">
                            {dfaResult.startState}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium text-white/80">Accept States:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dfaResult.acceptStates.map((state) => (
                              <Badge key={state} variant="secondary" className="text-xs bg-white/20 text-white border-white/20">
                                {state}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Minimize Button */}
                  <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <Button 
                        variant="outline" 
                        onClick={handleMinimize} 
                        disabled={isLoading}
                        className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        {isLoading ? "Minimizing..." : "Minimize DFA"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Minimized DFA Section */}
              {minimizedDfaResult && (
                <div className="mt-12">
                  <h2 className="text-xl font-bold text-white mb-6">Minimized DFA</h2>
                  
                  {/* Minimization Summary */}
                  <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-6">
                    <CardHeader>
                      <CardTitle className="text-white text-base sm:text-lg">Minimization Summary</CardTitle>
                      <CardDescription className="text-white/80 text-sm">
                        {minimizedDfaResult.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-white/10 rounded-lg">
                          <div className="text-2xl font-bold text-white">{minimizedDfaResult.states.length}</div>
                          <div className="text-white/80">Final States</div>
                        </div>
                        <div className="text-center p-3 bg-white/10 rounded-lg">
                          <div className="text-2xl font-bold text-white">{minimizedDfaResult.removedStates.length}</div>
                          <div className="text-white/80">States Removed</div>
                        </div>
                        <div className="text-center p-3 bg-white/10 rounded-lg">
                          <div className="text-2xl font-bold text-white">{minimizedDfaResult.stateReduction}%</div>
                          <div className="text-white/80">Reduction</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Minimized DFA Visualization */}
                    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-white text-base sm:text-lg">Minimized State Diagram</CardTitle>
                          <div className="flex gap-1 sm:gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={copyMinimizedDiagram}
                              className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                            >
                              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline ml-1 sm:ml-2">Copy</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={exportMinimizedDiagram}
                              className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                            >
                              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline ml-1 sm:ml-2">Export</span>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <DFAVisualization 
                          ref={minimizedDfaRef}
                          dotCode={minimizedDfaResult.dotCode} 
                          showControls={false}
                        />
                      </CardContent>
                    </Card>

                    {/* Minimized Transition Table */}
                    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white text-base sm:text-lg">Minimized Transition Table</CardTitle>
                        <CardDescription className="text-white/80 text-sm">Formal representation of minimized state transitions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <TransitionTable
                          states={minimizedDfaResult.states}
                          alphabet={minimizedDfaResult.alphabet}
                          transitions={minimizedDfaResult.transitions}
                          startState={minimizedDfaResult.startState}
                          acceptStates={minimizedDfaResult.acceptStates}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Minimization Steps */}
                  <div className="mt-8">
                    <MinimizationSteps 
                      steps={minimizedDfaResult.minimizationSteps}
                      equivalenceClasses={minimizedDfaResult.equivalenceClasses}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ChatInterface>
    </div>
  )
}
