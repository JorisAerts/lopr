import type { PropType } from 'vue'
import { defineComponent } from 'vue'

export const DownloadDataView = defineComponent({
  name: 'DownloadDataView',

  props: {
    data: { type: [String, Object, Buffer] as PropType<any | undefined> },
    mimeType: { type: String },
    filename: { type: String },
  },

  // TODO
  setup(props) {
    return () => (
      <>
        <a>{props.mimeType}</a>
      </>
    )
  },
})
