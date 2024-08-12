import { defineComponent } from 'vue'
import { VBadge, VBtn, VCard, VIcon, VSpacer, VTooltip } from '../../core'
import { APP_NAME } from '../../../../shared/constants'
import './VNavBar.scss'
import { useErrorLogStore } from '../../../stores/errorlog'
import { useRouter } from 'vue-router'
import { RouteNames } from '../../../router/RouteNames'
import { AppControlsToolbar } from './AppControlsToolbar'

export const VNavBar = defineComponent({
  name: 'v-nav-bar',

  setup() {
    const iconSize = 20
    const errorLogStore = useErrorLogStore()
    const router = useRouter()
    return () => (
      <VCard class={['v-nav-bar', 'pa-2', 'd-flex', 'gap-2', 'align-items-center']}>
        <h4 class={['d-flex', 'align-center']}>
          <VIcon name={'DeployedCode_Fill'} size={iconSize} class={['mr-1']} />
          {APP_NAME}
        </h4>
        <AppControlsToolbar class={'ml-4'} />
        <VSpacer />
        <VBtn tooltip={'Requests'} icon={'Monitoring'} size={iconSize} class={['pa-1']} transparent onClick={() => router.push(RouteNames.Sequence)} />
        <VBtn tooltip={'Information'} icon={'Info'} size={iconSize} class={['pa-1']} transparent onClick={() => router.push(RouteNames.Information)} />
        <VBtn tooltip={'Preferences'} icon={'Settings'} size={iconSize} class={['pa-1']} transparent onClick={() => router.push(RouteNames.Preferences)} />
        <VTooltip text={'Error log'}>
          <VBadge modelValue={errorLogStore.hasErrors} position={[4, -4]}>
            <VBtn icon={'Warning'} size={iconSize} class={['pa-1']} transparent onClick={() => router.push(RouteNames.ErrorLog)} />
          </VBadge>
        </VTooltip>
      </VCard>
    )
  },
})
