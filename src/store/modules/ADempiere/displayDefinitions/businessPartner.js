/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Elsio Sanchez elsiosanchez@gmail.com https://github.com/elsiosanchez
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

import Vue from 'vue'

// API Request Methods
import { getBusinessPartner, updateBusinessPartner } from '@/api/ADempiere/displayDefinition.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
// import { getStartAndEndOfCurrentMonth } from '@/utils/ADempiere/valueFormat.js'
import { showMessage } from '@/utils/ADempiere/notification.js'

const initState = {
  businessPartner: {},
  definition: {},
  showPanel: false,
  fields: {
    code: '',
    name: '',
    name2: '',
    addresses: []
  },
  displayDefinition: {},
  businessPartnerId: 0
}

const businessPartner = {
  state: initState,

  mutations: {
    setBusinessPartner(state, {
      businessPartner = {},
      isLoading = false,
      recordId
    }) {
      Vue.set(state.definition, recordId, {
        businessPartner,
        isLoading
      })
    },
    setBusinessPartnerLoading(state, {
      isLoading,
      recordId
    }) {
      Vue.set(state.definition[recordId], 'isLoading', isLoading)
    },
    setShowBusinessPartner(state, show) {
      state.showPanel = show
    },
    setBusinessPartnerId(state, businessPartnerId) {
      state.businessPartnerId = businessPartnerId
    },
    setFieldListBP(state, attributes) {
      state.fields = attributes
    },
    setFielCustomer(state, {
      attribute,
      value
    }) {
      state.fields[attribute] = value
    },
    setDisplayDefinition(state, displayDefinition) {
      state.displayDefinition = displayDefinition
    }
  },

  actions: {
    requestBusinessPartner({ state, commit, getters }, {
      displayDefinitionId,
      recordId
    }) {
      return new Promise(resolve => {
        commit('setBusinessPartner', { recordId, isLoading: true })
        getBusinessPartner({
          recordId,
          displayDefinitionId
        })
          .then(response => {
            commit('setBusinessPartner', {
              recordId,
              businessPartner: {
                ...response,
                displayDefinitionId
              }
            })
            commit('setFielCustomer', {
              attribute: 'code',
              value: response.value
            })
            commit('setFielCustomer', {
              attribute: 'name',
              value: response.name
            })
            commit('setFielCustomer', {
              attribute: 'name2',
              value: response.last_name
            })
            commit('setFielCustomer', {
              attribute: 'addresses',
              value: response.addresses
            })
            resolve(response)
          })
          .catch(error => {
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            console.warn(`Error Getting Business Partner: ${error.message}. Code: ${error.code}.`)
          })
          .finally(() => {
            commit('setBusinessPartnerLoading', { recordId, isLoading: false })
          })
      })
    },
    updateBPartner({
      state,
      commit
    }, {
      additionalAttributes,
      displayDefinitionId,
      description,
      addresses,
      recordId,
      name2,
      DUNS,
      Name,
      NAICS,
      posId,
      Value,
      TaxID,
      id
    }) {
      return new Promise(resolve => {
        updateBusinessPartner({
          additionalAttributes,
          displayDefinitionId,
          recordId,
          addresses,
          description,
          duns: DUNS,
          id,
          name: Name,
          naics: NAICS,
          posId,
          value: Value,
          taxId: TaxID,
          lastName: name2
        })
          .then(response => {
            commit('setBusinessPartner', {
              recordId,
              businessPartner: {
                ...response,
                displayDefinitionId
              }
            })
            commit('setShowBusinessPartner', false)
            resolve(response)
          })
          .catch(error => {
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            console.warn(`Error Update Business Partner: ${error.message}. Code: ${error.code}.`)
          })
          // .finally(() => {
          //   commit('setBusinessPartnerLoading', { recordId, isLoading: false })
          // })
      })
    }
  },

  getters: {
    getBusinessPartnerDefinition: (state) => ({ recordId }) => {
      if (!isEmptyValue(state.definition[recordId]) && !isEmptyValue(state.definition[recordId].businessPartner)) {
        return state.definition[recordId].businessPartner
      }
      return {}
    },
    getBusinessPartnerDefinitionLoading: (state) => ({ recordId }) => {
      return state.definition[recordId].isLoading || {}
    },
    getShowBusinessPartner: (state) => {
      return state.showPanel
    },
    getBusinessPartnerId: (state) => {
      return state.businessPartnerId
    },
    getFieldsBusinessPartner: (state) => {
      return state.fields
    },
    getDisplayDefinition: (state) => {
      return state.displayDefinition
    },
    getAttributeFieldBusinessPartner: (state) => ({ attribute }) => {
      return state.fields[attribute]
    }
  }
}

export default businessPartner
