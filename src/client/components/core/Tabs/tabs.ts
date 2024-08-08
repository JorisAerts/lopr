import type { ExtractPropTypes, PropType, Ref } from 'vue'
import { computed, getCurrentInstance, inject, onUnmounted, provide, ref, watch } from 'vue'

export const TAB_SYMBOL = Symbol()

interface TabData<Type> {
  modelValue: Ref<Type | undefined>
}

export const makeModelValueProps = <Type = any>() => ({
  modelValue: { type: [String, Number, Object] as PropType<Type>, default: undefined },
})

export const makeTabsProps = <Type = any>() => ({
  ...makeModelValueProps<Type>(),
})

export const makeTabItemsProps = <Type = any>() => ({
  ...makeTabsProps<Type>(),
})

export const makeTabItemProps = <Type = any>() => ({
  ...makeTabsProps<Type>(),
})

type TabsProps<Type = unknown> = ExtractPropTypes<ReturnType<typeof makeTabsProps<Type>>>

export const makeTabProps = <Type = any>() => ({
  ...makeModelValueProps<Type>(),
})

type TabProps<Type = unknown> = ExtractPropTypes<ReturnType<typeof makeTabProps<Type>>>

/**
 * Define tabs, to that the underlying tab-elements can be managed
 */
export const defineTabs = <Type>(props: TabsProps<Type>, autoEmit = true) => {
  const modelValue = ref(props.modelValue) as Ref<Type | undefined>
  watch(props, (newVal) => (modelValue.value = newVal.modelValue as Type))

  const data: TabData<Type> = { modelValue }
  provide(TAB_SYMBOL, data)
  const instance = getCurrentInstance()
  if (instance) {
    // watch and emit
    const emit = instance.emit
    // remove the watch on unmount
    onUnmounted(
      // watch modelValue for changes
      watch(modelValue, (newValue) => {
        if (autoEmit) emit('update:modelValue', newValue)
        instance.update()
      })
    )
  }
  return { modelValue }
}

/**
 * Used on a single tab, to update the tab's state.
 * (Kind of illegal, alternating parent state)
 */
export const useTabs = <Type>(props: TabProps<Type>) => {
  const data: TabData<Type> = inject(TAB_SYMBOL) as TabData<Type>
  if (!data) throw Error('using useTabs outside of a tab-context caused problems.')
  const on = {
    onClick: (event: MouseEvent) => {
      event.preventDefault()
      data.modelValue.value = props.modelValue as Type
    },
  }
  const classes: Ref<string[]> = computed(() => (data.modelValue.value === props.modelValue ? ['v-tab--selected'] : []))
  return {
    classes,
    on,
  }
}
