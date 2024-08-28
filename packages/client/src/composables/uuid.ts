import type { UUID } from 'js-proxy-shared'
import type { ExtractPropTypes, PropType, Ref } from 'vue'
import { toRef } from 'vue'

const UUID_PROP = 'modelValue'

export const makeUUIDProps = () => ({
  [UUID_PROP]: { type: String as PropType<UUID>, default: undefined },
})

export type UUIDModelProps = ExtractPropTypes<ReturnType<typeof makeUUIDProps>>

export const makeUUIDEvents = () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [`update:${UUID_PROP}`]: (_: UUID) => true,
})

export const useUUID = (props: UUIDModelProps): Ref<UUID | undefined> => toRef(props, UUID_PROP)
