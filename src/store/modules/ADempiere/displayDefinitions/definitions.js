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
  emtpyDefinitions: {
    currentDefinition: {},
    listDefinitions: []
  }
}

const displayTabDefinition = {
  state: initState,

  mutations: {
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
            resolve(records)
          })
      })
    },
    changeTabPanelRightDefinition({ commit, dispatch }, {
      filters,
      recordId,
      tableName,
      definition,
      isPanelRight = false
    }) {
      if (isPanelRight) {
        commit('setCurrentPanelRightDefinition', {
          tableName,
          currentDefinition: definition
        })
      } else {
        commit('setCurrentTabDefinition', {
          tableName,
          currentDefinition: definition
        })
      }
      if (definition.display_type === 'K') {
        dispatch('requestKanban', {
          id: definition.id,
          isPanel: isPanelRight,
          tableName,
          filters
        })
      }
      if (definition.display_type === 'C') {
        dispatch('changeDateCalendar', {
          id: definition.id,
          isPanel: isPanelRight,
          tableName,
          recordId,
          filters
        })
      }
      if (definition.display_type === 'T') {
        dispatch('requestTimeLine', {
          id: definition.id,
          tableName,
          filters
        })
      }
      if (definition.display_type === 'W') {
        dispatch('requestWorkflow', {
          id: definition.id,
          tableName,
          filters
        })
      }
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
    }
  }
}

export default displayTabDefinition
