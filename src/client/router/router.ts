import { createRouter, createWebHashHistory } from 'vue-router'
import { RouteNames } from './RouteNames'

const views = () => import('../views')

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: RouteNames.Home,
      path: '/',
      redirect: RouteNames.Requests,
    },

    {
      name: RouteNames.Requests,
      path: '/requests',
      components: {
        default: () => views().then((c) => c.Request),
        controls: () => views().then((c) => c.RequestControlsToolbar),
      },
    },

    {
      name: RouteNames.Information,
      path: '/info',
      components: {
        default: () => views().then((c) => c.Information),
      },
    },
    {
      name: RouteNames.Preferences,
      path: '/preferences',
      components: {
        default: () => views().then((c) => c.Preferences),
      },
    },

    {
      name: RouteNames.ErrorLog,
      path: '/error-log',
      components: {
        default: () => views().then((c) => c.ErrorLog),
        controls: () => views().then((c) => c.ErrorLogControlsToolbar),
      },
    },

    {
      name: RouteNames.Error404,
      path: '/:pathMatch(.*)*',
      components: {
        default: () => views().then((c) => c.Error404),
      },
    },
  ],
})
