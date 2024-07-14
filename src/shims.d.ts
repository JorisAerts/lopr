export * from 'vue'

declare module 'vue' {
  namespace JSX {
    interface IntrinsicAttributes {
      [x: `on${Capitalize<string>}`]: any

      class?: any
      style?: any
    }
  }
}
