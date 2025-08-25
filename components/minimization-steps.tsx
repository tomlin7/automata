import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface EquivalenceClass {
  id: string
  states: string[]
  representative: string
  isAccepting: boolean
}

interface MinimizationStep {
  step: number
  description: string
  equivalenceClasses: EquivalenceClass[]
  action: string
}

interface MinimizationStepsProps {
  steps: MinimizationStep[]
  equivalenceClasses: EquivalenceClass[]
}

export function MinimizationSteps({ steps, equivalenceClasses }: MinimizationStepsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>DFA Minimization Algorithm</CardTitle>
          <CardDescription>Step-by-step state reduction using equivalence classes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              {index < steps.length - 1 && <div className="absolute left-4 top-12 w-0.5 h-20 bg-border" />}
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0">
                  {step.step}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm font-medium">{step.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{step.action}</p>
                  </div>

                  {step.equivalenceClasses.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Equivalence classes at this step:</p>
                      <div className="space-y-2">
                        {step.equivalenceClasses.map((eqClass) => (
                          <div key={eqClass.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                            <Badge variant={eqClass.isAccepting ? "default" : "secondary"} className="text-xs">
                              {eqClass.id}
                            </Badge>
                            <div className="flex gap-1">
                              {eqClass.states.map((state) => (
                                <Badge
                                  key={state}
                                  variant="outline"
                                  className={`text-xs ${state === eqClass.representative ? "border-primary" : ""}`}
                                >
                                  {state}
                                  {state === eqClass.representative && "*"}
                                </Badge>
                              ))}
                            </div>
                            {eqClass.isAccepting && (
                              <Badge variant="secondary" className="text-xs ml-auto">
                                Final
                              </Badge>
                            )}
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

      <Card>
        <CardHeader>
          <CardTitle>Final Equivalence Classes</CardTitle>
          <CardDescription>States grouped by equivalence with representatives marked (*)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {equivalenceClasses.map((eqClass) => (
              <div key={eqClass.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Badge variant={eqClass.isAccepting ? "default" : "secondary"} className="text-sm">
                  {eqClass.id}
                </Badge>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex gap-2">
                  {eqClass.states.map((state) => (
                    <Badge
                      key={state}
                      variant="outline"
                      className={`text-sm ${state === eqClass.representative ? "border-primary bg-primary/10" : ""}`}
                    >
                      {state}
                      {state === eqClass.representative && " *"}
                    </Badge>
                  ))}
                </div>
                {eqClass.isAccepting && (
                  <Badge variant="secondary" className="text-sm ml-auto">
                    Final
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
