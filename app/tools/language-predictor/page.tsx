"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, FileImage, Languages, Brain, Camera, Copy, BarChart3, ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import { DFAVisualization } from "@/components/dfa-visualization"
import { TransitionTable } from "@/components/transition-table"
import { recognizeDFAFromImage } from "@/lib/minimization-api"
import { predictLanguage } from "@/lib/language-prediction-api"

interface RecognizedDFA {
  states: string[]
  alphabet: string[]
  transitions: Record<string, Record<string, string>>
  startState: string
  acceptStates: string[]
  description: string
  dotCode: string
}

interface LanguagePrediction {
  language: string
  confidence: number
  description: string
  examples: string[]
  pattern?: string
  reasoning?: string
}

interface LanguageAnalysis {
  totalStates: number
  acceptingStates: number
  alphabet: string[]
  observations: string[]
}

interface PredictionResult {
  predictions: LanguagePrediction[]
  analysis: LanguageAnalysis
}

export default function LanguagePredictorPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [recognizedDfa, setRecognizedDfa] = useState<RecognizedDFA | null>(null)
  const [languagePredictions, setLanguagePredictions] = useState<LanguagePrediction[]>([])
  const [analysis, setAnalysis] = useState<LanguageAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [expandedReasoning, setExpandedReasoning] = useState<number[]>([])
  const [observationsExpanded, setObservationsExpanded] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dfaRef = useRef<any>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setUploadedImage(result)
      handleImageAnalysis(result)
    }
    reader.readAsDataURL(file)
  }

  const handleImageAnalysis = async (imageData: string) => {
    setIsLoading(true)
    setError(null)
    setRecognizedDfa(null)
    setLanguagePredictions([])
    setAnalysis(null)

    try {
      // First, recognize the DFA from the image
      const recognizedResult = await recognizeDFAFromImage(imageData)
      setRecognizedDfa(recognizedResult)

      // Then, predict possible languages
      const predictionResult: PredictionResult = await predictLanguage(recognizedResult)
      setLanguagePredictions(predictionResult.predictions)
      setAnalysis(predictionResult.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze image")
    } finally {
      setIsLoading(false)
    }
  }

  const copyDiagram = () => {
    dfaRef.current?.copyPNG()
  }

  const exportDiagram = () => {
    dfaRef.current?.exportPNG()
  }

  const toggleReasoning = (index: number) => {
    setExpandedReasoning(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const toggleObservations = () => {
    setObservationsExpanded(prev => !prev)
  }

  const hasResponse = !!recognizedDfa

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#5C85D6" }}>
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
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">Language Predictor</h1>
                <p className="text-xs sm:text-sm text-white/80 truncate">DFA Only</p>
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
              <CardTitle className="text-white text-lg sm:text-xl flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Upload Automaton
              </CardTitle>
              <CardDescription className="text-white/80">
                Upload an image of a DFA to predict the language it recognizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-white/30 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-white/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img
                        src={uploadedImage}
                        alt="Uploaded Automaton"
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {isLoading && (
                  <div className="flex items-center gap-2 text-white/80">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Please wait, we're not done yet...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {recognizedDfa && (
          <div className="space-y-8">
            {/* Analysis Stats */}
            {analysis && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg sm:text-xl flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Automaton Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-white/80">Total States:</span>
                      <p className="font-medium text-white">{analysis.totalStates}</p>
                    </div>
                    <div>
                      <span className="text-white/80">Final States:</span>
                      <p className="font-medium text-white">{analysis.acceptingStates}</p>
                    </div>
                    <div>
                      <span className="text-white/80">Alphabet Size:</span>
                      <p className="font-medium text-white">{analysis.alphabet.length}</p>
                    </div>
                    <div>
                      <span className="text-white/80">Predictions:</span>
                      <p className="font-medium text-white">{languagePredictions.length}</p>
                    </div>
                  </div>
                  {analysis.observations.length > 0 && (
                    <div>
                      <button
                        onClick={toggleObservations}
                        className="flex items-center gap-1 text-white/80 text-sm hover:text-white/90 transition-colors"
                      >
                        {observationsExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                        Key Observations ({analysis.observations.length})
                      </button>
                      {observationsExpanded && (
                        <ul className="mt-2 space-y-1 pl-4 border-l-2 border-white/20">
                          {analysis.observations.map((observation, index) => (
                            <li key={index} className="text-sm text-white/90 flex items-start gap-2">
                              <span className="text-white/60">•</span>
                              {observation}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recognized DFA */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Recognized Automaton
              </h2>
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
                          onClick={copyDiagram}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                        >
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline ml-1 sm:ml-2">Copy</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={exportDiagram}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                        >
                          <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline ml-1 sm:ml-2">Export</span>
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-white/80 text-sm">{recognizedDfa.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DFAVisualization 
                      ref={dfaRef}
                      dotCode={recognizedDfa.dotCode} 
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
                      states={recognizedDfa.states}
                      alphabet={recognizedDfa.alphabet}
                      transitions={recognizedDfa.transitions}
                      startState={recognizedDfa.startState}
                      acceptStates={recognizedDfa.acceptStates}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Language Predictions */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Predicted Languages
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {languagePredictions.map((prediction, index) => (
                  <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-base">{prediction.language}</CardTitle>
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-white/20 text-white border-white/20"
                        >
                          I'm {Math.round(prediction.confidence * 100)}% Sure
                        </Badge>
                      </div>
                      <CardDescription className="text-white/80 text-sm">
                        {prediction.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {prediction.pattern && (
                          <div>
                            <p className="text-xs text-white/60 font-medium">Regex:</p>
                            <p className="text-sm text-white/90 font-mono bg-white/10 px-2 py-1 rounded">
                              {prediction.pattern}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-white/60 font-medium">Examples:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {prediction.examples.map((example, i) => (
                              <Badge 
                                key={i} 
                                variant="outline" 
                                className="text-xs bg-white/10 border-white/20 text-white"
                              >
                                {example}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {prediction.reasoning && (
                          <div>
                            <button
                              onClick={() => toggleReasoning(index)}
                              className="flex items-center gap-1 text-xs text-white/60 font-medium hover:text-white/80 transition-colors"
                            >
                              {expandedReasoning.includes(index) ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                              Click to See Reasoning
                            </button>
                            {expandedReasoning.includes(index) && (
                              <p className="text-sm text-white/80 mt-1 pl-4 border-l-2 border-white/20">
                                {prediction.reasoning}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 