export * from 'vue'

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      [x: `on${Capitalize<string>}`]: any

      class?: any
      style?: any
    }
  }
}
