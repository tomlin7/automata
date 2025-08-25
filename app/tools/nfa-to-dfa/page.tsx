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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadedImage(result)
        handleImageProcessing(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageProcessing = async (imageData: string) => {
    setIsProcessing(true)
    setError(null)
    setNfaResult(null)
    setDfaResult(null)

    try {
      // Recognize NFA from image
      const nfa = await recognizeNFAFromImage(imageData)
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

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-100">{error}</p>
          </div>
        )}

        {/* Upload Section */}
        <div className="mb-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">Upload NFA Image</CardTitle>
              <CardDescription className="text-white/80 text-sm">Upload a photo or drawing of your NFA for instant conversion</CardDescription>
              <div className="mt-2 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-xs text-yellow-100">
                  <strong>Note:</strong> May occasionally misinterpret complex diagrams. 
                  Please verify results for critical applications.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed border-white/30 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-white/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedImage ? (
                  <div className="space-y-4">
                    <img
                      src={uploadedImage}
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
              
              {isProcessing && (
                <div className="flex items-center gap-2 text-white/80">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Processing NFA image...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {nfaResult && dfaResult && (
          <div className="space-y-6">
            {/* Conversion Steps Toggle */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-white">Conversion Process</CardTitle>
                    <CardDescription className="text-white/80 text-sm">From: <b>{nfaResult.description}</b> to DFA</CardDescription>
                  </div>
                  <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-100">
                    Analysis
                  </div>
                </div>
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
      </div>
    </div>
  )
}
