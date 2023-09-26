import router from '@/router'

// Api Request Methods
import {
  listDocumentTypes,
  listPointOfSales,
  getPointOfSales,
  // listTenderTypes,
  listWarehouses,
  listPrices
} from '@/api/ADempiere/form/point-of-sales.js'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showMessage } from '@/utils/ADempiere/notification'

const VPos = {
  listDocumentTypes: [],
  listWarehouses: [],
  listCurrencies: [],
  listPrices: [],
  currentPos: {},
  listPos: []
}

export default {
  state: VPos,
  mutations: {
    setVPOS(state, pos) {
      state.currentPos = pos
    },
    setLisVPOS(state, list) {
      state.listPos = list
    },
    setListWarehouses(state, list) {
      state.listWarehouses = list
    },
    setListPrices(state, list) {
      state.listPrices = list
    },
    setListDocumentTypes(state, list) {
      state.listDocumentTypes = list
    }
  },
  /**
   * Pos Actions
   */
  actions: {
    /**
     * Get Point of Sale Data
     * @params {Number} posId
     */
    searchPointOfSaleData({
      dispatch
    }, posUuid) {
      return new Promise(resolve => {
        const currentRouter = router.app.$route
        const { posId } = currentRouter.query
        if (!isEmptyValue(posId)) posUuid = posId
        if (isEmptyValue(posUuid)) {
          dispatch('listPointOfSale')
          resolve({})
          return
        }
        getPointOfSales({ posUuid })
          .then(response => {
            dispatch('changeVPOS', { getPointOfSales: response })
            resolve(response)
          })
          .catch(error => {
            console.warn(`Set PointOfSales: ${error.message}. Code: ${error.code}. UUID: ${posUuid}`)
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            dispatch('listPointOfSale')
            resolve({})
          })
      })
    },
    /**
     * List All Point of Sale
     */
    listPointOfSale({
      commit,
      getters,
      dispatch
    }) {
      return new Promise(resolve => {
        const userUuid = getters['user/getUserUuid']
        const currentPos = getters.getVPOS
        listPointOfSales({ userUuid })
          .then(response => {
            const { sellingPointsList } = response
            commit('setLisVPOS', sellingPointsList)
            if (isEmptyValue(currentPos)) dispatch('changeVPOS', { getPointOfSales: sellingPointsList[0] })
            resolve(sellingPointsList)
          })
          .catch(error => {
            console.warn(`List All PointOfSales: ${error.message}. Code: ${error.code}. UserUUID: ${userUuid}`)
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            resolve([])
          })
      })
    },
    /**
     * Change Point of Sale
     */
    changeVPOS({
      commit
    }, {
      getPointOfSales
    }) {
      return new Promise(resolve => {
        if (isEmptyValue(getPointOfSales)) {
          resolve({})
          return
        }
        commit('setVPOS', getPointOfSales)
        commit('setOrder', {})
        const currentRouter = router.app.$route
        const {
          name,
          query,
          params
        } = currentRouter
        const { id } = getPointOfSales
        router.push({
          name,
          params: { ...params },
          query: {
            ...query,
            posId: id
          }
        }, () => {})
        resolve(getPointOfSales)
      })
    },
    /**
     * List of Available Price
     */
    listAvailablePrices({ commit, getters }) {
      return new Promise(resolve => {
        const currentPos = getters.getVPOS
        if (isEmptyValue(currentPos)) {
          resolve([])
          return
        }
        listPrices({
          posUuid: currentPos.uuid
        })
          .then(response => {
            const { records } = response
            commit('setListPrices', records)
            resolve(records)
          })
          .catch(error => {
            console.warn(`List of Available Price: ${error.message}. Code: ${error.code}.`)
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            resolve([])
          })
      })
    },
    /**
     * List of Available Warehouses
     */
    listAvailableWarehouse({ commit, getters }) {
      return new Promise(resolve => {
        const currentPos = getters.getVPOS
        if (isEmptyValue(currentPos)) {
          resolve([])
          return
        }
        listWarehouses({
          posUuid: currentPos.uuid
        })
          .then(response => {
            const { records } = response
            commit('setListWarehouses', records)
            resolve(records)
          })
          .catch(error => {
            console.warn(`List of Available Warehouses: ${error.message}. Code: ${error.code}.`)
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            resolve([])
          })
      })
    },
    /**
     * List of Available Document Types
     */
    listAvailableDocumentTypes({ commit, getters }) {
      return new Promise(resolve => {
        const currentPos = getters.getVPOS
        if (isEmptyValue(currentPos)) {
          resolve([])
          return
        }
        listDocumentTypes({
          posUuid: currentPos.uuid
        })
          .then(response => {
            const { records } = response
            commit('setListDocumentTypes', records)
            resolve(records)
          })
          .catch(error => {
            console.warn(`List of Available Document Types: ${error.message}. Code: ${error.code}.`)
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
    getVPOS: (state) => {
      return state.currentPos
    },
    getLisVPOS: (state) => {
      return state.listPos
    },
    getListWarehouses: (state) => {
      return state.listWarehouses
    },
    getListPrices: (state) => {
      return state.listPrices
    },
    getListDocumentTypes: (state) => {
      return state.listDocumentTypes
    }
  }
}
