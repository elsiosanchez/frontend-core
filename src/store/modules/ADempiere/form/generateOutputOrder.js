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

// API Request Methods
import {
  requestListDocuments,
  requesListDocumentLines
} from '@/api/ADempiere/form/outBoundOrder.ts'

const initState = {
  listDocument: [],
  isLoadingDocument: false,
  listDocumentLines: [],
  isLoadingDocumentLines: false,
  searchCriteria: {
    listOrganization: [],
    organizationId: -1,
    moventTypeId: false,
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
    deliveryRuleId: -1,
    listDeliveryVia: [],
    deliveryViaId: -1,
    listShipper: [],
    shipperId: -1,
    // process
    listDocumentAction: [],
    documentActionId: -1,
    listLocator: [],
    locatorId: -1,
    shipDate: new Date(),
    documentDate: new Date()
  }
}

const OutBoundOrder = {
  state: initState,
  mutations: {
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
    }
  },
  actions: {
    searchListDocument({ commit }, {
      moventTypeId,
      organizationId,
      warehouseId,
      salesRegionId,
      salesRepresentativeId,
      documentTypeId
    }) {
      return new Promise(resolve => {
        commit('setIsLoadingDocument', true)
        requestListDocuments({
          movement_type: moventTypeId,
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
          .finally(() => {
            commit('setIsLoadingDocument', false)
          })
      })
    },
    searchListDocumentLine({ commit }, {
      moventTypeId,
      organizationId,
      warehouseId,
      salesRegionId,
      salesRepresentativeId,
      documentTypeId
    }) {
      return new Promise(resolve => {
        commit('setIsLoadingDocumentList', true)
        requesListDocumentLines({
          movement_type: moventTypeId,
          organization_id: organizationId,
          warehouse_id: warehouseId,
          sales_region_id: salesRegionId,
          sales_representative_id: salesRepresentativeId,
          document_type_id: documentTypeId
        })
          .then(response => {
            const { records } = response
            commit('setListDocumentList', records)
            resolve(records)
          })
          .finally(() => {
            commit('setIsLoadingDocumentList', false)
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
    }
  }
}

export default OutBoundOrder
