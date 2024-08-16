import { VTooltip } from './VTooltip'
import type { ExtractPropTypes, PropType, Slots, VNode } from 'vue'

export const makeTooltipProps = () => ({
  tooltip: { type: String as PropType<string> },
})

type TooltipProps = ExtractPropTypes<ReturnType<typeof makeTooltipProps>>

export const useTooltip = (props: TooltipProps, slots?: Slots) => {
  const wrapWithTooltip = (contents: VNode | VNode[], classes?: any, style?: any) =>
    slots?.tooltip ? (
      <VTooltip style={style} class={classes}>
        {{
          tooltip: slots.tooltip,
          default: () => contents,
        }}
      </VTooltip>
    ) : props.tooltip ? (
      <VTooltip text={props.tooltip}>{contents}</VTooltip>
    ) : (
      contents
    )

  return { wrapWithTooltip }
}
