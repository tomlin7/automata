"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { Download, Maximize2 } from "lucide-react"
import * as d3 from "d3"
import { graphviz } from "d3-graphviz"

interface AutomatonVisualizationProps {
  dotCode: string
  type?: "nfa" | "dfa"
  showControls?: boolean
}

export interface AutomatonVisualizationRef {
  exportPNG: () => void
  copyPNG: () => void
  exportSVG: () => void
}

export const AutomatonVisualization = forwardRef<AutomatonVisualizationRef, AutomatonVisualizationProps>(
  ({ dotCode, type = "nfa", showControls = true }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [svgContent, setSvgContent] = useState<string>("")

    useEffect(() => {
      if (!containerRef.current || !dotCode) return

      setIsLoading(true)
      setError(null)

      try {
        // Clear the container
        d3.select(containerRef.current).selectAll("*").remove()

        // Use d3-graphviz to render the DOT code
        const g = graphviz(containerRef.current)
          .width(800)
          .height(400)
          .fit(true)
          .zoom(true)

        g.renderDot(dotCode, () => {
          setIsLoading(false)
          
          // Get the rendered SVG content for export
          const svgElement = containerRef.current?.querySelector("svg")
          if (svgElement) {
            setSvgContent(svgElement.outerHTML)
          }
        })

      } catch (error) {
        console.error("Error rendering diagram:", error)
        setError("Failed to render diagram")
        setIsLoading(false)
        
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-8 text-center text-muted-foreground border border-destructive/20 rounded-lg bg-destructive/5">
              <p class="font-medium text-destructive mb-2">Error rendering diagram</p>
              <p class="text-sm mb-4">Please check the DOT syntax</p>
              <details class="text-left">
                <summary class="cursor-pointer text-xs font-medium mb-2">Show DOT code</summary>
                <pre class="text-xs bg-muted p-3 rounded border overflow-auto">${dotCode}</pre>
              </details>
            </div>
          `
        }
      }
    }, [dotCode])

    const convertSVGToPNG = async (): Promise<Blob | null> => {
      const svgElement = containerRef.current?.querySelector("svg")
      if (!svgElement) return null

      // Create a canvas element
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return null

      // Get the actual SVG dimensions and viewBox
      const svgRect = svgElement.getBoundingClientRect()
      const svgWidth = svgElement.width?.baseVal?.value || svgRect.width
      const svgHeight = svgElement.height?.baseVal?.value || svgRect.height
      
      // Get viewBox if it exists, otherwise use dimensions
      const viewBox = svgElement.viewBox?.baseVal
      const vbWidth = viewBox ? viewBox.width : svgWidth
      const vbHeight = viewBox ? viewBox.height : svgHeight

      // Set canvas size with higher resolution
      const scale = 2
      canvas.width = vbWidth * scale
      canvas.height = vbHeight * scale

      // Create a new SVG with proper viewBox for export
      const svgClone = svgElement.cloneNode(true) as SVGElement
      svgClone.setAttribute("width", vbWidth.toString())
      svgClone.setAttribute("height", vbHeight.toString())
      svgClone.setAttribute("viewBox", `0 0 ${vbWidth} ${vbHeight}`)
      
      // Remove any transform attributes that might interfere
      svgClone.removeAttribute("transform")
      
      // Create an image from SVG
      const svgData = new XMLSerializer().serializeToString(svgClone)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const url = URL.createObjectURL(svgBlob)

      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          // Scale the image for higher resolution
          ctx.scale(scale, scale)
          ctx.drawImage(img, 0, 0, vbWidth, vbHeight)
          
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(url)
            resolve(blob)
          }, "image/png")
        }
        img.src = url
      })
    }

    const exportPNG = async () => {
      const pngBlob = await convertSVGToPNG()
      if (!pngBlob) return

      const url = URL.createObjectURL(pngBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${type}-diagram.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    const copyPNG = async () => {
      const pngBlob = await convertSVGToPNG()
      if (!pngBlob) return

      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": pngBlob
          })
        ])
      } catch (error) {
        console.error("Failed to copy image:", error)
        // Fallback: download the image
        exportPNG()
      }
    }

    const exportSVG = () => {
      if (!svgContent) return

      const blob = new Blob([svgContent], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${type}-diagram.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    const handleFullscreen = () => {
      if (containerRef.current) {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          containerRef.current.requestFullscreen()
        }
      }
    }

    // Expose functions to parent component
    useImperativeHandle(ref, () => ({
      exportPNG,
      copyPNG,
      exportSVG
    }))

    return (
      <div className="relative">
        {showControls && (
          <div className="absolute top-2 right-2 z-10 flex gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportPNG}
              disabled={!svgContent || isLoading}
              className="bg-background/80 backdrop-blur-sm h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline ml-1 sm:ml-2">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreen}
              disabled={isLoading}
              className="bg-background/80 backdrop-blur-sm h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
            >
              <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline ml-1 sm:ml-2">Fullscreen</span>
            </Button>
          </div>
        )}

        <div className="w-full overflow-auto rounded-lg border border-border bg-card/30">
          {isLoading && (
            <div className="flex justify-center items-center min-h-48 sm:min-h-64">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Rendering diagram...</span>
              </div>
            </div>
          )}

          <div
            ref={containerRef}
            className={`flex justify-center items-center min-h-48 sm:min-h-64 p-2 sm:p-4 ${isLoading ? "hidden" : ""}`}
          />
        </div>
      </div>
    )
  }
)

AutomatonVisualization.displayName = "AutomatonVisualization" 