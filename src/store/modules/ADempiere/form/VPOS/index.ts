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

// Const
import { ROWS_OF_RECORDS_BY_PAGE } from '@/utils/ADempiere/tableUtils'
// API Request Methods
import {
  getPointOfSales,
  listPointOfSales,
  // List Options Available for Point of Sales
  listPrices,
  listWarehouses,
  listDocumentTypes
} from '@/api/ADempiere/form/point-of-sales.js'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
import { Message } from 'element-ui'

const priceList = {
  uuid: String,
  id: Number,
  name: String,
  description: String
}

const warehouse = {
  uuid: String,
  id: Number,
  name: String,
  description: String,
  list: Object([])
}

const order = {
  uuid: String,
  id: Number,
  name: String,
  list: Object([])
}

const VPOS = {
  point: {
    uuid: String,
    id: Number(undefined),
    name: String(''),
    description: String,
    help: String,
    isModifyPrice: Boolean(false),
    isRequiredPin: Boolean(false),
    isAisleSeller: Boolean(false),
    isSharedPos: Boolean(false),
    documentType: Object({}),
    salesRepresentative: Object({}),
    templateCustomer: Object({}),
    priceList,
    displayCurrency: Object({}),
    warehouse,
    order,
    refundReferenceCurrency: Object({}),
    conversionTypeUuid: String,
    keyLayoutUuid: String,
    isAllowsModifyQuantity: Boolean(false),
    isAllowsCollectOrder: Boolean(false),
    isAllowsCreateOrder: Boolean(false),
    isAllowsConfirmShipment: Boolean(false),
    isDisplayDiscount: Boolean(false),
    isDisplayTaxAmount: Boolean(false),
    isAllowsAllocateSeller: Boolean(false),
    isAllowsConcurrentUse: Boolean(false),
    isConfirmCompleteShipment: Boolean(false),
    isAllowsCashClosing: Boolean(false),
    isAllowsCashOpening: Boolean(false),
    isAllowsCashWithdrawal: Boolean(false),
    isAllowsApplyDiscount: Boolean(false),
    defaultCampaignUuid: String,
    defaultOpeningChargeUuid: String,
    defaultWithdrawalChargeUuid: String,
    maximumRefundAllowed: Number,
    maximumDiscountAllowed: Number,
    maximumLineDiscountAllowed: Number,
    writeOffAmountTolerance: Number,
    isAllowsCreateCustomer: Boolean(false),
    isAllowsPrintDocument: Boolean(false),
    isPosManager: Boolean(false),
    isAllowsModifyDiscount: Boolean(false),
    isKeepPriceFromCustomer: Boolean(false),
    isAllowsModifyCustomer: Boolean(false)
  },
  listPoint: Object([]),
  listPricesPoint: Object([]),
  listWarehouses: Object([]),
  listDocumentTypes: Object([])
}

export default {
  state: VPOS,
  mutations: {
    /**
     * Update Attribute
     * Generic mutation that allows to change the state of the store
     * @param {string} attribute - Attribute and which one to update - Requires it to be an Object
     * @param {string} value - Value to Update
     */
    setUpdatePointVPOS(state, {
      attribute,
      value
    }) {
      state.point[attribute] = value
    },
    setPoint(state, point) {
      state.point = point
    },
    setListPoint(state, list) {
      state.listPoint = list
    },
    setListPrices(state, list) {
      state.listPricesPoint = list
    },
    setListWarehouses(state, list) {
      state.listWarehouses = list
    },
    setListDocumentTypes(state, list) {
      state.listDocumentTypes = list
    }
  },
  actions: {
    searchPoint({ commit, dispatch, state }, uuid) {
      return new Promise(resolve => {
        getPointOfSales({
          posUuid: uuid
        })
          .then(point => {
            commit('setPoint', point)
            resolve(point)
          })
          .catch(error => {
            console.warn(`Error getting Search Point of Sale: ${error.message}. Code: ${error.code}.`)
            Message({
              type: 'error',
              message: error.message
            })
            resolve({})
          })
          .finally(() => {
            dispatch('searchPointList')
          })
      })
    },
    searchPointList({ commit, getters }) {
      return new Promise(resolve => {
        let pageToken, userUuid
        if (!isEmptyValue(getters['user/getUserUuid'])) userUuid = getters['user/getUserUuid']
        listPointOfSales({
          userUuid,
          pageSize: ROWS_OF_RECORDS_BY_PAGE,
          pageToken
        })
          .then(listPoint => {
            const { sellingPointsList } = listPoint
            const { id } = getters.getPoint
            if (isEmptyValue(id) && !isEmptyValue(sellingPointsList)) {
              commit('setPoint', sellingPointsList[0])
            }
            commit('setListPoint', sellingPointsList)
            resolve(sellingPointsList)
          })
          .catch(error => {
            console.warn(`Error getting List Point of Sales: ${error.message}. Code: ${error.code}.`)
            Message({
              type: 'error',
              message: error.message
            })
            resolve([])
          })
      })
    },
    /**
     * Options Available according to the Point of Sale
     * Get List Price
     * Get Warehouse
     * Get Document Type
     */
    listAvailablePrices({ commit, dispatch, state }, uuid) {
      return new Promise(resolve => {
        if (isEmptyValue(uuid)) uuid = state.point.uuid
        listPrices({
          posUuid: uuid
        })
          .then(response => {
            const { records } = response
            commit('setListPrices', records)
            resolve(records)
          })
          .catch(error => {
            console.warn(`Error getting List Avalibles Prices Point of Sale: ${error.message}. Code: ${error.code}.`)
            Message({
              type: 'error',
              message: error.message
            })
            resolve({})
          })
          .finally(() => {
            dispatch('searchPointList')
          })
      })
    },
    listAvailableWarehouse({ commit, dispatch, state }, uuid) {
      return new Promise(resolve => {
        if (isEmptyValue(uuid)) uuid = state.point.uuid
        listWarehouses({
          posUuid: uuid
        })
          .then(response => {
            const { records } = response
            commit('setListWarehouses', records)
            resolve(records)
          })
          .catch(error => {
            console.warn(`Error getting List Avalibles Warehouses Point of Sale: ${error.message}. Code: ${error.code}.`)
            Message({
              type: 'error',
              message: error.message
            })
            resolve({})
          })
          .finally(() => {
            dispatch('searchPointList')
          })
      })
    },
    listAvailableDocumentTypes({ commit, dispatch, state }, uuid) {
      return new Promise(resolve => {
        if (isEmptyValue(uuid)) uuid = state.point.uuid
        listDocumentTypes({
          posUuid: uuid
        })
          .then(response => {
            const { records } = response
            commit('setListDocumentTypes', records)
            resolve(records)
          })
          .catch(error => {
            console.warn(`Error getting List Avalibles Document Types Point of Sale: ${error.message}. Code: ${error.code}.`)
            Message({
              type: 'error',
              message: error.message
            })
            resolve({})
          })
          .finally(() => {
            dispatch('searchPointList')
          })
      })
    }
  },
  getters: {
    getPoint(state) {
      return state.point
    },
    getListPoint(state) {
      return state.listPoint
    },
    getListPrices(state) {
      return state.listPricesPoint
    },
    getListWarehouses(state) {
      return state.listWarehouses
    },
    getListDocumentTypes(state) {
      return state.listDocumentTypes
    }
  }
}
