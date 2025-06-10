/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
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
  requestListVendorPurchases,
  requestListRelatedProducts,
  requestListWarehouseStocks,
  requestListSubstituteProducts,
  requestListAvailableToPromises
} from '@/api/ADempiere/fields/search/product.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { showMessage } from '@/utils/ADempiere/notification'
import { convertToNumber, formatPrice, formatQuantity } from '@/utils/ADempiere/formatValue/numberFormat'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'

const productSearch = {
  isShowDialog: false,
  currentProduct: {},
  record: {
    isLoading: false,
    list: [],
    recordCount: 0,
    pageToken: ''
  },
  warehouseStocks: {
    record: [],
    isLoading: false
  },
  substitute: {
    record: [],
    isLoading: false
  },
  relateds: {
    record: [],
    isLoading: false
  },
  availableToPromise: {
    record: [],
    isLoading: false
  },
  vendorPurchases: {
    record: [],
    isLoading: false
  }
}

const formProductSearch = {
  state: productSearch,

  mutations: {
    setShowProductDetailDialog(state, show) {
      state.isShowDialog = show
    },
    setCurrentProduct(state, product) {
      state.currentProduct = product
    },
    setRecordProduct(state, {
      isLoading,
      list,
      recordCount,
      pageToken
    }) {
      state.record = {
        isLoading,
        list,
        recordCount,
        pageToken
      }
    },
    setWarehouseStocks(state, {
      record = [],
      isLoading
    }) {
      state.warehouseStocks = {
        record,
        isLoading
      }
    },
    setSubstitute(state, {
      record = [],
      isLoading
    }) {
      state.substitute = {
        record,
        isLoading
      }
    },
    setRelateds(state, {
      record = [],
      isLoading
    }) {
      state.relateds = {
        record,
        isLoading
      }
    },
    setAvailableToPromise(state, {
      record = [],
      isLoading
    }) {
      state.availableToPromise = {
        record,
        isLoading
      }
    },
    setVendorPurchases(state, {
      record = [],
      isLoading
    }) {
      state.vendorPurchases = {
        record,
        isLoading
      }
    }
  },

  actions: {
    changeShowDialog({ commit }, show) {
      commit('setShowProductDetailDialog', show)
    },
    requestListWarehouseStocks({ commit, getters }) {
      return new Promise(resolve => {
        commit('setWarehouseStocks', {
          isLoading: true
        })
        const product = getters.getCurrentProduct
        if (isEmptyValue(product)) {
          commit('setWarehouseStocks', {
            isLoading: false
          })
          return resolve()
        }
        const { id } = product
        let listWarehouse = []
        requestListWarehouseStocks({
          productId: id
        })
          .then(response => {
            const { records } = response
            listWarehouse = records.map(row => {
              return {
                ...row,
                available_quantity: convertToNumber(
                  row.available_quantity
                ),
                availableQuantityFormatted: formatQuantity({
                  value: row.available_quantity
                }),
                on_hand_quantity: convertToNumber(
                  row.on_hand_quantity
                ),
                onHandQuantityFormatted: formatQuantity({
                  value: row.on_hand_quantity
                }),
                reserved_quantity: convertToNumber(
                  row.reserved_quantity
                ),
                reservedQuantityFormatted: formatQuantity({
                  value: row.reserved_quantity
                }),
                ordered_quantity: convertToNumber(
                  row.ordered_quantity
                ),
                orderedQuantityFormatted: formatQuantity({
                  value: row.ordered_quantity
                })
              }
            })
          })
          .catch(error => {
            console.warn(error)
            showMessage({
              type: 'info',
              message: error.message
            })
            listWarehouse = []
          })
          .finally(() => {
            commit('setWarehouseStocks', {
              isLoading: false,
              record: listWarehouse
            })
          })
      })
    },
    requestListSubstitute({ commit, getters }) {
      return new Promise(resolve => {
        commit('setSubstitute', {
          isLoading: true
        })
        const product = getters.getCurrentProduct
        if (isEmptyValue(product)) {
          commit('setSubstitute', {
            isLoading: false
          })
          return resolve()
        }
        const { id } = product
        const priceList = getters.getProductSearchFieldQueryFilterByAttribute({
          containerUuid: 'product_search_form',
          attributeKey: 'price_list_version_id'
        })
        let listSubstitute
        requestListSubstituteProducts({
          productId: id,
          priceList
        })
          .then(response => {
            const { records } = response
            listSubstitute = records.map(row => {
              return {
                ...row,
                available_quantity: convertToNumber(
                  row.available_quantity
                ),
                availableQuantityFormatted: formatQuantity({
                  value: row.available_quantity
                }),
                on_hand_quantity: convertToNumber(
                  row.on_hand_quantity
                ),
                onHandQuantityFormatted: formatQuantity({
                  value: row.on_hand_quantity
                }),
                reserved_quantity: convertToNumber(
                  row.reserved_quantity
                ),
                reservedQuantityFormatted: formatQuantity({
                  value: row.reserved_quantity
                }),
                standard_price: convertToNumber(
                  row.standard_price
                ),
                standardPriceFormatted: formatPrice({
                  value: row.standard_price
                })
              }
            })
          })
          .catch(error => {
            console.warn(error)
            showMessage({
              type: 'info',
              message: error.message
            })
            listSubstitute = []
          })
          .finally(() => {
            commit('setSubstitute', {
              isLoading: false,
              record: listSubstitute
            })
          })
      })
    },
    requestListRelateds({ commit, getters }) {
      return new Promise(resolve => {
        commit('setRelateds', {
          isLoading: true
        })
        const product = getters.getCurrentProduct
        if (isEmptyValue(product)) {
          commit('setRelateds', {
            isLoading: false
          })
          return resolve()
        }
        const { id } = product
        const priceList = getters.getProductSearchFieldQueryFilterByAttribute({
          containerUuid: 'product_search_form',
          attributeKey: 'price_list_version_id'
        })
        let listRecords
        requestListRelatedProducts({
          productId: id,
          priceList
        })
          .then(response => {
            const { records } = response
            listRecords = records.map(row => {
              return {
                ...row,
                available_quantity: convertToNumber(
                  row.available_quantity
                ),
                availableQuantityFormatted: formatQuantity({
                  value: row.available_quantity
                }),
                on_hand_quantity: convertToNumber(
                  row.on_hand_quantity
                ),
                onHandQuantityFormatted: formatQuantity({
                  value: row.on_hand_quantity
                }),
                reserved_quantity: convertToNumber(
                  row.reserved_quantity
                ),
                reservedQuantityFormatted: formatQuantity({
                  value: row.reserved_quantity
                }),
                standard_price: convertToNumber(
                  row.standard_price
                ),
                standardPriceFormatted: formatQuantity({
                  value: row.standard_price
                })
              }
            })
          })
          .catch(error => {
            console.warn(error)
            showMessage({
              type: 'info',
              message: error.message
            })
            listRecords = []
          })
          .finally(() => {
            commit('setRelateds', {
              isLoading: false,
              record: listRecords
            })
          })
      })
    },
    requestListAvailable({ commit, getters }) {
      return new Promise(resolve => {
        commit('setAvailableToPromise', {
          isLoading: true
        })
        const product = getters.getCurrentProduct
        if (isEmptyValue(product)) {
          commit('setAvailableToPromise', {
            isLoading: false
          })
          return resolve()
        }
        const { id } = product
        let listRecords
        requestListAvailableToPromises({
          productId: id
        })
          .then(response => {
            const { records } = response
            listRecords = records.map(row => {
              return {
                ...row,
                dateFromatted: formatDate({
                  value: row.date
                }),
                on_hand_quantity: convertToNumber(
                  row.on_hand_quantity
                ),
                onHandQuantityFormatted: formatQuantity({
                  value: row.on_hand_quantity
                }),
                reserved_quantity: convertToNumber(
                  row.reserved_quantity
                ),
                reservedQuantityFormatted: formatQuantity({
                  value: row.reserved_quantity
                }),
                available_quantity: convertToNumber(
                  row.available_quantity
                ),
                availableQuantityFormatted: formatQuantity({
                  value: row.available_quantity
                }),
                ordered_quantity: convertToNumber(
                  row.ordered_quantity
                ),
                orderedQuantityFormatted: formatQuantity({
                  value: row.ordered_quantity
                }),
                available_to_promise_quantity: convertToNumber(
                  row.available_to_promise_quantity
                ),
                availableToPromiseQuantityFormatted: formatQuantity({
                  value: row.available_to_promise_quantity
                })
              }
            })
          })
          .catch(error => {
            console.warn(error)
            showMessage({
              type: 'info',
              message: error.message
            })
            listRecords = []
          })
          .finally(() => {
            commit('setAvailableToPromise', {
              isLoading: false,
              record: listRecords
            })
          })
      })
    },
    requestListVendorPurchases({ commit, getters }) {
      return new Promise(resolve => {
        commit('setVendorPurchases', {
          isLoading: true
        })
        const product = getters.getCurrentProduct
        if (isEmptyValue(product)) {
          commit('setVendorPurchases', {
            isLoading: false
          })
          return resolve()
        }
        const { id } = product
        let listRecords
        requestListVendorPurchases({
          productId: id
        })
          .then(response => {
            const { records } = response
            listRecords = records.map(row => {
              return {
                ...row,
                dateFromatted: formatDate({
                  value: row.date
                }),
                list_price: convertToNumber(
                  row.list_price
                ),
                min_order_quantity: convertToNumber(
                  row.min_order_quantity
                ),
                minOrderQuantity: formatQuantity({
                  value: convertToNumber(
                    row.min_order_quantity
                  )
                }),
                promised_delivery_time: convertToNumber(
                  row.promised_delivery_time
                ),
                promisedDeliveryTime: formatQuantity({
                  value: convertToNumber(
                    row.promised_delivery_time
                  )
                }),
                actual_delivery_time: convertToNumber(
                  row.actual_delivery_time
                ),
                actualDeliveryTime: formatQuantity({
                  value: convertToNumber(
                    row.actual_delivery_time
                  )
                }),
                listPriceFormatted: formatPrice({
                  value: row.list_price,
                  currency: row.currency
                }),
                purchase_price: convertToNumber(
                  row.purchase_price
                ),
                purchasePriceFormatted: formatPrice({
                  value: row.purchase_price,
                  currency: row.currency
                }),
                last_purchase_price: convertToNumber(
                  row.last_purchase_price
                ),
                lastPurchasePriceFormatted: formatPrice({
                  value: row.last_purchase_price,
                  currency: row.currency
                })
              }
            })
          })
          .catch(error => {
            console.warn(error)
            showMessage({
              type: 'info',
              message: error.message
            })
            listRecords = []
          })
          .finally(() => {
            commit('setVendorPurchases', {
              isLoading: false,
              record: listRecords
            })
          })
      })
    }
  },

  getters: {
    getShowProductDetailDialog: (state) => {
      return state.isShowDialog
    },
    getCurrentProduct: (state) => {
      return state.currentProduct
    },
    getProductRecordList: (state) => {
      return state.record.list
    },
    getProductInfoRecordCount: (state) => {
      return state.record.recordCount
    },
    getPageToken: (state) => {
      return state.record.pageToken
    },
    getLoading: (state) => {
      return state.record.isLoading
    },
    getWarehouseStocks: (state) => {
      return state.warehouseStocks
    },
    getSubstitute: (state) => {
      return state.substitute
    },
    getRelateds: (state) => {
      return state.relateds
    },
    getAvailableToPromise: (state) => {
      return state.availableToPromise
    },
    getVendorPurchases: (state) => {
      return state.vendorPurchases
    }
  }
}

export default formProductSearch
