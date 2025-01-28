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
  updateDataEntry
} from '@/api/ADempiere/displayDefinition.ts'

// Utils and Helpers Methods
import { evalutateTypeField } from '@/utils/ADempiere/dictionaryUtils'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showMessage } from '@/utils/ADempiere/notification.js'

const initState = {
  currentTabDefinition: '',
  displayDefinitionFields: {}
}

const displayDefinitionField = {
  state: initState,

  mutations: {
    setCurrentTabPanelDefinition(state, name) {
      state.currentTabDefinition = name
    },
    // Display Definitions Fields
    setDisplayTabDefinitionMetadata(state, {
      id,
      fields = [],
      recordId = 0,
      isLoading = false,
      isErrorLoad = false
    }) {
      Vue.set(state.displayDefinitionFields, [id + '_' + recordId], {
        fields,
        isLoading,
        isErrorLoad
      })
    },
    setDisplayTabDefinitionLoading(state, {
      id,
      recordId = 0,
      isLoading = false
    }) {
      Vue.set(state.displayDefinitionFields[id + '_' + recordId], 'isLoading', isLoading)
    },
    setDisplayTabDefinitionFields(state, {
      id,
      recordId = 0,
      fields = []
    }) {
      Vue.set(state.displayDefinitionFields[id + '_' + recordId], 'fields', fields)
    },
    // Display Definition Record Data
    setDisplayTabDefinitionRecord(state, {
      id,
      recordId,
      fields = [],
      isLoading = false
    }) {
      Vue.set(state.displayDefinitionFields[id], recordId, {
        fields,
        isLoading
      })
    },
    setDisplayTabDefinitionRecordLoading(state, {
      id,
      recordId,
      isLoading = false
    }) {
      Vue.set(state.displayDefinitionFields[id][recordId], 'isLoading', isLoading)
    }
  },

  actions: {
    listDisplayDefinitionFieldsMetadata({ commit, getters }, {
      id,
      recordId
    }) {
      return new Promise(resolve => {
        commit('setDisplayTabDefinitionMetadata', {
          id,
          recordId,
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
              recordId,
              fields: listFields
            })
          })
          .catch(error => {
            commit('setDisplayTabDefinitionFields', {
              id,
              recordId,
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
              recordId,
              isLoading: false
            })
          })
      })
    },
    changeTabPanelDefinition({
      state,
      commit,
      getters,
      dispatch
    }, {
      id,
      recordId,
      name
    }) {
      commit('setCurrentTabPanelDefinition', name)
      const currentDefinition = getters.getDisplayTabDefinition({
        id,
        recordId
      })
      if (!isEmptyValue(currentDefinition)) return
      dispatch('listDisplayDefinitionFieldsMetadata', {
        id,
        name,
        recordId: name === 'new' ? 0 : recordId
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
    }
  },

  getters: {
    getCurrentDisplayDefinitions: (state, getters) => ({ tableName, isPanelRight }) => {
      let panelDefinitions
      if (isPanelRight) {
        panelDefinitions = getters.getCurrentDisplayPanelRightDefinitions({ tableName })
      } else {
        panelDefinitions = getters.getCurrentDisplayTabDefinitions({ tableName })
      }
      return panelDefinitions.currentDefinition || {}
    },
    getCurrentTabPanelDefinition: (state) => {
      return state.currentTabDefinition
    },
    getDisplayTabDefinition: (state) => ({ id, recordId }) => {
      // return state.displayDefinitionFields[id]
      return state.displayDefinitionFields[id + '_' + recordId]
    }
  }
}

export default displayDefinitionField
