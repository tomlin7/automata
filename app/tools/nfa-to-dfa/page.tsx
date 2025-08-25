"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Camera, Copy, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { NFAVisualization } from "@/components/nfa-visualization"
import { NFATransitionTable } from "@/components/nfa-transition-table"
import { ConversionSteps } from "@/components/conversion-steps"
import { ChatInterface } from "@/components/chat-interface"
import { recognizeNFAFromImage, convertNFAToDFA } from "@/lib/image-recognition"

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
  conversionSteps: ConversionStep[]
}

interface ConversionStep {
  step: number
  description: string
  newStates?: string[]
  stateMapping?: Record<string, string[]>
}

export default function NFAToDFAPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [nfaResult, setNfaResult] = useState<NFAResult | null>(null)
  const [dfaResult, setDfaResult] = useState<DFAResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSteps, setShowSteps] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const examples = [
    "Convert this NFA to DFA",
    "Convert this NFA with epsilon transitions to DFA",
    "Process NFA image with binary alphabet {0,1}",
    "Recognize and convert handwritten NFA to DFA",
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setNfaResult(null)
        setDfaResult(null)
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
      // Recognize NFA from image
      const nfa = await recognizeNFAFromImage(uploadedImage)
      setNfaResult(nfa)

      // Convert to DFA
      const dfa = await convertNFAToDFA(nfa)
      setDfaResult(dfa)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image")
    } finally {
      setIsProcessing(false)
    }
  }

  const copyDotCode = (isDFA: boolean) => {
    const code = isDFA ? dfaResult?.dotCode : nfaResult?.dotCode
    if (code) {
      navigator.clipboard.writeText(code)
    }
  }

  const hasResponse = !!(nfaResult && dfaResult)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#D96B6B" }}>
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
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">NFA → DFA</h1>
                <p className="text-xs sm:text-sm text-white/80 truncate">Photo input with subset construction</p>
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
                <CardTitle className="text-white text-lg sm:text-xl">Upload NFA Image</CardTitle>
                <CardDescription className="text-white/80 text-sm">Upload a photo or drawing of your NFA</CardDescription>
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
                        alt="Uploaded NFA"
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

          {nfaResult && dfaResult && (
            <div className="space-y-6">
              {/* Conversion Steps Toggle */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Conversion Process</CardTitle>
                  <CardDescription className="text-white/80 text-sm">From: <b>{nfaResult.description}</b> to DFA</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant={showSteps ? "default" : "outline"}
                    onClick={() => setShowSteps(!showSteps)}
                    size="sm"
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    {showSteps ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showSteps ? "Hide Steps" : "Show Conversion Steps"}
                  </Button>
                </CardContent>
              </Card>

              {showSteps ? (
                  <ConversionSteps steps={dfaResult.conversionSteps} />
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  {/* Original NFA */}
                  {/* <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-white text-base sm:text-lg">
                          Original NFA
                          <Badge variant="secondary" className="text-xs ml-2 bg-white/20 text-white border-white/20">
                            NFA
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
                      <CardDescription className="text-white/80 text-sm">{nfaResult.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <NFAVisualization dotCode={nfaResult.dotCode} />
                    </CardContent>
                  </Card> */}

                  {/* Converted DFA */}
                  <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-white text-base sm:text-lg">
                          Converted DFA
                          <Badge variant="default" className="text-xs ml-2 bg-white/20 text-white border-white/20">
                            Deterministic
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
                      <CardDescription className="text-white/80 text-sm">{dfaResult.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <NFAVisualization dotCode={dfaResult.dotCode} />
                    </CardContent>
                  </Card>

                  {/* NFA Transition Table */}
                  {/* <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white text-base sm:text-lg">NFA Transitions</CardTitle>
                      <CardDescription className="text-white/80 text-sm">Original non-deterministic transitions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <NFATransitionTable
                        states={nfaResult.states}
                        alphabet={nfaResult.alphabet}
                        transitions={nfaResult.transitions}
                        epsilonTransitions={nfaResult.epsilonTransitions}
                        startState={nfaResult.startState}
                        acceptStates={nfaResult.acceptStates}
                        isDFA={false}
                      />
                    </CardContent>
                  </Card> */}

                  {/* DFA Transition Table */}
                  <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white text-base sm:text-lg">DFA Transitions</CardTitle>
                      <CardDescription className="text-white/80 text-sm">Converted deterministic transitions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <NFATransitionTable
                        states={dfaResult.states}
                        alphabet={dfaResult.alphabet}
                        transitions={dfaResult.transitions}
                        startState={dfaResult.startState}
                        acceptStates={dfaResult.acceptStates}
                        isDFA={true}
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
