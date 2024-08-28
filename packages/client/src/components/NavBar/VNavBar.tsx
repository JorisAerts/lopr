import type { ComponentInstance, VNode } from 'vue'
import { defineComponent } from 'vue'
import { VBadge, VBtn, VCard, VDialog, type VDialogActivatorProps, VIcon, VSpacer, VTooltip } from 'js-proxy-ui/components'
import { APP_NAME } from 'js-proxy-shared'
import { useErrorLogStore } from '../../stores/errorlog'
import { RouterView, useRouter } from 'vue-router'
import { RouteNames } from '../../router/RouteNames'
import { AppPreferences } from '../AppPreferences'

export const VNavBar = defineComponent({
  name: 'v-nav-bar',

  setup() {
    const iconSize = 20
    const errorLogStore = useErrorLogStore()
    const router = useRouter()
    const pushRoute = (name: RouteNames) => () => {
      try {
        return router.push({ name })
      } catch (error) {
        console.warn(error)
      }
    }
    return () => (
      <VCard class={['v-nav-bar', 'pa-2', 'd-flex', 'gap-2', 'align-items-center']}>
        <h4 class={['d-flex', 'align-items-center']}>
          <VIcon name={'DeployedCode_Fill'} size={iconSize} class={['mr-1']} />
          {APP_NAME}
        </h4>
        <RouterView name="controls" class={'ml-4'}>
          {{
            default: ({ Component }: { Component: VNode & ComponentInstance<any> }) => Component && <Component />,
          }}
        </RouterView>
        <VSpacer />
        <VBtn tooltip={'Requests'} icon={'Monitoring'} size={iconSize} class={['pa-1']} transparent onClick={pushRoute(RouteNames.Requests)} />
        <VBtn tooltip={'Information'} icon={'Info'} size={iconSize} class={['pa-1']} transparent onClick={pushRoute(RouteNames.Information)} />
        <VDialog clickOutsideToClose>
          {{
            activator: ({ props }: VDialogActivatorProps) => <VBtn tooltip={'Preferences'} icon={'Settings'} size={iconSize} class={['pa-1']} transparent {...props} />,
            default: () => <AppPreferences />,
          }}
        </VDialog>
        <VTooltip text={'Error log'}>
          <VBadge modelValue={errorLogStore.hasErrors} position={[4, -4]}>
            <VBtn icon={'Warning'} size={iconSize} class={['pa-1']} transparent onClick={pushRoute(RouteNames.ErrorLog)} />
          </VBadge>
        </VTooltip>
      </VCard>
    )
  },
})
