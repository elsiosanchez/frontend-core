/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// API Request Methods
import {
  listOrders
} from '@/api/ADempiere/form/point-of-sales.js'

// Utils and Helper Methods
import { showMessage } from '@/utils/ADempiere/notification.js'

const OrderVPOS = {
  list: [],
  isShowOrder: false
}

export default {
  state: OrderVPOS,
  mutations: {
    setListOrders(state, list) {
      state.list = list
    },
    setShowOrder(state, show) {
      state.isShowOrder = show
    }
  },
  actions: {
    listOrder({ commit }, {
      searchValue
    }) {
      return new Promise(resolve => {
        listOrders({
          searchValue
        })
          .then(response => {
            const { ordersList } = response
            commit('setListOrders', ordersList)
            resolve(ordersList)
          })
          .catch(error => {
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            resolve(error)
            console.warn(`Error Getting List Order: ${error.message}. Code: ${error.code}.`)
          })
      })
    }
  },
  getters: {
    getListOrder(state) {
      return state.list
    },
    getShowOrder(state) {
      return state.isShowOrder
    }
  }
}
