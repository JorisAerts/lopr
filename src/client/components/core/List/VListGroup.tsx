import { defineComponent } from 'vue'
import { VListItem } from './VListItem'
import './VList.scss'

export const VListGroup = defineComponent({
  name: 'v-list-group',

  setup(props, { attrs, slots }) {
    const onClick = () => {}

    return () => (
      <div class={'v-list-group'} {...attrs}>
        <div class={'v-list-group--activator'}>
          {slots.activator?.({ onClick }) ?? (
            <VListItem onClick={onClick}>&nbsp;</VListItem>
          )}
        </div>
        <div class={'v-list-group--items'}>{slots.default?.()}</div>
      </div>
    )
  },
})
