import { defineComponent } from 'vue'

export const VDownloadData = defineComponent({
  name: 'v-nav-bar',

  props: {
    type: { type: String, default: 'text/plain' },
    charset: { type: String, default: 'utf-8' },
    data: { type: String, required: true },
    filename: { type: String, default: 'download' },

    tooltip: { type: String, default: '' },
  },

  setup(props, { slots }) {
    return () => (
      <a
        href={`data:${props.type};charset=${props.charset},${encodeURIComponent(props.data)}`}
        download={props.filename}
        title={props.tooltip}
      >
        {slots.default?.()}
      </a>
    )
  },
})
