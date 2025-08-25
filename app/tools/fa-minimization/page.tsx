"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Camera, Copy, Eye, EyeOff, BarChart3 } from "lucide-react"
import Link from "next/link"
import { DFAVisualization } from "@/components/dfa-visualization"
import { TransitionTable } from "@/components/transition-table"
import { MinimizationSteps } from "@/components/minimization-steps"
import { ChatInterface } from "@/components/chat-interface"
import { recognizeDFAFromImage, minimizeDFA } from "@/lib/minimization-api"

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
  minimizationSteps: MinimizationStep[]
  equivalenceClasses: EquivalenceClass[]
  removedStates: string[]
  stateReduction: number
}

interface MinimizationStep {
  step: number
  description: string
  equivalenceClasses: EquivalenceClass[]
  action: string
}

interface EquivalenceClass {
  id: string
  states: string[]
  representative: string
  isAccepting: boolean
}

export default function FAMinimizationPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [originalDFA, setOriginalDFA] = useState<DFAResult | null>(null)
  const [minimizedDFA, setMinimizedDFA] = useState<MinimizedDFAResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSteps, setShowSteps] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const examples = [
    "Minimize this DFA to reduce the number of states",
    "Find equivalent states and merge them",
    "Optimize the automaton by removing redundant states",
    "Apply Hopcroft's algorithm to minimize this DFA",
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setOriginalDFA(null)
        setMinimizedDFA(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (prompt: string) => {
    if (!uploadedImage) return

    setIsProcessing(true)
    setError(null)

    try {
      // Recognize DFA from image
      const dfa = await recognizeDFAFromImage(uploadedImage)
      setOriginalDFA(dfa)

      // Minimize DFA
      const minimized = await minimizeDFA(dfa)
      setMinimizedDFA(minimized)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image")
    } finally {
      setIsProcessing(false)
    }
  }

  const copyDotCode = (isMinimized: boolean) => {
    const code = isMinimized ? minimizedDFA?.dotCode : originalDFA?.dotCode
    if (code) {
      navigator.clipboard.writeText(code)
    }
  }

  const reductionPercentage = minimizedDFA
    ? Math.round(((originalDFA!.states.length - minimizedDFA.states.length) / originalDFA!.states.length) * 100)
    : 0

  const hasResponse = !!(originalDFA && minimizedDFA)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#50A080" }}>
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
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">DFA Minimizer</h1>
                <p className="text-xs sm:text-sm text-white/80 truncate">Photo input with state reduction</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <ChatInterface
        onSubmit={handleSubmit}
        isLoading={isProcessing}
        examples={examples}
        placeholder="Describe a bit..."
        hasResponse={hasResponse}
      >
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
          {/* Upload Section */}
          <div className="mb-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl">Upload DFA Image</CardTitle>
                <CardDescription className="text-white/80 text-sm">Upload a photo or drawing of your DFA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-white/30 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-white/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Uploaded DFA"
                        className="max-w-full max-h-32 sm:max-h-48 mx-auto rounded-lg border border-white/20"
                      />
                      <p className="text-sm text-white/80">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Camera className="w-8 h-8 sm:w-12 sm:h-12 text-white/60 mx-auto" />
                      <div>
                        <p className="text-sm font-medium text-white">Click to upload image</p>
                        <p className="text-xs text-white/60">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-100">{error}</p>
            </div>
          )}

          {originalDFA && minimizedDFA && (
            <div className="space-y-6">
              {/* Minimization Stats */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg sm:text-xl">Minimization Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/80">Original States:</span>
                      <p className="font-medium text-white">{originalDFA.states.length}</p>
                    </div>
                    <div>
                      <span className="text-white/80">Minimized States:</span>
                      <p className="font-medium text-white">{minimizedDFA.states.length}</p>
                    </div>
                    <div>
                      <span className="text-white/80">States Removed:</span>
                      <p className="font-medium text-white">{minimizedDFA.removedStates.length}</p>
                    </div>
                    <div>
                      <span className="text-white/80">Reduction:</span>
                      <p className="font-medium text-white">{reductionPercentage}%</p>
                    </div>
                  </div>
                  {minimizedDFA.removedStates.length > 0 && (
                    <div>
                      <span className="text-white/80 text-sm">Removed states:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {minimizedDFA.removedStates.map((state) => (
                          <Badge key={state} variant="destructive" className="text-xs bg-red-500/20 text-red-100 border-red-500/30">
                            {state}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Minimization Steps Toggle */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Minimization Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant={showSteps ? "default" : "outline"}
                    onClick={() => setShowSteps(!showSteps)}
                    size="sm"
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    {showSteps ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showSteps ? "Hide Steps" : "Show Minimization Steps"}
                  </Button>
                </CardContent>
              </Card>

              {showSteps ? (
                <MinimizationSteps
                  steps={minimizedDFA.minimizationSteps}
                  equivalenceClasses={minimizedDFA.equivalenceClasses}
                />
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  {/* Original DFA */}
                  {/* <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-white text-base sm:text-lg">
                          Original DFA
                          <Badge variant="secondary" className="text-xs ml-2 bg-white/20 text-white border-white/20">
                            {originalDFA.states.length} states
                          </Badge>
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyDotCode(false)}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex-shrink-0"
                        >
                          <Copy className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Copy</span>
                        </Button>
                      </div>
                      <CardDescription className="text-white/80 text-sm">{originalDFA.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DFAVisualization dotCode={originalDFA.dotCode} />
                    </CardContent>
                  </Card> */}

                  {/* Minimized DFA */}
                  <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-white text-base sm:text-lg">
                          Minimized DFA
                          <Badge variant="default" className="text-xs ml-2 bg-white/20 text-white border-white/20">
                            {minimizedDFA.states.length} states
                          </Badge>
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyDotCode(true)}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex-shrink-0"
                        >
                          <Copy className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Copy</span>
                        </Button>
                      </div>
                      <CardDescription className="text-white/80 text-sm">{minimizedDFA.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DFAVisualization dotCode={minimizedDFA.dotCode} />
                    </CardContent>
                  </Card>

                  {/* Original Transition Table */}
                  {/* <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white text-base sm:text-lg">Original Transitions</CardTitle>
                      <CardDescription className="text-white/80 text-sm">Complete transition function</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TransitionTable
                        states={originalDFA.states}
                        alphabet={originalDFA.alphabet}
                        transitions={originalDFA.transitions}
                        startState={originalDFA.startState}
                        acceptStates={originalDFA.acceptStates}
                      />
                    </CardContent>
                  </Card> */}

                  {/* Minimized Transition Table */}
                  <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white text-base sm:text-lg">Minimized Transitions</CardTitle>
                      <CardDescription className="text-white/80 text-sm">Optimized transition function</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TransitionTable
                        states={minimizedDFA.states}
                        alphabet={minimizedDFA.alphabet}
                        transitions={minimizedDFA.transitions}
                        startState={minimizedDFA.startState}
                        acceptStates={minimizedDFA.acceptStates}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          {/* <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white">Tips for Best Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs mt-0.5 bg-white/10 border-white/20 text-white flex-shrink-0">
                  1
                </Badge>
                <p className="text-white/80">Draw states as clear circles with labels</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs mt-0.5 bg-white/10 border-white/20 text-white flex-shrink-0">
                  2
                </Badge>
                <p className="text-white/80">Use arrows to show transitions between states</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs mt-0.5 bg-white/10 border-white/20 text-white flex-shrink-0">
                  3
                </Badge>
                <p className="text-white/80">Mark start state with an arrow pointing to it</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs mt-0.5 bg-white/10 border-white/20 text-white flex-shrink-0">
                  4
                </Badge>
                <p className="text-white/80">Use double circles for accepting states</p>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </ChatInterface>
    </div>
  )
}
