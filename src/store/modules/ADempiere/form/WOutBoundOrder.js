/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Ricardo Fenomeno ricardofenomeno13@gmail.com https://github.com/ricargame
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
import lang from '@/lang'

// API Request Methods
import {
  requestListDocuments,
  requesListDocumentLines,
  requestLoadOrder
} from '@/api/ADempiere/form/outBoundOrder.ts'

// Constants
import {
  MOVEMENT_TYPE_SALES_ORDER
} from '@/utils/ADempiere/dictionary/form/WOutBoundOrder'

// Utils and Helper Methods
import { showNotification } from '@/utils/ADempiere/notification.js'
import { isEmptyValue } from '@/utils/ADempiere'

const initState = {
  listDocument: [],
  isLoadingDocument: false,
  listDocumentLines: [],
  isLoadingDocumentLines: false,
  recordsId: [],
  linesSelection: [],
  steps: 0,
  isLoadingProcess: false,
  searchCriteria: {
    listOrganization: [],
    organizationId: -1,
    movementTypeId: MOVEMENT_TYPE_SALES_ORDER,
    listDocumentType: [],
    documentTypeId: -1,
    listWarehouse: [],
    warehouseId: -1,
    listSalesRegion: [],
    salesRegionId: -1,
    listSalesRepresentative: [],
    salesRepresentativeId: -1,
    listTargetDocumentType: [],
    targetDocumentTypeId: -1,
    listDeliveryRule: [],
    deliveryRuleId: '',
    listDeliveryVia: [],
    deliveryViaId: '',
    listShipper: [],
    shipperId: -1,
    // process
    listDocumentAction: [],
    documentActionId: 'CO',
    listLocator: [],
    locatorId: -1,
    shipDate: new Date(),
    documentDate: new Date(),
    listVehicles: [],
    vehiclesId: -1,
    listDriver: [],
    driverId: -1,
    charterOrder: false,
    freightDocumentTypesId: -1,
    listfreightDocumentTypes: []
  }
}

