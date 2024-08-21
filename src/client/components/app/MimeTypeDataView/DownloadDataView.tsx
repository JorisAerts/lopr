import { defineComponent } from 'vue'
import { makeFilenameProps, makeMimeTypeProps } from './mime-type'

export const DownloadDataView = defineComponent({
  name: 'DownloadDataView',

  props: {
    ...makeMimeTypeProps(),
    ...makeFilenameProps(),
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
