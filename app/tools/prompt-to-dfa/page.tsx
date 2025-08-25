"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Copy } from "lucide-react"
import Link from "next/link"
import { DFAVisualization } from "@/components/dfa-visualization"
import { TransitionTable } from "@/components/transition-table"
import { generateDFA } from "@/lib/dfa-api"

interface DFAResult {
  states: string[]
  alphabet: string[]
  transitions: Record<string, Record<string, string>>
  startState: string
  acceptStates: string[]
  description: string
  dotCode: string
}

export default function PromptToDFAPage() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [dfaResult, setDfaResult] = useState<DFAResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError(null)

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
    try {
      // TODO: Implement DFA minimization
      console.log("Minimizing DFA...")
    } catch (err) {
      setError("Failed to minimize DFA")
    } finally {
      setIsLoading(false)
    }
  }

  const copyDotCode = () => {
    if (dfaResult?.dotCode) {
      navigator.clipboard.writeText(dfaResult.dotCode)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#E68A4E" }}>
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
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">Prompt to DFA</h1>
                <p className="text-xs sm:text-sm text-white/80 truncate">AI-powered DFA generation</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Input Section */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl">Describe Your Automaton</CardTitle>
                <CardDescription className="text-white/80 text-sm">
                  Enter a natural language description of the finite automaton you want to create.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Example: Create a DFA that accepts all strings over {0,1} that end with '01'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-32 resize-none bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!prompt.trim() || isLoading} 
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30"
                    variant="outline"
                  >
                    {isLoading ? "Generating..." : "Generate DFA"}
                  </Button>
                  {dfaResult && (
                    <Button 
                      variant="outline" 
                      onClick={handleMinimize} 
                      disabled={isLoading}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      Minimize
                    </Button>
                  )}
                </div>
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md">
                    <p className="text-sm text-red-100">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Examples */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white">Example Prompts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "DFA that accepts strings with an even number of 0s",
                  "Automaton for strings that start and end with the same symbol",
                  "DFA accepting strings with at least two consecutive 1s",
                  "Finite automaton for binary numbers divisible by 3",
                ].map((example, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-white flex-shrink-0 mt-0.5">
                      Example {index + 1}
                    </Badge>
                    <button
                      onClick={() => setPrompt(example)}
                      className="text-sm text-white/80 hover:text-white transition-colors text-left"
                    >
                      {example}
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-4 sm:space-y-6">
            {dfaResult ? (
              <>
                {/* DFA Visualization */}
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-white text-base sm:text-lg">State Diagram</CardTitle>
                      <div className="flex gap-1 sm:gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={copyDotCode}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                        >
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline ml-1 sm:ml-2">Copy</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
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
                    <DFAVisualization dotCode={dfaResult.dotCode} />
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
              </>
            ) : (
              <Card className="h-64 sm:h-96 flex items-center justify-center bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="text-center">
                  <p className="text-white/80 text-sm sm:text-base">
                    Enter a description and generate your DFA to see the visualization
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
