const RX_COMMA = /\s*,\s*/

export const splitCsv = <Result extends string[]>(str?: string): Result => (str?.split(RX_COMMA) ?? []) as Result
