"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Copy } from "lucide-react"
import Link from "next/link"
import { NFAVisualization } from "@/components/nfa-visualization"
import { NFATransitionTable } from "@/components/nfa-transition-table"
import { ChatInterface } from "@/components/chat-interface"
import { generateNFA, convertNFAToDFA } from "@/lib/nfa-api"

interface NFAResult {
  states: string[]
  alphabet: string[]
  transitions: Record<string, Record<string, string[]>>
  epsilonTransitions: Record<string, string[]>
  startState: string
  acceptStates: string[]
  description: string
  dotCode: string
}

interface DFAResult {
  states: string[]
  alphabet: string[]
  transitions: Record<string, Record<string, string>>
  startState: string
  acceptStates: string[]
  description: string
  dotCode: string
}

export default function PromptToNFAPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [nfaResult, setNfaResult] = useState<NFAResult | null>(null)
  const [dfaResult, setDfaResult] = useState<DFAResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDFA, setShowDFA] = useState(false)

  const examples = [
    "NFA that accepts strings containing 'ab' as substring",
    "Non-deterministic automaton for strings ending with '00' or '11'",
    "NFA accepting strings with at least one 'a' followed by any number of 'b's",
    "Automaton that accepts strings of length 2 or 3",
  ]

  const handleSubmit = async (prompt: string) => {
    setIsLoading(true)
    setError(null)
    setShowDFA(false)
    setDfaResult(null)

    try {
      const result = await generateNFA(prompt)
      setNfaResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate NFA")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConvertToDFA = async () => {
    if (!nfaResult) return

    setIsLoading(true)
    try {
      const result = await convertNFAToDFA(nfaResult)
      setDfaResult(result)
      setShowDFA(true)
    } catch (err) {
      setError("Failed to convert NFA to DFA")
    } finally {
      setIsLoading(false)
    }
  }

  const copyDotCode = () => {
    const code = showDFA ? dfaResult?.dotCode : nfaResult?.dotCode
    if (code) {
      navigator.clipboard.writeText(code)
    }
  }

  const currentResult = showDFA ? dfaResult : nfaResult
  const hasResponse = !!currentResult

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#E066B0" }}>
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
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">Prompt to NFA</h1>
                <p className="text-xs sm:text-sm text-white/80 truncate">AI-powered NFA generation</p>
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
        placeholder="Describe the NFA you want to create..."
        hasResponse={hasResponse}
      >
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-100">{error}</p>
            </div>
          )}

          {currentResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Visualization */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-white text-base sm:text-lg">
                      {showDFA ? "DFA State Diagram" : "NFA State Diagram"}
                      <Badge variant="secondary" className="text-xs ml-2 bg-white/20 text-white border-white/20">
                        {showDFA ? "Deterministic" : "Non-deterministic"}
                      </Badge>
                    </CardTitle>
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
                  <CardDescription className="text-white/80 text-sm">{currentResult.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <NFAVisualization dotCode={currentResult.dotCode} />
                </CardContent>
              </Card>

              {/* Transition Table */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-base sm:text-lg">Transition Table</CardTitle>
                  <CardDescription className="text-white/80 text-sm">
                    {showDFA ? "Deterministic transitions" : "Non-deterministic transitions with ε-moves"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showDFA ? (
                    <NFATransitionTable
                      states={currentResult.states}
                      alphabet={currentResult.alphabet}
                      transitions={currentResult.transitions}
                      startState={currentResult.startState}
                      acceptStates={currentResult.acceptStates}
                      isDFA={true}
                    />
                  ) : (
                    <NFATransitionTable
                      states={nfaResult!.states}
                      alphabet={nfaResult!.alphabet}
                      transitions={nfaResult!.transitions}
                      epsilonTransitions={nfaResult!.epsilonTransitions}
                      startState={nfaResult!.startState}
                      acceptStates={nfaResult!.acceptStates}
                      isDFA={false}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Properties */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-base sm:text-lg">{showDFA ? "DFA" : "NFA"} Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-white/80">States:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentResult.states.map((state) => (
                          <Badge key={state} variant="secondary" className="text-xs bg-white/20 text-white border-white/20">
                            {state}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-white/80">Alphabet:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentResult.alphabet.map((symbol) => (
                          <Badge key={symbol} variant="outline" className="text-xs bg-white/10 border-white/20 text-white">
                            {symbol}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-white/80">Start State:</span>
                      <Badge variant="default" className="text-xs ml-2 bg-white/20 text-white border-white/20">
                        {currentResult.startState}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium text-white/80">Accept States:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentResult.acceptStates.map((state) => (
                          <Badge key={state} variant="secondary" className="text-xs bg-white/20 text-white border-white/20">
                            {state}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  {!showDFA &&
                    nfaResult?.epsilonTransitions &&
                    Object.keys(nfaResult.epsilonTransitions).length > 0 && (
                      <div>
                        <span className="font-medium text-white/80">ε-transitions:</span>
                        <div className="mt-2 space-y-1">
                          {Object.entries(nfaResult.epsilonTransitions).map(([from, toStates]) => (
                            <div key={from} className="text-xs">
                              <Badge variant="outline" className="text-xs mr-2 bg-white/10 border-white/20 text-white">
                                {from}
                              </Badge>
                              →
                              {toStates.map((to) => (
                                <Badge key={to} variant="secondary" className="text-xs ml-2 bg-white/20 text-white border-white/20">
                                  {to}
                                </Badge>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Convert to DFA Button */}
              {nfaResult && !showDFA && (
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <Button 
                      variant="outline" 
                      onClick={handleConvertToDFA} 
                      disabled={isLoading}
                      className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      Convert to DFA
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </ChatInterface>
    </div>
  )
}
