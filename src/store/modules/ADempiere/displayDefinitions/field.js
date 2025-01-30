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
import {
  listDisplayDefinitionFieldsMetadata,
  readDataEntry,
  updateDataEntry,
  createDataEntry,
  deleteDataEntry
} from '@/api/ADempiere/displayDefinition.ts'

// Utils and Helpers Methods
import { evalutateTypeField } from '@/utils/ADempiere/dictionaryUtils'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showMessage } from '@/utils/ADempiere/notification.js'

const initState = {
  currentTabDefinition: {},
  displayDefinitionFields: {},
  panelView: {},
  showPanel: false
}

const displayDefinitionField = {
  state: initState,

  mutations: {
    setShowPanel(state, show) {
      state.showPanel = show
    },
    setCurrentTabPanelDefinition(state, { type, additionalAttributes = {}}) {
      state.currentTabDefinition = {
        type,
        additionalAttributes
      }
    },
    // Display Definitions Fields
    setDisplayTabDefinitionMetadata(state, {
      id,
      fields = [],
      isLoading = false,
      isErrorLoad = false
    }) {
      Vue.set(state.displayDefinitionFields, id, {
        fields,
        isLoading,
        isErrorLoad
      })
    },
    setDisplayTabDefinitionLoading(state, {
      id,
      isLoading = false
    }) {
      Vue.set(state.displayDefinitionFields[id], 'isLoading', isLoading)
    },
    setDisplayTabDefinitionFields(state, {
      id,
      fields = []
    }) {
      Vue.set(state.displayDefinitionFields[id], 'fields', fields)
    },
    // Get Record Data
    setRecordValuesData(state, {
      recordId,
      data = {},
      isLoading = false
    }) {
      Vue.set(state.panelView, recordId, {
        data,
        isLoading
      })
    },
    setRecordDate(state, {
      recordId,
      data = {}
    }) {
      Vue.set(state.panelView[recordId], 'data', data)
    },
    setRecordDataLoading(state, {
      recordId,
      isLoading = false
    }) {
      Vue.set(state.panelView[recordId], 'isLoading', isLoading)
    }
  },

  actions: {
    listDisplayDefinitionFieldsMetadata({ commit, getters }, {
      id
    }) {
      return new Promise(resolve => {
        commit('setDisplayTabDefinitionMetadata', {
          id,
          isLoading: true
        })
        listDisplayDefinitionFieldsMetadata({
          id
        })
          .then(fieldsResponse => {
            const { field_definitions } = fieldsResponse
            let listFields = []
            if (!isEmptyValue(field_definitions)) {
              listFields = field_definitions.map(field => {
                const { display_type } = field
                return {
                  ...field,
                  value: '',
                  is_show_components: false,
                  componentPath: evalutateTypeField(display_type).componentPath
                }
              })
            }
            commit('setDisplayTabDefinitionFields', {
              id,
              fields: listFields
            })
            resolve(listFields)
          })
          .catch(error => {
            commit('setDisplayTabDefinitionFields', {
              id,
              fields: []
            })
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            console.warn(`Error Getting Update Shipment Line: ${error.message}. Code: ${error.code}.`)
          })
          .finally(() => {
            commit('setDisplayTabDefinitionLoading', {
              id,
              isLoading: false
            })
          })
      })
    },
    changeTabPanelDefinition({
      commit,
      getters,
      dispatch
    }, {
      id,
      recordId,
      type,
      additionalAttributes = {}
    }) {
      const getRecordValuesData = getters.getRecordValuesData({ recordId })
      commit('setCurrentTabPanelDefinition', {
        type,
        additionalAttributes
      })
      if (!isEmptyValue(getRecordValuesData) && !isEmptyValue(getRecordValuesData.data)) {
        return
      }
      if (typeof recordId !== 'number') {
        return
      }
      dispatch('readRecordData', {
        recordId,
        displayDefinitionId: id
      })
    },
    readRecordData({ commit }, {
      recordId,
      displayDefinitionId
    }) {
      return new Promise((resolve, reject) => {
        if (isEmptyValue(recordId)) {
          return resolve()
        }
        commit('setRecordValuesData', {
          recordId,
          isLoading: true
        })
        readDataEntry({
          id: recordId,
          displayDefinitionId
        })
          .then(responseData => {
            commit('setRecordValuesData', {
              recordId,
              data: responseData
            })
          })
          .catch(error => {
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            console.warn(`Error in Opting for Registry Data: ${error.message}. Code: ${error.code}.`)
            reject(error)
          })
          .finally(() => {
            commit('setRecordDataLoading', {
              recordId,
              isLoading: false
            })
          })
      })
    },
    updateField({ commit }, {
      id,
      attributes,
      displayDefinitionId
    }) {
      return new Promise((resolve, reject) => {
        updateDataEntry({
          id,
          attributes,
          displayDefinitionId
        })
          .then(response => {
            commit('setRecordValuesData', {
              recordId: id,
              data: response
            })
            resolve(response)
          })
          .catch(error => {
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            console.warn(`Error Getting Update Field Display Definition: ${error.message}. Code: ${error.code}.`)
            reject(error)
          })
          .finally(() => {
            resolve()
          })
      })
    },
    saveRecord({ commit }, {
      attributes,
      displayDefinitionId
    }) {
      return new Promise((resolve, reject) => {
        createDataEntry({
          attributes,
          displayDefinitionId
        })
          .then(response => {
            resolve(response)
          })
          .catch(error => {
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            console.warn(`Error Getting Update Field Display Definition: ${error.message}. Code: ${error.code}.`)
            reject(error)
          })
          .finally(() => {
            resolve()
          })
      })
    },
    removerRecord({ commit }, {
      recordId,
      displayDefinitionId
    }) {
      return new Promise((resolve, reject) => {
        deleteDataEntry({
          id: recordId,
          displayDefinitionId
        })
          .then(response => {
            resolve(response)
          })
          .catch(error => {
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            console.warn(`Error Delete Record Display Definition: ${error.message}. Code: ${error.code}.`)
            reject(error)
          })
          .finally(() => {
            resolve()
          })
      })
    }
  },

  getters: {
    getShowPanel: (state) => {
      return state.showPanel
    },
    getCurrentTabPanelDefinition: (state) => {
      return state.currentTabDefinition || {}
    },
    getDisplayTabDefinition: (state) => ({ id }) => {
      return state.displayDefinitionFields[id] || []
    },
    getRecordValuesData: (state) => ({ recordId }) => {
      return state.panelView[recordId] && state.panelView[recordId] || {}
    },
    getRecordLoading: (state) => ({ recordId }) => {
      return state.panelView[recordId] && state.panelView[recordId].isLoading || false
    }
  }
}

export default displayDefinitionField
