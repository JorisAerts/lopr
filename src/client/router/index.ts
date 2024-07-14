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
      name: RouteNames.Error404,
      path: '/:pathMatch(.*)*',
      components: {
        default: () => import('../views/404').then((c) => c.Error404),
      },
    },
  ],
})