const OutBoundOrder = {
  state: initState,
  mutations: {
    clearOutputOrder(state) {
      const preservedValues = {
        listOrganization: state.searchCriteria.listOrganization,
        organizationId: state.searchCriteria.organizationId,
        listWarehouse: state.searchCriteria.listWarehouse,
        warehouseId: state.searchCriteria.warehouseId
      }
      state.listDocument = []
      state.isLoadingDocument = false
      state.listDocumentLines = []
      state.isLoadingDocumentLines = false
      state.recordsId = []
      state.linesSelection = []
      state.steps = 0
      state.isLoadingProcess = false
      state.searchCriteria = {
        listOrganization: preservedValues.listOrganization,
        organizationId: preservedValues.organizationId,
        movementTypeId: MOVEMENT_TYPE_SALES_ORDER,
        listDocumentType: [],
        documentTypeId: null,
        listWarehouse: preservedValues.listWarehouse,
        warehouseId: preservedValues.warehouseId,
        listSalesRegion: [],
        salesRegionId: null,
        listSalesRepresentative: [],
        salesRepresentativeId: null,
        listTargetDocumentType: [],
        targetDocumentTypeId: null,
        listDeliveryRule: [],
        deliveryRuleId: null,
        listDeliveryVia: [],
        deliveryViaId: null,
        listShipper: [],
        shipperId: null,
        listDocumentAction: [],
        documentActionId: 'CO',
        listLocator: [],
        locatorId: null,
        shipDate: new Date(),
        documentDate: new Date(),
        listVehicles: [],
        vehiclesId: null,
        listDriver: [],
        driverId: null,
        charterOrder: false,
        freightDocumentTypesId: null,
        listfreightDocumentTypes: []
      }
    },
    clearFiltersFreightOrder(state) {
      state.searchCriteria.listCar = []
      state.searchCriteria.vehiclesId = ''
      state.searchCriteria.listDriver = []
      state.searchCriteria.driverId = ''
      state.searchCriteria.charterOrder = false
      state.searchCriteria.freightDocumentTypesId = ''
      state.searchCriteria.listfreightDocumentTypes = []
      state.searchCriteria.listShipper = []
      state.searchCriteria.shipperId = ''
    },
    updateAttributeCriteriaGenerateOrder(state, {
      attribute,
      value
    }) {
      state.searchCriteria[attribute] = value
    },
    setListDocument(state, list) {
      state.listDocument = list
    },
    setIsLoadingDocument(state, loading) {
      state.isLoadingDocument = loading
    },
    setListDocumentList(state, list) {
      state.listDocumentLines = list
    },
    setIsLoadingDocumentList(state, loading) {
      state.isLoadingDocumentLines = loading
    },
    setRecordsId(state, ids) {
      state.recordsId = ids
    },
    setLinesSelection(state, records) {
      state.linesSelection = records
    },
    setOutputSteps(state, steps) {
      state.steps = steps
    },
    setIsLoadingProcess(state, loading) {
      state.isLoadingProcess = loading
    }
  },
  actions: {
    searchListDocument({ commit }, {
      movementTypeId,
      organizationId,
      warehouseId,
      salesRegionId,
      salesRepresentativeId,
      documentTypeId
    }) {
      return new Promise(resolve => {
        commit('setIsLoadingDocument', true)
        requestListDocuments({
          movement_type: movementTypeId,
          organization_id: organizationId,
          warehouse_id: warehouseId,
          sales_region_id: salesRegionId,
          sales_representative_id: salesRepresentativeId,
          document_type_id: documentTypeId
        })
          .then(response => {
            const { records } = response
            commit('setListDocument', records)
            resolve(records)
          })
          .catch(error => {
            showNotification({
              title: lang.t('notifications.error'),
              message: error,
              type: 'error'
            })
          })
          .finally(() => {
            commit('setIsLoadingDocument', false)
          })
      })
    },
    searchListDocumentLine({ commit }, {
      movementTypeId,
      recordsId
    }) {
      return new Promise(resolve => {
        commit('setIsLoadingDocumentList', true)
        if (isEmptyValue(recordsId)) {
          commit('setListDocumentList', [])
          commit('setRecordsId', recordsId)
          commit('setIsLoadingDocumentList', false)
          commit('setLinesSelection', [])
          return
        }
        requesListDocumentLines({
          movement_type: movementTypeId,
          header_ids: recordsId
        })
          .then(response => {
            const { records } = response
            commit('setListDocumentList', records)
            commit('setRecordsId', recordsId)
            resolve(records)
          })
          .catch(error => {
            showNotification({
              title: lang.t('notifications.error'),
              message: error,
              type: 'error'
            })
          })
          .finally(() => {
            commit('setIsLoadingDocumentList', false)
          })
      })
    },
    runOutputOrderProcess({ commit }, {
      organization_id,
      warehouse_id,
      target_document_type_id,
      delivery_rule,
      delivery_via,
      shipper_id,
      document_date,
      shipment_date,
      movement_type,
      orderLineRequest,
      is_generate_freight_order,
      vehicle_id,
      driver_id,
      freight_document_type_id
    }) {
      return new Promise(resolve => {
        commit('setIsLoadingProcess', true)
        requestLoadOrder({
          organization_id,
          warehouse_id,
          target_document_type_id,
          delivery_rule,
          delivery_via,
          shipper_id,
          document_date,
          shipment_date,
          movement_type,
          orderLineRequest,
          is_generate_freight_order,
          vehicle_id,
          driver_id,
          freight_document_type_id
        })
          .then(response => {
            let messageFreight = ''
            if (!isEmptyValue(response.freight_message)) {
              messageFreight = response.freight_message
            }
            showNotification({
              title: lang.t('notifications.completed'),
              message: response.message + ' ' + messageFreight,
              type: 'success'
            })
            commit('clearOutputOrder')
            resolve(response)
          })
          .catch(error => {
            showNotification({
              title: lang.t('notifications.error'),
              message: error,
              type: 'error'
            })
          })
          .finally(() => {
            commit('setIsLoadingProcess', false)
          })
      })
    }
  },
  getters: {
    getSearchFilterGenerateOrder: (state) => {
      return state.searchCriteria
    },
    getIsLoadingListDocument: (state) => {
      return state.isLoadingDocument
    },
    getListDocument: (state) => {
      return state.listDocument
    },
    getListDocumentLine: (state) => {
      return state.listDocumentLines
    },
    getIsLoadingListDocumentLine: (state) => {
      return state.isLoadingDocumentLines
    },
    getHeaderRecordsId: (state) => {
      return state.recordsId
    },
    getLinesSelection: (state) => {
      return state.linesSelection
    },
    getOutputSteps: (state) => {
      return state.steps
    },
    getIsLoadingProcess: (state) => {
      return state.isLoadingProcess
    }
  }
}

export default OutBoundOrder
