import type { ComponentInstance, VNode } from 'vue'
import { defineComponent } from 'vue'
import { VBadge, VBtn, VCard, VDialog, type VDialogActivatorProps, type VDialogDefaultProps, VIcon, VSpacer, VTooltip } from 'lopr-ui/components'
import { APP_NAME } from 'lopr-shared'
import { useErrorLogStore } from '../../stores/errorlog'
import { RouterView, useRouter } from 'vue-router'
import { RouteNames } from '../../router/RouteNames'
import { AppPreferences } from '../AppPreferences'
import { useCache } from '../../stores/cache'
import { VAbout } from '../About'

export const VNavBar = defineComponent({
  name: 'v-nav-bar',

  setup() {
    const cache = useCache()
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
        <h4 class={['d-flex', 'align-items-center', 'ma-0']}>
          <VDialog clickOutsideToClose>
            {{
              activator: ({ props }: VDialogActivatorProps) => (
                <a href={'javascript:void(0)'} class={'hidden-link'} {...props}>
                  <VIcon name={'DominoMask_Fill'} size={iconSize} class={['mr-1']} />
                  {APP_NAME}
                </a>
              ),
              default: ({ close }: VDialogDefaultProps) => <VAbout onClose={close} />,
            }}
          </VDialog>
        </h4>
        <RouterView name="controls" class={'ml-4'}>
          {{
            default: ({ Component }: { Component: VNode & ComponentInstance<any> }) => Component && <Component />,
          }}
        </RouterView>
        <VSpacer />
        <VBtn
          tooltip={'Requests'}
          icon={'Home_Fill'}
          size={iconSize}
          class={['pa-1']}
          transparent
          onClick={() => pushRoute(cache.current ? RouteNames.RequestDetails : RouteNames.Requests, { uuid: cache.current as string })()}
        />
        <VBtn tooltip={'Information'} icon={'Info'} size={iconSize} class={['pa-1']} transparent onClick={pushRoute(RouteNames.Information)} />
        <VDialog clickOutsideToClose>
          {{
            activator: ({ props }: VDialogActivatorProps) => <VBtn tooltip={'Preferences'} icon={'Settings_Fill'} size={iconSize} class={['pa-1']} transparent {...props} />,
            default: () => <AppPreferences />,
          }}
        </VDialog>
        <VTooltip text={'Error log'}>
          <VBadge modelValue={errorLogStore.hasErrors} dot position={[4, -4]}>
            <VBtn icon={'Warning'} size={iconSize} class={['pa-1']} transparent onClick={pushRoute(RouteNames.ErrorLog)} />
          </VBadge>
        </VTooltip>
      </VCard>
    )
  },
})
