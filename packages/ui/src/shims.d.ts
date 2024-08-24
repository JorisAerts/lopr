export * from 'vue'

declare module 'vue/jsx-runtime' {
  namespace JSX {
    interface IntrinsicAttributes {
      [x: `on${Capitalize<string>}`]: any

      class?: any
      style?: any
    }
  }
}
