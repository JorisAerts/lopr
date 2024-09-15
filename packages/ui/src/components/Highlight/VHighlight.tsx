import './VHighlight.scss'
import type { Prop } from 'vue'
import { defineComponent } from 'vue'
import { escapeRegex } from '../../utils/escape'

export const VHighlight = defineComponent({
  name: 'v-highlight',

  props: {
    text: { type: String } as Prop<string | undefined>,
    highlight: { type: String } as Prop<string | undefined>,
  },

  setup(props) {
    return () => <span>{splitText(props.text, props.highlight)}</span>
  },
})

function splitText(value?: string, highlighted?: string) {
  if (!value?.length) return value
  const rx = highlighted?.length ? new RegExp(escapeRegex(highlighted), 'ig') : undefined
  return rx ? split(value, rx) : value
}

function split(text: string | undefined | null, regex: RegExp) {
  if (!regex || !text) return [text]
  const matches = text.matchAll(regex)
  let match = null
  let lastIndex = 0
  const result = []
  while (!(match = matches.next()).done) {
    const { value } = match
    if (lastIndex < value.index!) {
      // push parts in between
      result.push(text.substring(lastIndex, value.index))
    }
    lastIndex = value.index! + value[0].length
    result.push(<span class="v-highlighted-text">{value[0]}</span>)
  }
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex, text.length))
  }
  return result
}
