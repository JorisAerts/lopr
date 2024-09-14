import type { PropType } from 'vue'
import { computed, defineComponent } from 'vue'
import { TEXT_PLAIN } from 'lopr-shared/mime-types'

export const VDownloadData = defineComponent({
  name: 'v-download-data',

  props: {
    type: { type: String as PropType<string | undefined>, default: TEXT_PLAIN },
    charset: { type: String, default: 'utf-8' },
    data: { type: String as PropType<string | undefined> },
    filename: { type: String, default: 'download' },
    //
    tooltip: { type: String, default: '' },
  },

  setup(props, { slots }) {
    const data = computed(() => {
      if (!props.data) return 'javascript:void(0)'
      const arr = [] as string[]
      if (props.type) arr.push(props.type)
      if (props.charset) arr.push(`charset=${props.charset}`)
      const meta = arr.length ? `${arr.join(';')},` : ''
      return `data:${meta}${encodeURIComponent(props.data)}`
    })
    return () => (
      <a href={data.value} download={props.filename} title={props.tooltip}>
        {slots.default?.()}
      </a>
    )
  },
})
