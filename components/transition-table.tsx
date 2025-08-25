interface TransitionTableProps {
  states: string[]
  alphabet: string[]
  transitions: Record<string, Record<string, string>>
  startState: string
  acceptStates: string[]
}

export function TransitionTable({ states, alphabet, transitions, startState, acceptStates }: TransitionTableProps) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden border border-border rounded-lg">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-3 text-left text-xs sm:text-sm font-medium text-foreground uppercase tracking-wider">
                  State
                </th>
                {alphabet.map((symbol) => (
                  <th key={symbol} className="px-3 py-3 text-center text-xs sm:text-sm font-medium text-foreground uppercase tracking-wider">
                    {symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {states.map((state) => (
                <tr key={state} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-3 text-sm sm:text-base font-medium text-foreground">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <div className="flex flex-wrap gap-1">
                        {state === startState && (
                          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">START</span>
                        )}
                        {acceptStates.includes(state) && (
                          <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">ACCEPT</span>
                        )}
                      </div>
                      <span className="truncate">{state}</span>
                    </div>
                  </td>
                  {alphabet.map((symbol) => (
                    <td key={symbol} className="px-3 py-3 text-center text-sm sm:text-base text-foreground">
                      {transitions[state]?.[symbol] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
