import { computed, defineComponent, Teleport } from 'vue'
import { APP_NAME } from 'lopr-shared'
import { DominoMask_Fill } from 'lopr-ui/icons'

export const VAppHeader = defineComponent({
  name: 'v-app-header',

  setup() {
    const iconSize = 512
    const iconColor = computed(() => 'white')
    const favicon = computed(() =>
      btoa(`<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="fill: ${iconColor.value}">
          <path d="${DominoMask_Fill}" />
        </svg>`)
    )

    return () => (
      <Teleport to={'head'}>
        <title>{APP_NAME}</title>
        <link rel="icon" href={`data:image/svg+xml;base64,${favicon.value}`} />
      </Teleport>
    )
  },
})
