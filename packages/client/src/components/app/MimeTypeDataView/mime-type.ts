import type { PropType } from 'vue'

export const makeMimeTypeProps = () => ({
  data: { type: [String, Object, Buffer] as PropType<unknown | undefined> },
  mimeType: { type: String },
})

export const makeFilenameProps = () => ({
  data: { type: [String, Object, Buffer] as PropType<unknown | undefined> },
  filename: { type: String },
})
