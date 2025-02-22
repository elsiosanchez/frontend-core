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
import { collapse } from '@/api/ADempiere/displayDefinition.ts'

// Constants
// import {
//   OPERATOR_BETWEEN, OPERATOR_GREATER_EQUAL, OPERATOR_LESS_EQUAL
// } from '@/utils/ADempiere/dataUtils'
// import { DISPLAY_TYPE_PANEL } from '@/utils/ADempiere/displaDefinition/index.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
// import { getStartAndEndOfCurrentMonth } from '@/utils/ADempiere/valueFormat.js'
import { showMessage } from '@/utils/ADempiere/notification.js'
import { getCurrentRecord } from '@/utils/ADempiere/displayDefinition'

const initState = {
  collapse: {},
  collapsePanelRight: {}
}

const collapseDefinition = {
  state: initState,

  mutations: {
    setCollapseDefinition(state, {
      currentCollapse = {},
      isLoading = false,
      tableName
    }) {
      Vue.set(state.collapse, tableName, {
        currentCollapse,
        isLoading
      })
    },
    setCurrentCollapseDefinition(state, {
      currentCollapse,
      tableName
    }) {
      Vue.set(state.collapse[tableName], 'currentCollapse', currentCollapse)
    },
    setCollapseLoading(state, {
      isLoading,
      tableName
    }) {
      Vue.set(state.collapse[tableName], 'isLoading', isLoading)
    },
    setCollapseFilters(state, {
      filters,
      tableName
    }) {
      Vue.set(state.collapsePanelRight[tableName], 'filters', filters)
    },
    // Panel Right
    setCollapsePanelTabDefinition(state, {
      startStr = null,
      endStr = null,
      currentCollapse = {},
      isLoading = false,
      filters = [],
      columns = [],
      tableName
    }) {
      Vue.set(state.collapsePanelRight, tableName, {
        currentCollapse,
        isLoading,
        startStr,
        filters,
        columns,
        endStr
      })
    },
    setCurrentCollapseRightDefinition(state, {
      currentCollapse,
      tableName
    }) {
      Vue.set(state.collapsePanelRight[tableName], 'currentCollapse', currentCollapse)
    },
    setCollapseRightLoading(state, {
      isLoading,
      tableName
    }) {
      Vue.set(state.collapsePanelRight[tableName], 'isLoading', isLoading)
    }
  },

  actions: {
    requestCollapse({ state, commit, getters }, {
      id,
      filters = [],
      tableName,
      recordId,
      searchValue,
      isPanel = false,
      pageSize,
      pageToken
    }) {
      return new Promise(resolve => {
        if (isPanel) {
          if (isEmptyValue(recordId)) recordId = getCurrentRecord()
          filters = [{ name: [tableName] + '_ID', values: recordId }]
          commit('setCollapsePanelTabDefinition', { tableName, isLoading: true })
        } else {
          commit('setCollapseDefinition', { tableName, isLoading: true })
        }
        collapse({
          id,
          filters: JSON.stringify(filters),
          searchValue,
          pageSize,
          pageToken
        })
          .then(response => {
            if (isPanel) {
              commit('setCollapsePanelTabDefinition', {
                tableName,
                currentCollapse: response
              })
            } else {
              commit('setCollapseDefinition', {
                tableName,
                currentCollapse: response
              })
            }
            resolve(response)
          })
          .catch(error => {
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            console.warn(`Error Getting Update Shipment Line: ${error.message}. Code: ${error.code}.`)
          })
          .finally(() => {
            if (isPanel) {
              commit('setCollapseRightLoading', { tableName, isLoading: false })
            } else {
              commit('setCollapseLoading', { tableName, isLoading: false })
            }
          })
      })
    }
  },

  getters: {
    getCollapsePanel: (state) => ({
      tableName,
      isPanel = false
    }) => {
      if (isPanel) return state.collapsePanelRight[tableName]
      return state.collapse[tableName]
    },
    getCollapseDefinition: (state) => ({ tableName }) => {
      return state.collapse[tableName]
    },
    getCollapseLoading: (state, getters) => ({ tableName }) => {
      const collapseDefinition = getters.getCollapseDefinition({
        tableName
      })
      if (isEmptyValue(collapseDefinition)) return []
      return collapseDefinition.isLoading
    },
    getCurrentCollapseDefinition: (state, getters) => ({ tableName }) => {
      const collapseDefinition = getters.getCollapseDefinition({
        tableName
      })
      if (isEmptyValue(collapseDefinition)) return {}
      return collapseDefinition.currentCollapse
    },
    // Panel Right
    getCollapsePanelRightDefinitions: (state) => ({ tableName }) => {
      return state.collapsePanelRight[tableName]
    },
    getCollapsePanelRightLoading: (state, getters) => ({ tableName }) => {
      const collapsePanelRightDefinition = getters.getCollapsePanelRightDefinitions({
        tableName
      })
      if (isEmptyValue(collapsePanelRightDefinition)) return []
      return collapsePanelRightDefinition.isLoading
    },
    getCurrentCollapsePanelRightDefinition: (state, getters) => ({ tableName }) => {
      const collapsePanelRightDefinition = getters.getCollapsePanelRightDefinitions({
        tableName
      })
      if (isEmptyValue(collapsePanelRightDefinition)) return {}
      return collapsePanelRightDefinition.currentCollapse
    }
  }
}

export default collapseDefinition
