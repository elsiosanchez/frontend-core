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
import language from '@/lang'
// API Request Methods
import {
  listDisplayDefinitionFieldsMetadata,
  readDataEntry,
  updateDataEntry,
  createDataEntry,
  deleteDataEntry,
  createDataEntryResource,
  readDataEntryResource,
  updateDataEntryResource,
  deleteDataEntryResource
} from '@/api/ADempiere/displayDefinition.ts'

// Utils and Helpers Methods
import { evalutateTypeField } from '@/utils/ADempiere/dictionary/field'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showMessage } from '@/utils/ADempiere/notification.js'

const initState = {
  showDeleteConfirmation: false,
  currentTabDefinition: {},
  displayDefinitionFields: {},
  panelView: {},
  showPanel: {}
}

const displayDefinitionField = {
  state: initState,

  mutations: {
    setShowDeleteConfirmation(state, show) {
      state.showDeleteConfirmation = show
    },
    setShowPanel(state, {
      id,
      show
    }) {
      Vue.set(state.showPanel, id, show)
    },
    setCurrentTabPanelDefinition(state, {
      type,
      currentAttributes = {},
      displyDefinitions = {},
      additionalAttributes = {}
    }) {
      state.currentTabDefinition = {
        type,
        displyDefinitions,
        additionalAttributes,
        currentAttributes
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
      displyDefinitions,
      recordId,
      type,
      currentAttributes = {},
      additionalAttributes = {}
    }) {
      commit('setCurrentTabPanelDefinition', {
        type,
        currentAttributes,
        displyDefinitions,
        additionalAttributes
      })
      if (typeof recordId !== 'number') {
        return
      }
      if (type === 'view') {
        dispatch('readRecordData', {
          recordId,
          displayDefinitionId: displyDefinitions.id,
          isResource: displyDefinitions.is_resource
        })
      }
    },

    /**
     * CRUD Data Entry and CRUD Data Entry with Resource
     */

    readRecordData({ commit }, {
      recordId,
      isResource = false,
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
        // Determines the function to use according to the value of `isResource`.
        const createFunction = isResource ? readDataEntryResource : readDataEntry
        // Call the corresponding function
        createFunction({
          id: recordId,
          displayDefinitionId
        })
          .then(responseData => {
            // Resolve the promise with the successful answer
            commit('setRecordValuesData', {
              recordId,
              data: responseData
            })
          })
          .catch(error => {
            // Displays an error message to the user
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            // Logs the error to the console for debugging
            console.warn(`Error in Opting for Registry Data: ${error.message}. Code: ${error.code}.`)
            reject(error)
          })
          .finally(() => {
            // Ensures that the pledge is always resolved, even if there is an error
            commit('setRecordDataLoading', {
              recordId,
              isLoading: false
            })
            resolve()
          })
      })
    },
    updateField({ commit }, {
      id,
      attributes,
      isResource = false,
      displayDefinitionId
    }) {
      return new Promise((resolve, reject) => {
        // Determines the function to use according to the value of `isResource`.
        const updateEntryRecordFunction = isResource ? updateDataEntryResource : updateDataEntry
        // Call the corresponding function
        updateEntryRecordFunction({
          id,
          attributes,
          displayDefinitionId
        })
          .then(response => {
            // Resolve the promise with the successful answer
            commit('setRecordValuesData', {
              recordId: id,
              data: response
            })
            showMessage({
              message: language.t('recordManager.updatedRecord'),
              type: 'success'
            })
            resolve(response)
          })
          .catch(error => {
            // Displays an error message to the user
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            // Logs the error to the console for debugging
            console.warn(`Error Getting Update Field Display Definition: ${error.message}. Code: ${error.code}.`)
            reject(error)
          })
          .finally(() => {
            // Ensures that the pledge is always resolved, even if there is an error
            resolve()
          })
      })
    },
    saveRecord({ commit }, {
      contextAttributes,
      attributes,
      isResource = false,
      displayDefinitionId
    }) {
      return new Promise((resolve, reject) => {
        // Determines the function to use according to the value of `isResource`.
        const createEntryRecordFunction = isResource ? createDataEntryResource : createDataEntry
        // Call the corresponding function
        createEntryRecordFunction({
          contextAttributes,
          attributes,
          displayDefinitionId
        })
          .then(response => {
            // Resolve the promise with the successful answer
            showMessage({
              message: language.t('data.createRecordSuccessful'),
              type: 'success'
            })
            resolve(response)
          })
          .catch(error => {
            // Displays an error message to the user
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            // Logs the error to the console for debugging
            console.warn(`Error Getting Update Field Display Definition: ${error.message}. Code: ${error.code}.`)
            reject(error)
          })
          .finally(() => {
            // Ensures that the pledge is always resolved, even if there is an error
            resolve()
          })
      })
    },
    removerRecord({ commit }, {
      recordId,
      isResource = false,
      displayDefinitionId
    }) {
      return new Promise((resolve, reject) => {
        // Determines the function to use according to the value of `isResource`.
        const createFunction = isResource ? deleteDataEntryResource : deleteDataEntry
        // Call the corresponding function
        createFunction({
          id: recordId,
          displayDefinitionId
        })
          .then(response => {
            // Resolve the promise with the successful answer
            showMessage({
              message: language.t('recordManager.deleteRecordSuccessful'),
              type: 'success'
            })
            resolve(response)
          })
          .catch(error => {
            // Displays an error message to the user
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            // Logs the error to the console for debugging
            console.warn(`Error Delete Record Display Definition: ${error.message}. Code: ${error.code}.`)
            reject(error)
          })
          .finally(() => {
            // Ensures that the pledge is always resolved, even if there is an error
            resolve()
          })
      })
    }
  },

  getters: {
    getShowPanel: (state) => ({ id }) => {
      return state.showPanel[id] || false
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
    },
    getShowDeleteConfirmation: (state) => {
      return state.showDeleteConfirmation
    }
  }
}

export default displayDefinitionField
