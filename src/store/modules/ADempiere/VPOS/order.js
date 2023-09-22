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
  createOrder,
  // updateOrder,
  // deleteOrder,
  listOrders
  // getOrder
} from '@/api/ADempiere/form/point-of-sales.js'

// Utils and Helper Methods
// import { isEmptyValue } from '@/utils/ADempiere'
import { showMessage } from '@/utils/ADempiere/notification.js'

const OrderVPOS = {
  list: [],
  order: {},
  isShowOrder: false
}

export default {
  state: OrderVPOS,
  mutations: {
    setListOrders(state, list) {
      state.list = list
    },
    setOrder(state, order) {
      state.order = order
    }
  },
  actions: {
    /**
     * New Order
     * @param {String} posUuid
     * @param {String} customerUuid
     * @param {String} campaignUuid
     * @param {String} priceListUuid
     * @param {String} warehouseUuid
     * @param {String} documentTypeUuid
     * @param {String} salesRepresentativeUuid
     * @returns {Object} Order
     */
    newOrder({ commit, getters }) {
      return new Promise(resolve => {
        const currentPos = getters.getVPOS
        const {
          uuid,
          priceList,
          warehouse,
          documentType,
          defaultCampaign,
          templateCustomer
        } = currentPos
        createOrder({
          posUuid: uuid,
          customerUuid: templateCustomer.uuid,
          documentTypeUuid: documentType.uuid,
          priceListUuid: priceList.uuid,
          warehouseUuid: warehouse.uuid,
          campaignUuid: defaultCampaign.uuid
        })
          .then(responseOrder => {
            commit('setOrder', responseOrder)
            resolve(responseOrder)
          })
          .catch(error => {
            console.warn(`New Order: ${error.message}. Code: ${error.code}.`)
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            resolve({})
          })
      })
    },
    listOrder({ commit, getters }, {
      posUuid = getters.getPoint.uuid,
      isClosed,
      pageSize,
      pageToken,
      documentNo,
      grandTotal,
      openAmount,
      isNullified,
      dateOrderedTo,
      isBindingOffer,
      isOnlyProcessed,
      isWaitingForPay,
      dateOrderedFrom,
      isOnlyAisleSeller,
      businessPartnerUuid,
      isWaitingForInvoice,
      isWaitingForShipment,
      salesRepresentativeUuid = getters.getPoint.salesRepresentative.uuid
    }) {
      return new Promise(resolve => {
        const {
          uuid,
          salesRepresentative
        } = getters.getPoint
        listOrders({
          posUuid: uuid,
          isClosed,
          pageSize,
          pageToken,
          documentNo,
          grandTotal,
          openAmount,
          isNullified,
          dateOrderedTo,
          isBindingOffer,
          isOnlyProcessed,
          isWaitingForPay,
          dateOrderedFrom,
          isOnlyAisleSeller,
          businessPartnerUuid,
          isWaitingForInvoice,
          isWaitingForShipment,
          salesRepresentativeUuid: salesRepresentative.uuid
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
            resolve([])
            console.warn(`Error Getting List Order: ${error.message}. Code: ${error.code}.`)
          })
      })
    }
  },
  getters: {
    getListOrder(state) {
      return state.list
    },
    getCurrentOrder(state) {
      return state.order
    }
  }
}
