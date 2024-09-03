import type { ComponentInstance, VNode } from 'vue'
import { defineComponent } from 'vue'
import { VBadge, VBtn, VCard, VDialog, type VDialogActivatorProps, VIcon, VSpacer, VTooltip } from 'lopr-ui/components'
import { APP_NAME } from 'lopr-shared'
import { useErrorLogStore } from '../../stores/errorlog'
import { RouterView, useRouter } from 'vue-router'
import { RouteNames } from '../../router/RouteNames'
import { AppPreferences } from '../AppPreferences'
import { useRequestStore } from '../../stores/request'

export const VNavBar = defineComponent({
  name: 'v-nav-bar',

  setup() {
    const requestStore = useRequestStore()
    const errorLogStore = useErrorLogStore()
    const iconSize = 20
    const router = useRouter()
    const pushRoute = (name: RouteNames, params?: Record<string, string>) => () => {
      try {
        return router.push({ name, params })
      } catch (error) {
        console.warn(error)
      }
    }
    return () => (
      <VCard flat class={['v-nav-bar', 'pa-2', 'd-flex', 'gap-2', 'align-items-center']}>
        <h4 class={['d-flex', 'align-items-center']}>
          <a href={'https://github.com/JorisAerts/lopr'} class={'hidden-link'}>
            <VIcon name={'DominoMask_Fill'} size={iconSize} class={['mr-1']} />
            {APP_NAME}
          </a>
        </h4>
        <RouterView name="controls" class={'ml-4'}>
          {{
            default: ({ Component }: { Component: VNode & ComponentInstance<any> }) => Component && <Component />,
          }}
        </RouterView>
        <VSpacer />
        <VBtn
          tooltip={'Requests'}
          icon={'Monitoring'}
          size={iconSize}
          class={['pa-1']}
          transparent
          onClick={() => pushRoute(requestStore.current ? RouteNames.RequestDetails : RouteNames.Requests, { uuid: requestStore.current as string })()}
        />
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
