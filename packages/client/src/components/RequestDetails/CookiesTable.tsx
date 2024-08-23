import { defineComponent } from 'vue'
import { makeUUIDProps } from '../../composables/uuid'
import { useRequest } from '../../composables/request'
import { VTable } from 'js-proxy-ui/components'

export const CookiesTable = defineComponent({
  name: 'CookiesTable',

  props: {
    ...makeUUIDProps(),
  },

  setup(props) {
    const { cookies } = useRequest(props)
    return () =>
      cookies.value && (
        <VTable class={'gap-2'}>
          <thead>
            <tr>
              <th style={{ width: '140px' }}>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(cookies.value).map(([cookie, value]) => (
              <tr>
                <th>{cookie}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </VTable>
      )
  },
})
