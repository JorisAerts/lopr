import type { DefineComponent, ExtractPropTypes, PropType } from 'vue'

export interface StoryProps<Types extends {}> {

  component: DefineComponent<ExtractPropTypes<{
    [K in keyof Types]: PropType<Types[K]>
  }>>

}
