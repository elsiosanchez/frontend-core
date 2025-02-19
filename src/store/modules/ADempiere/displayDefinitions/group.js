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
import { group } from '@/api/ADempiere/displayDefinition.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
import { showMessage } from '@/utils/ADempiere/notification.js'
import { getCurrentRecord } from '@/utils/ADempiere/displayDefinition'

const initState = {
  group: {},
  groupsePanelRight: {}
}

const groupDefinition = {
  state: initState,

  mutations: {
    setGroupDefinition(state, {
      currentGroup = {},
      isLoading = false,
      tableName
    }) {
      Vue.set(state.group, tableName, {
        currentGroup,
        isLoading
      })
    },
    setCurrentGroupDefinition(state, {
      currentGroup,
      tableName
    }) {
      Vue.set(state.group[tableName], 'group', currentGroup)
    },
    setGroupLoading(state, {
      isLoading,
      tableName
    }) {
      Vue.set(state.group[tableName], 'isLoading', isLoading)
    },
    // Panel Right
    setGroupPanelTabDefinition(state, {
      currentGroup = {},
      isLoading = false,
      filters = [],
      columns = [],
      tableName
    }) {
      Vue.set(state.groupsePanelRight, tableName, {
        currentGroup,
        isLoading,
        filters,
        columns
      })
    },
    setCurrentGroupRightDefinition(state, {
      currentGroup,
      tableName
    }) {
      Vue.set(state.groupsePanelRight[tableName], 'currentGroup', currentGroup)
    },
    setGroupRightLoading(state, {
      isLoading,
      tableName
    }) {
      Vue.set(state.groupsePanelRight[tableName], 'isLoading', isLoading)
    }
  },
  actions: {
    requestGroup({ commit }, {
      id,
      filters = [],
      tableName,
      recordId,
      searchValue,
      isPanel = false
    }) {
      return new Promise(resolve => {
        if (isPanel) {
          if (isEmptyValue(recordId)) recordId = getCurrentRecord()
          filters = [{ name: [tableName] + '_ID', values: recordId }]
          commit('setGroupPanelTabDefinition', { tableName, isLoading: true })
        } else {
          commit('setGroupDefinition', { tableName, isLoading: true })
        }
        group({
          id,
          filters: JSON.stringify(filters),
          searchValue
        })
          .then(response => {
            if (isPanel) {
              commit('setGroupPanelTabDefinition', {
                tableName,
                currentGroup: response
              })
            } else {
              commit('setGroupDefinition', {
                tableName,
                currentGroup: response
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
              commit('setGroupRightLoading', { tableName, isLoading: false })
            } else {
              commit('setGroupLoading', { tableName, isLoading: false })
            }
          })
      })
    }
  },
  getters: {
    getGroupPanel: (state) => ({
      tableName,
      isPanel = false
    }) => {
      if (isPanel) return state.groupsePanelRight[tableName]
      return state.group[tableName]
    },
    getGroupDefinition: (state) => ({ tableName }) => {
      return state.group[tableName]
    },
    getGroupLoading: (state, getters) => ({ tableName }) => {
      const groupDefinition = getters.getGroupDefinition({
        tableName
      })
      if (isEmptyValue(groupDefinition)) return []
      return groupDefinition.isLoading
    },
    getCurrentGroupDefinition: (state, getters) => ({ tableName }) => {
      const groupDefinition = getters.getGroupDefinition({
        tableName
      })
      if (isEmptyValue(groupDefinition)) return {}
      return groupDefinition.currentGroup
    },
    // Panel Right
    getGroupPanelRightDefinitions: (state) => ({ tableName }) => {
      return state.groupsePanelRight[tableName]
    },
    getGroupPanelRightLoading: (state, getters) => ({ tableName }) => {
      const groupPanelRightDefinition = getters.getGroupPanelRightDefinitions({
        tableName
      })
      if (isEmptyValue(groupPanelRightDefinition)) return []
      return groupPanelRightDefinition.isLoading
    },
    getCurrentGroupPanelRightDefinition: (state, getters) => ({ tableName }) => {
      const groupPanelRightDefinition = getters.getGroupPanelRightDefinitions({
        tableName
      })
      if (isEmptyValue(groupPanelRightDefinition)) return {}
      return groupPanelRightDefinition.currentGroup
    }
  }
}

export default groupDefinition
