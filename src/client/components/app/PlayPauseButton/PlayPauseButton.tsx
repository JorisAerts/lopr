import { computed, defineComponent } from 'vue'
import type { IconNames } from '../../core'
import { VBtn, VIcon, VTooltip } from '../../core'

export const PlayPauseButton = defineComponent({
  name: 'PlayPauseButton',

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:recording': (value: boolean) => true,
  },

  props: {
    recording: { type: Boolean, default: false },
    size: { type: Number, default: 20 },
  },

  setup(props, { emit }) {
    const icon = computed<IconNames>(() => (props.recording ? 'Pause_Fill' : 'PlayArrow_Fill'))
    return () => (
      <VTooltip text={props.recording ? 'Pause recording' : 'Start recording'}>
        <VBtn icon={icon.value} size={props.size} class={['pa-1']} transparent onClick={() => emit('update:recording', !props.recording)}>
          {{
            icon: () => (
              <VIcon
                class={[{ 'btn--prepend-icon': false }]}
                name={icon.value}
                color={`rgb(var(--text-color))`}
                size={props.size * 0.75}
                style={{
                  border: '1px solid rgb(var(--text-color))',
                  'border-radius': '50%',
                }}
              ></VIcon>
            ),
          }}
        </VBtn>
      </VTooltip>
    )
  },
})
