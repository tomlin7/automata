"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, Plus, Mic, Volume2 } from "lucide-react"

interface ChatInterfaceProps {
  onSubmit: (prompt: string) => Promise<void>
  isLoading: boolean
  examples: string[]
  placeholder?: string
  hasResponse?: boolean
  children?: React.ReactNode
}

export function ChatInterface({
  onSubmit,
  isLoading,
  examples,
  placeholder = "Ask anything...",
  hasResponse = false,
  children
}: ChatInterfaceProps) {
  const [prompt, setPrompt] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return
    await onSubmit(prompt.trim())
    setPrompt("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleExampleClick = (example: string) => {
    setPrompt(example)
    textareaRef.current?.focus()
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [prompt])

  return (
    <div className="flex flex-col h-full">
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Chat interface at bottom */}
      <div className="border-t border-none backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          {/* Examples - shown when no response */}
          {!hasResponse && examples.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-sm text-white/60 text-center">Try these examples:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prompt bar */}
          <div className="relative">
            <div className="flex items-end gap-2 bg-white/10 border border-white/20 rounded-xl p-2 backdrop-blur-sm">
              {/* <button className="p-2 text-white/60 hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
              </button> */}
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1 min-h-[20px] max-h-[120px] resize-none bg-transparent border-0 text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
              <div className="flex items-center gap-1">
                {/* <button className="p-2 text-white/60 hover:text-white transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
                <button className="p-2 text-white/60 hover:text-white transition-colors">
                  <Volume2 className="w-4 h-4" />
                </button> */}
                <Button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || isLoading}
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 