import { computed } from 'vue'
import { useSystemDarkMode } from 'lopr-ui'
import { DominoMask_Fill } from 'lopr-ui/icons'

const { isDark } = useSystemDarkMode()
const iconSize = 512
const iconColor = computed(() => (isDark.value ? 'white' : 'black'))

export const favicon = computed(() =>
  btoa(`<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="fill: ${iconColor.value}">
          <path d="${DominoMask_Fill}" />
        </svg>`)
)
