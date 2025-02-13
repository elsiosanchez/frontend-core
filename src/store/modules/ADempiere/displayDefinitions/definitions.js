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
  displayDefinitions as listDefinitions,
  displayDefinitionsExists
} from '@/api/ADempiere/displayDefinition.ts'

// Utils and Helpers Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

const initState = {
  displayTabDefinitions: {},
  displayPanelRightDefinitions: {},
  currentListDefinition: [],
  displayFilters: {},
  currentDefinitions: {
    Kanban: {},
    Workflow: {},
    Timeline: {},
    Calendar: {},
    Resource: {}
  },
  emtpyDefinitions: {
    currentDefinition: {},
    listDefinitions: []
  }
}

const displayTabDefinition = {
  state: initState,

  mutations: {
    setDisplayFilters(state, {
      tableName,
      filters = []
    }) {
      if (!state.displayFilters[tableName]) {
        Vue.set(state.displayFilters, tableName, { filters: [] })
      }
      Vue.set(state.displayFilters, tableName, {
        filters
      })
    },
    setCurrentDefinition(state, { type, tableName, key, value }) {
      if (!state.currentDefinitions[type][tableName]) {
        Vue.set(state.currentDefinitions[type], tableName, { list: [] })
      }
      Vue.set(state.currentDefinitions[type][tableName], key, value)
    },
    setCurrentListDefinition(state, { tableName, tabName, current }) {
      if (!state.currentListDefinition[tableName]) {
        Vue.set(state.currentListDefinition, tableName, {})
      }
      Vue.set(state.currentListDefinition[tableName], tabName, current)
    },
    setDisplayTabDefinition(state, {
      currentDefinition = {},
      listDefinitions = [],
      tableName
    }) {
      Vue.set(state.displayTabDefinitions, tableName, {
        currentDefinition,
        listDefinitions
      })
    },
    setCurrentTabDefinition(state, {
      currentDefinition,
      tableName
    }) {
      Vue.set(state.displayTabDefinitions[tableName], 'currentDefinition', currentDefinition)
    },
    // Panel Right
    setDisplayPanelRightDefinition(state, {
      currentDefinition = {},
      listDefinitions = [],
      tableName
    }) {
      Vue.set(state.displayPanelRightDefinitions, tableName, {
        currentDefinition,
        listDefinitions
      })
    },
    setCurrentPanelRightDefinition(state, {
      currentDefinition,
      tableName
    }) {
      Vue.set(state.displayPanelRightDefinitions[tableName], 'currentDefinition', currentDefinition)
    }
  },

  actions: {
    displayTabDefinition({ commit }, {
      tableName
    }) {
      return new Promise(resolve => {
        displayDefinitionsExists({
          tableName
        })
          .then(response => {
            const { record_count } = response
            if (record_count > 0) {
              listDefinitions({
                tableName
              })
                .then(definition => {
                  const { records } = definition
                  commit('setDisplayTabDefinition', {
                    tableName,
                    listDefinitions: records
                  })
                  resolve(records)
                })
            }
          })
      })
    },
    displayPanelRightDefinitions({
      commit
    }, {
      tableName,
      onlyeReferences = true
    }) {
      return new Promise(resolve => {
        listDefinitions({
          tableName,
          onlyeReferences
        })
          .then(definition => {
            const { records } = definition
            commit('setDisplayPanelRightDefinition', {
              tableName,
              listDefinitions: records
            })
            const displayLists = {
              Kanban: records.filter(data => data.display_type === 'K'),
              Timeline: records.filter(data => data.display_type === 'T'),
              Workflow: records.filter(data => data.display_type === 'W'),
              Calendar: records.filter(data => data.display_type === 'C'),
              Resource: records.filter(data => data.display_type === 'R'),
              Collapse: records.filter(data => data.display_type === 'E')
            }
            Object.entries(displayLists).forEach(([type, list]) => {
              commit('setCurrentDefinition', { type, tableName, key: 'list', value: list })
            })

            resolve(records)
          })
      })
    },
    changeTabPanelRightDefinition({ commit, dispatch, getters }, {
      filters,
      recordId,
      tableName,
      definition,
      isPanelRight = false
    }) {
      dispatch('updateDefinition', {
        tableName,
        definition,
        isPanelRight
      })
      // Get Filter the Definition
      const filtersList = getters.getDisplayFilters({
        tableName
      })
      if (definition.display_type === 'K') {
        dispatch('requestKanban', {
          id: definition.id,
          isPanel: isPanelRight,
          tableName,
          recordId,
          filters: filtersList
        })
      }
      if (definition.display_type === 'C') {
        dispatch('changeDateCalendar', {
          id: definition.id,
          isPanel: isPanelRight,
          tableName,
          recordId,
          filters: filtersList
        })
      }
      if (definition.display_type === 'T') {
        dispatch('requestTimeLine', {
          id: definition.id,
          tableName,
          recordId,
          filters: filtersList
        })
      }
      if (definition.display_type === 'W') {
        dispatch('requestWorkflow', {
          id: definition.id,
          tableName,
          recordId,
          filters: filtersList
        })
      }
      if (definition.display_type === 'E') {
        dispatch('requestCollapse', {
          id: definition.id,
          tableName,
          recordId,
          filters: filtersList
        })
      }
      dispatch('listDisplayDefinitionFieldsMetadata', {
        id: definition.id
      })
    },
    updateDefinition({
      commit
    }, {
      tableName,
      definition,
      isPanelRight
    }) {
      const panelToUpgrade = isPanelRight ? 'setCurrentPanelRightDefinition' : 'setCurrentTabDefinition'
      commit(panelToUpgrade, {
        tableName,
        currentDefinition: definition
      })
    }
  },

  getters: {
    getDisplayTabDefinitions: (state) => ({ tableName }) => {
      return state.displayTabDefinitions[tableName]
    },
    getListDisplayTabDefinitions: (state, getters) => ({ tableName }) => {
      const displayTabDefinitions = getters.getDisplayTabDefinitions({
        tableName
      })
      if (isEmptyValue(displayTabDefinitions)) return []
      return displayTabDefinitions.listDefinitions
    },
    getCurrentDisplayTabDefinitions: (state, getters) => ({ tableName }) => {
      const displayTabDefinitions = getters.getDisplayTabDefinitions({
        tableName
      })
      if (isEmptyValue(displayTabDefinitions)) return {}
      return displayTabDefinitions.currentDefinition
    },
    // Panel Right
    getDisplayPanelRightDefinitions: (state) => ({ tableName }) => {
      return state.displayPanelRightDefinitions[tableName]
    },
    getListDisplayPanelRightDefinitions: (state, getters) => ({ tableName }) => {
      const displayDefinitions = getters.getDisplayPanelRightDefinitions({
        tableName
      })
      if (isEmptyValue(displayDefinitions)) return []
      return displayDefinitions.listDefinitions
    },
    getCurrentDisplayPanelRightDefinitions: (state, getters) => ({ tableName }) => {
      const { currentDefinition } = getters.getDisplayPanelRightDefinitions({
        tableName
      })
      return currentDefinition || {}
    },
    getCurrentListDisplay: (state, getters) => ({ tableName, tabName }) => {
      const displayTabDefinitions = state.currentListDefinition[tableName] || {}
      return displayTabDefinitions[tabName] || null
    },
    getListDefinition: (state) => ({ type, tableName }) => {
      return state.currentDefinitions[type]?.[tableName]?.list || []
    },
    getDisplayFilters: (state) => ({ tableName }) => {
      if (state.displayFilters[tableName]) {
        const { filters } = state.displayFilters[tableName]
        return filters || {}
      }
      return {}
    }
  }
}

export default displayTabDefinition
