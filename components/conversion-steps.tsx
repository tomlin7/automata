import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

interface ConversionStep {
  step: number
  description: string
  newStates?: string[]
  stateMapping?: Record<string, string[]>
}

interface ConversionStepsProps {
  steps: ConversionStep[]
}

export function ConversionSteps({ steps }: ConversionStepsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subset Construction Algorithm</CardTitle>
        <CardDescription>Step-by-step conversion from NFA to DFA</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.step} className="relative">
            {index < steps.length - 1 && <div className="absolute left-4 top-12 w-0.5 h-16 bg-border" />}
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0">
                {step.step}
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm font-medium">{step.description}</p>

                {step.newStates && step.newStates.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">New DFA states created:</p>
                    <div className="flex flex-wrap gap-2">
                      {step.newStates.map((state) => (
                        <Badge key={state} variant="secondary" className="text-xs">
                          {state}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {step.stateMapping && Object.keys(step.stateMapping).length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">State mappings:</p>
                    <div className="space-y-2">
                      {Object.entries(step.stateMapping).map(([dfaState, nfaStates]) => (
                        <div key={dfaState} className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="text-xs">
                            {dfaState}
                          </Badge>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <div className="flex gap-1">
                            {nfaStates.map((nfaState) => (
                              <Badge key={nfaState} variant="secondary" className="text-xs">
                                {nfaState}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
