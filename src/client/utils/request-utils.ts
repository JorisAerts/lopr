import type { Prettify } from '../../shared/Prettify'

type ParsedHeaders<T extends string[]> = T extends [infer K, infer V, ...infer Rest] //
  ? Rest extends string[]
    ? Prettify<{ [P in K extends string ? K : never]: V } & ParsedHeaders<Rest>>
    : Prettify<{ [P in K extends string ? K : never]: V }>
  : {}

export const parseHeaders = <Headers extends string[], Result extends ParsedHeaders<Headers>>(headers: Headers = [] as unknown as Headers): Result => {
  const result = {} as Record<string, unknown>
  headers.forEach((h, i) => {
    if (i % 2 === 0) {
      result[h] = headers[i]
    }
  })
  return result as Result
}
