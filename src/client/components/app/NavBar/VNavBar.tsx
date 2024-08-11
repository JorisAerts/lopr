import { defineComponent, ref } from 'vue'
import { VBadge, VBtn, VCard, VIcon, VSpacer, VTooltip } from '../../core'
import { APP_NAME } from '../../../../shared/constants'
import './VNavBar.scss'
import { useErrorLogStore } from '../../../stores/errorlog'
import { useRouter } from 'vue-router'
import { RouteNames } from '../../../router/RouteNames'
import { RecordButton } from '../RecordButton/RecordButton'

export const VNavBar = defineComponent({
  name: 'v-nav-bar',

  setup() {
    const iconSize = 20
    const errorLogStore = useErrorLogStore()
    const router = useRouter()

    const recording = ref(true)

    return () => (
      <VCard class={['v-nav-bar', 'pa-2', 'd-flex', 'gap-2', 'align-items-center']}>
        <h4 class={['d-flex', 'align-center']}>
          <VIcon name={'DeployedCode_Fill'} size={iconSize} class={['mr-1']} />
          {APP_NAME}
        </h4>
        <RecordButton class={'ml-2'} v-model:recording={recording.value} />
        <VSpacer />
        <VTooltip text={'Requests'}>
          <VBtn icon={'Monitoring'} size={iconSize} class={['pa-1']} transparent onClick={() => router.push(RouteNames.Sequence)} />
        </VTooltip>
        <VTooltip text={'Information'}>
          <VBtn icon={'Info'} size={iconSize} class={['pa-1']} transparent onClick={() => router.push(RouteNames.Information)} />
        </VTooltip>
        <VTooltip text={'Preferences'}>
          <VBtn icon={'Settings'} size={iconSize} class={['pa-1']} transparent onClick={() => router.push(RouteNames.Preferences)} />
        </VTooltip>
        <VTooltip text={'Error log'}>
          <VBadge modelValue={errorLogStore.hasErrors} position={[4, -4]}>
            <VBtn icon={'Warning'} size={iconSize} class={['pa-1']} transparent onClick={() => router.push(RouteNames.ErrorLog)} />
          </VBadge>
        </VTooltip>
      </VCard>
    )
  },
})
