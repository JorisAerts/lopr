export type UUID = `${string}-${string}-${string}-${string}-${string}` //'9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'

export interface Unique {
  /**
   * a UUID to link related request & response data together
   */
  uuid: UUID
}
