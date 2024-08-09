import { createRouter, createWebHashHistory } from 'vue-router'
import { RouteNames } from './RouteNames'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: RouteNames.Home,
      path: '/',
      redirect: RouteNames.Sequence,
    },

    {
      name: RouteNames.Sequence,
      path: '/sequence',
      components: {
        default: () => import('../views/Sequence').then((c) => c.Sequence),
      },
    },

    {
      name: RouteNames.Information,
      path: '/info',
      components: {
        default: () => import('../views/Information').then((c) => c.Information),
      },
    },
    {
      name: RouteNames.Preferences,
      path: '/preferences',
      components: {
        default: () => import('../views/Preferences').then((c) => c.Preferences),
      },
    },

    {
      name: RouteNames.ErrorLog,
      path: '/error-log',
      components: {
        default: () => import('../views/ErrorLog').then((c) => c.ErrorLog),
      },
    },

    {
      name: RouteNames.Error404,
      path: '/:pathMatch(.*)*',
      components: {
        default: () => import('../views/404').then((c) => c.Error404),
      },
    },
  ],
})
