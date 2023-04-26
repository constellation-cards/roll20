interface Roll20Event {
  sourceAttribute?: string
  htmlAttributes: Record<string, any>
  sourceType?: 'player' | 'sheetworker'
  previousValue?: string
  newValue?: string
  removedInfo?: any
  triggerName?: string
}

type AttributeBundle = Record<string, string>

type Roll20EventCallback = (event: Roll20Event) => void

type GetAttrsCallback = (values: AttributeBundle) => void

interface StartRollCallbackValuesRoll {
  result: number
  dice: number[]
  expression: string
  rolls: any[]
  message: any
}

interface StartRollCallbackValuesResults {
  roll: StartRollCallbackValuesRoll
}

interface StartRollCallbackValues {
  rollId: string
  results: StartRollCallbackValuesResults
}

declare function on(trigger: string, callback: Roll20EventCallback): void

declare function getAttrs(
  attributes: string[],
  callback: GetAttrsCallback
): void

declare function setAttrs(
  attributes: AttributeBundle,
  options?: any,
  callback?: () => void
)

declare function startRoll(
  rollSyntax: string,
  callback: (outcome: StartRollCallbackValues) => void
)

declare function finishRoll(
  rollId: string,
  computedValues: Record<string, string>
)

declare function getSectionIDs(
  section: string,
  callback: (idarray: string[]) => void
)

declare function generateRowID(): string

declare function removeRepeatingRow(row: string): void
