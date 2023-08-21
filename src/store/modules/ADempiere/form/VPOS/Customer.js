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
  requestListBusinessPartner
} from '@/api/ADempiere/system-core'
import {
  createCustomer
} from '@/api/ADempiere/form/point-of-sales.js'

// Utils and Helper Methods
import { showMessage } from '@/utils/ADempiere/notification.js'

const customerVPOS = {
  list: [],
  currentCustomer: {},
  isShowCustomer: false
}

export default {
  state: customerVPOS,
  mutations: {
    setListCustomer(state, list) {
      state.list = list
    },
    setShowCustomer(state, show) {
      state.isShowCustomer = show
    }
  },
  actions: {
    listCustomer({ commit }, {
      searchValue
    }) {
      return new Promise(resolve => {
        requestListBusinessPartner({
          searchValue
        })
          .then(response => {
            const { businessPartnersList } = response
            commit('setListCustomer', businessPartnersList)
            resolve(businessPartnersList)
          })
          .catch(error => {
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            resolve(error)
            console.warn(`Error Getting List Customer: ${error.message}. Code: ${error.code}.`)
          })
      })
    },
    newCustomer({ commit, getters }, {
      name,
      value,
      taxId,
      phone,
      lastName,
      addresses,
      additionalAttributes
    }) {
      return new Promise(resolve => {
        const posUuid = getters.getPoint.uuid
        createCustomer({
          value,
          taxId,
          name,
          phone,
          posUuid,
          lastName,
          addresses,
          additionalAttributes
        })
          .then(response => {
            console.log({ response })
            // const { businessPartnersList } = response
            // commit('setListCustomer', businessPartnersList)
            const {
              name,
              value
            } = response
            showMessage({
              type: 'success',
              message: `El Socio de Negocio ${name} - ${value} Fue Creado Exitosamente`,
              showClose: true
            })
            resolve(response)
          })
          .catch(error => {
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            resolve(error)
            console.warn(`Error Getting List Customer: ${error.message}. Code: ${error.code}.`)
          })
      })
    }
  },
  getters: {
    getListCustomer(state) {
      return state.list
    },
    getShowCustomer(state) {
      return state.isShowCustomer
    }
  }
}
