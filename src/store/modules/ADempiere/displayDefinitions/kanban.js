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
import { kanbans } from '@/api/ADempiere/displayDefinition.ts'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
import { showMessage } from '@/utils/ADempiere/notification.js'
// Constants
// import { DISPLAY_TYPE_PANEL } from '@/utils/ADempiere/displaDefinition/index.ts'

const initState = {
  kanban: {},
  kanbanPanelRight: {},
  emtpyKanban: {
    currentkanban: {},
    isLoading: false,
    columns: [],
    filters: []
  }
}

const kanbanDefinition = {
  state: initState,

  mutations: {
    setKanbanDefinition(state, {
      currentkanban = {},
      isLoading = false,
      filters = [],
      columns = [],
      tableName
    }) {
      Vue.set(state.kanban, tableName, {
        currentkanban,
        isLoading,
        filters,
        columns
      })
    },
    setCurrentKanbanDefinition(state, {
      currentkanban,
      tableName
    }) {
      Vue.set(state.kanban[tableName], 'currentkanban', currentkanban)
    },
    setKanbanLoading(state, {
      isLoading,
      tableName
    }) {
      Vue.set(state.kanban[tableName], 'isLoading', isLoading)
    },
    setKanbanColumns(state, {
      columns,
      tableName
    }) {
      Vue.set(state.kanban[tableName], 'columns', columns)
    },
    // Panel Right
    setKanbanPanelTabDefinition(state, {
      currentkanban = {},
      isLoading = false,
      filters = [],
      columns = [],
      tableName
    }) {
      Vue.set(state.kanbanPanelRight, tableName, {
        currentkanban,
        isLoading,
        filters,
        columns
      })
    },
    setCurrentKanbanRightDefinition(state, {
      currentkanban,
      tableName
    }) {
      Vue.set(state.kanbanPanelRight[tableName], 'currentkanban', currentkanban)
    },
    setKanbanRightLoading(state, {
      isLoading,
      tableName
    }) {
      Vue.set(state.kanbanPanelRight[tableName], 'isLoading', isLoading)
    }
  },

  actions: {
    requestKanban({ commit }, {
      id,
      filters = [],
      tableName,
      searchValue,
      isPanel = false
    }) {
      return new Promise(resolve => {
        if (isPanel) {
          commit('setKanbanPanelTabDefinition', { tableName, isLoading: true })
        } else {
          commit('setKanbanDefinition', { tableName, isLoading: true })
        }

        kanbans({
          id,
          filters: JSON.stringify(filters),
          searchValue
        })
          .then(response => {
            if (isPanel) {
              commit('setCurrentKanbanRightDefinition', {
                tableName,
                currentkanban: response
              })
            } else {
              commit('setCurrentKanbanDefinition', {
                tableName,
                currentkanban: response
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
              commit('setKanbanRightLoading', { tableName, isLoading: false })
            } else {
              commit('setKanbanLoading', { tableName, isLoading: false })
            }
          })
      })
    }
  },

  getters: {
    getKanbanPanel: (state) => ({
      tableName,
      isPanel = false
    }) => {
      if (isPanel) return state.kanbanPanelRight[tableName]
      return state.kanban[tableName]
    },
    getKanbanDefinition: (state) => ({ tableName }) => {
      return state.kanban[tableName]
    },
    getKanbanLoading: (state, getters) => ({ tableName }) => {
      const kanbanDefinition = getters.getKanbanDefinition({
        tableName
      })
      if (isEmptyValue(kanbanDefinition)) return []
      return kanbanDefinition.isLoading
    },
    getCurrentKanbanDefinition: (state, getters) => ({ tableName }) => {
      const kanbanDefinition = getters.getKanbanDefinition({
        tableName
      })
      if (isEmptyValue(kanbanDefinition)) return {}
      return kanbanDefinition.currentkanban
    },
    getKanbanColumnsDefinition: (state, getters) => ({ tableName }) => {
      const kanbanDefinition = getters.getKanbanDefinition({
        tableName
      })
      if (isEmptyValue(kanbanDefinition)) return {}
      return kanbanDefinition.columns
    },
    // Panel Right
    getKanbanPanelRightDefinitions: (state) => ({ tableName }) => {
      return state.kanbanPanelRight[tableName]
    },
    getKanbanPanelRightLoading: (state, getters) => ({ tableName }) => {
      const kanbanPanelRightDefinition = getters.getKanbanPanelRightDefinitions({
        tableName
      })
      if (isEmptyValue(kanbanPanelRightDefinition)) return []
      return kanbanPanelRightDefinition.isLoading
    },
    getCurrentKanbanPanelRightDefinition: (state, getters) => ({ tableName }) => {
      const kanbanPanelRightDefinition = getters.getKanbanPanelRightDefinitions({
        tableName
      })
      if (isEmptyValue(kanbanPanelRightDefinition)) return {}
      return kanbanPanelRightDefinition.currentkanban
    }
  }
}

export default kanbanDefinition
