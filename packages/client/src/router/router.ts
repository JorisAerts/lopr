import { createRouter, createWebHashHistory } from 'vue-router'
import { RouteNames } from './RouteNames'
import { Error404, ErrorLog, ErrorLogControlsToolbar, Information, Request, RequestControlsToolbar } from '../views'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: RouteNames.Requests,
      path: '/',
      components: {
        default: Request,
        controls: RequestControlsToolbar,
      },
    },

    {
      name: RouteNames.Information,
      path: '/info',
      components: {
        default: Information,
      },
    },

    {
      name: RouteNames.ErrorLog,
      path: '/error-log',
      components: {
        default: ErrorLog,
        controls: ErrorLogControlsToolbar,
      },
    },

    {
      name: RouteNames.Error404,
      path: '/error/404',
      components: {
        default: Error404,
      },
    },

    {
      path: '/:pathMatch(.*)*',
      redirect: (to) => {
        return { name: RouteNames.Error404, query: { p: to.fullPath } }
      },
    },
  ],
})
