// API Request Methods
import {
  getProductPriceList
} from '@/api/ADempiere/form/point-of-sales.js'
// Utils and Helper Methods
// import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showMessage } from '@/utils/ADempiere/notification'
import { extractPagingToken } from '@/utils/ADempiere/dataUtils'

const productList = {
  showProductList: false,
  productList: [],
  recordCount: 0,
  pageToken: ''
}

export default {
  state: productList,
  mutations: {
    setShowProductList(state, show) {
      state.showProductList = show
    },
    setProductCount(state, recordCount) {
      state.recordCount = recordCount
    },
    setProductPageToken(state, pageToken) {
      state.pageToken = pageToken
    },
    setProductList(state, list) {
      state.productList = list
    }
  },
  /**
   * Product List
   */
  actions: {
    /**
     * Get List All Products
     * @params {String} SearchValue
     * @params {Number} PageSize
     */
    searchProductList({
      commit,
      getters
    }, {
      searchValue,
      pageSize = 15,
      pageToken
    }) {
      return new Promise(resolve => {
        const currentPos = getters.getVPOS
        const {
          uuid,
          priceList,
          warehouse
        } = currentPos
        getProductPriceList({
          posUuid: uuid,
          pageSize,
          pageToken,
          searchValue,
          priceListUuid: priceList.uuid,
          warehouseUuid: warehouse.uuid
          // businessPartnerUuid
        })
          .then(response => {
            const {
              recordCount,
              nextPageToken,
              productPricesList
            } = response
            commit('setProductCount', recordCount)
            commit('setProductList', productPricesList)
            commit('setProductPageToken', extractPagingToken(nextPageToken))
            resolve(productPricesList)
          })
          .catch(error => {
            console.warn(`Product List: ${error.message}. Code: ${error.code}.`)
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            resolve([])
          })
      })
    }
  },
  getters: {
    getProductList: (state) => {
      return state.productList
    },
    getProductCount: (state) => {
      return state.recordCount
    },
    getProductPageToken: (state) => {
      return state.pageToken
    },
    getShowProductList: (state) => {
      return state.showProductList
    }
  }
}
