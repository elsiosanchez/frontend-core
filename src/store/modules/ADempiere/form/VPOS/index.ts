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
  listDocumentTypes,
  // Search Product
  getProductPriceList,
  // Create order from POS
  getOrder,
  createOrder,
  createOrderLine,
  listOrderLines
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
  uuid: String(''),
  id: Number,
  name: String,
  list: Object([]),
  listLines: Object([])
}

const VPOS = {
  point: {
    uuid: String(''),
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
  order: {},
  listPoint: Object([]),
  listPricesPoint: Object([]),
  listWarehouses: Object([]),
  listDocumentTypes: Object([]),
  listProduct: Object([])
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
    /**
     * Update Order
     */
    setUpdateOrderVPOS(state, {
      attribute,
      value
    }) {
      state.order[attribute] = value
    },
    setPoint(state, point) {
      state.point = point
    },
    setOrder(state, order) {
      state.order = order
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
    },
    setProductList(state, list) {
      state.listProduct = list
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
      })
    },
    /**
     * GET List product price
     */
    searchProductList({ commit, state }, searchValue) {
      return new Promise(resolve => {
        let businessPartnerUuid, priceListUuid, warehouseUuid, pageToken
        const {
          uuid,
          warehouse,
          priceList,
          templateCustomer
        } = state.point
        if (!isEmptyValue(templateCustomer) && !isEmptyValue(uuid)) businessPartnerUuid = templateCustomer.uuid
        if (!isEmptyValue(warehouse) && !isEmptyValue(warehouse.uuid)) warehouseUuid = warehouse.uuid
        if (!isEmptyValue(priceList) && !isEmptyValue(priceList.uuid)) priceListUuid = priceList.uuid
        getProductPriceList({
          searchValue,
          posUuid: uuid,
          businessPartnerUuid,
          priceListUuid,
          warehouseUuid,
          pageSize: 15,
          pageToken
        })
          .then(responseProducList => {
            const { productPricesList } = responseProducList
            commit('setProductList', productPricesList)
            resolve(productPricesList)
          })
          .catch(error => {
            console.warn(`Error getting Product Price List: ${error.message}. Code: ${error.code}.`)
            Message({
              type: 'error',
              message: error.message
            })
            resolve([])
          })
      })
    },
    /**
     * Get Order
     * Crear Order From POS (New Order)
     * Add New Line to Order (New Line)
     * Update Order Lines (Update Line)
     * List Order Lines (List Line)
     */
    refrestOrder({ commit, state }) {
      const {
        uuid
      } = state.point
      const order = state.order
      return new Promise(resolve => {
        if (isEmptyValue(uuid) || isEmptyValue(order)) return resolve({})
        getOrder(
          order.uuid,
          uuid
        )
          .then(responseOrder => {
            commit('setOrder', responseOrder)
            resolve(resolve)
          })
          .catch(error => {
            console.warn(`Error getting Get Order: ${error.message}. Code: ${error.code}.`)
            Message({
              type: 'error',
              message: error.message
            })
            resolve({})
          })
      })
    },
    newOrder({ commit, state, dispatch }) {
      return new Promise(resolve => {
        const {
          uuid,
          priceList,
          warehouse,
          documentType,
          templateCustomer,
          salesRepresentative,
          defaultCampaignUuid
        } = state.point
        createOrder({
          posUuid: uuid,
          customerUuid: templateCustomer.uuid,
          documentTypeUuid: documentType.uuid,
          salesRepresentativeUuid: salesRepresentative.uuid,
          priceListUuid: priceList.uuid,
          warehouseUuid: warehouse.uuid,
          campaignUuid: defaultCampaignUuid
        })
          .then(responseNewOrder => {
            commit('setOrder', responseNewOrder)
            dispatch('listLines')
            Message({
              type: 'success',
              message: `Nueva Orden ${responseNewOrder.documentNo} Creada`
            })
            resolve(responseNewOrder)
          })
          .catch(error => {
            console.warn(`Error getting Create Order: ${error.message}. Code: ${error.code}.`)
            Message({
              type: 'error',
              message: error.message
            })
            resolve({})
          })
      })
    },
    newLine({ commit, state, dispatch }, {
      price,
      product,
      quantity,
      chargeUuid,
      discountRate,
      resourceAssignmentUuid
    }) {
      return new Promise(resolve => {
        const {
          uuid,
          priceList,
          warehouse
        } = state.point
        const order = state.order
        createOrderLine({
          posUuid: uuid,
          orderUuid: order.uuid,
          priceListUuid: priceList.uuid,
          warehouseUuid: warehouse.uuid,
          productUuid: product.uuid,
          chargeUuid,
          description: product.description,
          quantity,
          price,
          discountRate,
          resourceAssignmentUuid
        })
          .then(responseNewLine => {
            Message({
              type: 'success',
              message: `Producto ${responseNewLine.product.name} Agregado`
            })
            dispatch('refrestOrder')
            dispatch('listLines')
            resolve(responseNewLine)
          })
          .catch(error => {
            console.warn(`Error Getting Add New Line: ${error.message}. Code: ${error.code}.`)
            Message({
              type: 'error',
              message: error.message
            })
            resolve({})
          })
      })
    },
    listLines({ commit, state }) {
      return new Promise(resolve => {
        let pageToken
        const {
          uuid
        } = state.point
        const order = state.order
        listOrderLines({
          posUuid: uuid,
          orderUuid: order.uuid,
          pageSize: 50,
          pageToken
        })
          .then(responseList => {
            const { orderLineList } = responseList
            commit('setUpdateOrderVPOS', {
              attribute: 'listLines',
              value: orderLineList
            })
          })
          .catch(error => {
            console.warn(`Error getting List Lines: ${error.message}. Code: ${error.code}.`)
            Message({
              type: 'error',
              message: error.message
            })
            resolve([])
          })
      })
    }
  },
  getters: {
    getPoint(state) {
      return state.point
    },
    getCurrentOrder(state) {
      return state.order
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
