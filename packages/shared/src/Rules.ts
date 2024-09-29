import type { UrlMatch } from './url-match'


export enum ModificationType {
  UserAgent = 'User Agent',
  RewriteHeader = 'Rewrite Header',

  MapResponse = 'Map Response',
  MapRequest = 'Map Request',
}

export enum ModificationTarget {Request, Response}

export interface RequestMod {
  match: string
  request: true,
  type: ModificationType,
  target?: ModificationTarget
}

export interface Rule {
  name: string | undefined,
  disabled: boolean,
  filters?: UrlMatch[]
  mods: RequestMod[]
}

const defaultRule = () => ({
  name: '',
  disabled: false,
  mods: [],
})

export const createRule = (rule: Partial<Rule>) => ({
  ...defaultRule(),
  ...rule,
})
