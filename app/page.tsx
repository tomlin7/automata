"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Github, Plus, Cpu, GitBranch, Shuffle, Minimize2, Languages } from "lucide-react"

export default function HomePage() {
  const handleCardClick = (href: string) => {
    window.location.href = href;
  };

  const handleExternalClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F8F5EF" }}>
      {/* Tools Grid */}
      <section className="flex-1 flex items-center justify-center py-8 sm:py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr">
            
            {/* NFA → DFA */}
            <Card 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 relative overflow-hidden cursor-pointer h-48 sm:h-auto"
              style={{ backgroundColor: "#D96B6B" }}
              onClick={() => handleCardClick("/tools/nfa-to-dfa")}
            >
              <div className="absolute top-3 right-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Shuffle className="w-4 h-4 text-white" />
                </div>
              </div>
              <CardHeader className="pb-4 pt-12">
                <CardTitle className="text-lg sm:text-xl text-white text-center font-bold">
                  NFA → DFA
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                <div className="absolute bottom-3 right-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FA Minimization */}
            <Card 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 relative overflow-hidden cursor-pointer h-48 sm:h-auto"
              style={{ backgroundColor: "#50A080" }}
              onClick={() => handleCardClick("/tools/fa-minimization")}
            >
              <div className="absolute top-3 right-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Minimize2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <CardHeader className="pb-4 pt-12">
                <CardTitle className="text-lg sm:text-xl text-white text-center font-bold">
                  Minimizer
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                <div className="absolute bottom-3 right-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prompt → DFA */}
            <Card 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 relative overflow-hidden cursor-pointer h-48 sm:h-auto sm:col-span-2 lg:col-span-2 lg:row-span-2"
              style={{ backgroundColor: "#E68A4E" }}
              onClick={() => handleCardClick("/tools/prompt-to-dfa")}
            >
              <div className="absolute top-3 right-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
              </div>
              <CardHeader className="pb-4 pt-12">
                <CardTitle className="text-lg sm:text-xl lg:text-6xl text-white text-center font-bold">
                  DFA
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                <div className="absolute bottom-3 right-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prompt → NFA */}
            <Card 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 relative overflow-hidden cursor-pointer h-48 sm:h-auto sm:col-span-2 lg:col-span-2 lg:row-span-2"
              style={{ backgroundColor: "#E066B0" }}
              onClick={() => handleCardClick("/tools/prompt-to-nfa")}
            >
              <div className="absolute top-3 right-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-white" />
                </div>
              </div>
              <CardHeader className="pb-4 pt-12">
                <CardTitle className="text-lg sm:text-xl lg:text-6xl text-white text-center font-bold">
                  NFA
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                <div className="absolute bottom-3 right-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Language Predictor */}
            <Card 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 relative overflow-hidden cursor-pointer h-48 sm:h-auto"
              style={{ backgroundColor: "#5C85D6" }}
              onClick={() => handleCardClick("/tools/language-predictor")}
            >
              <div className="absolute top-3 right-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Languages className="w-4 h-4 text-white" />
                </div>
              </div>
              <CardHeader className="pb-4 pt-12">
                <CardTitle className="text-lg sm:text-xl text-white text-center font-bold">
                  Language Predictor
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                <div className="absolute bottom-3 right-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Request Feature */}
            <Card 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 relative overflow-hidden cursor-pointer h-48 sm:h-auto"
              style={{ backgroundColor: "#9C6AD6" }}
              onClick={() => handleExternalClick("https://github.com/tomlin7/automata/issues/new")}
            >
              <div className="absolute top-3 right-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              <CardHeader className="pb-4 pt-12">
                <CardTitle className="text-lg sm:text-xl text-white text-center font-bold">
                  Request Feature
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                <div className="absolute bottom-3 right-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-300 bg-white/50 py-6 sm:py-8 px-4 mt-auto">
        <div className="container mx-auto text-center">
          <p className="text-gray-600 text-sm">
            Built for computer science education and research.
            <span className="text-gray-800 font-medium"> Open source and accessible.</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
