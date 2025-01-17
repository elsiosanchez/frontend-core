/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Ricardo Fenomeno ricardofenomeno13@gmail.com https://github.com/Ricrgame
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

import { kanbans } from '@/api/ADempiere/displayDefinition.ts'
import { isEmptyValue } from '@/utils/ADempiere'
const initState = {
  tabInfoKanban: [],
  panelKanban: {},
  infoKanban: [],
  isLoadingKanban: false,
  filters: [],
  currentKanbanDefinitions: {}
}

const kanban = {
  state: initState,
  mutations: {
    setPanelKanban(state, {
      show,
      tableName
    }) {
      Vue.set(state.panelKanban, tableName, show)
    },
    // setPanelKanban(state, value) {
    //   state.panelKanban = value
    // },
    setInfoKanvan(state, value) {
      state.infoKanban = value
    },
    setRecordKanban(state, recordList) {
      state.infoKanban.records = recordList
    },
    setIsLoadingKanban(state, value) {
      state.isLoadingKanban = value
    },
    setFilters(state, value) {
      state.filters = value
    },
    setTabInfoKanban(state, value) {
      state.tabInfoKanban = value
    },
    setDefinitionsKanban(state, definition) {
      state.currentKanbanDefinitions = definition
    }
  },
  actions: {
    searchPanelKanban({ commit, getters }, {
      id,
      filters,
      searchValue,
      isPanel = false
    }) {
      commit('setIsLoadingKanban', true)
      if (!isEmptyValue(filters)) {
        commit('setFilters', filters)
      }
      if (isEmptyValue(filters)) {
        const storeFiltrs = getters.getFilters
        filters = storeFiltrs
      }
      return new Promise(resolve => {
        kanbans({
          id,
          filters,
          searchValue
        })
          .then(response => {
            if (isPanel) {
              commit('setTabInfoKanban', response)
            } else {
              commit('setInfoKanvan', response)
            }
            resolve(response)
          })
          .finally(() => {
            commit('setIsLoadingKanban', false)
          })
      })
    },
    currentKanbanDefinitions({ commit }, definitions) {
      commit('setDefinitionsKanban', definitions)
    }
  },
  getters: {
    getPanelKanban: (state) => ({ tableName }) => {
      return state.panelKanban[tableName] || false
    },
    getInfoKanban: (state) => {
      return state.infoKanban
    },
    getIsLoadingKanban: (state) => {
      return state.isLoadingKanban
    },
    getFilters: (state) => {
      return state.filters
    },
    getTabInfoKanban: (state) => {
      return state.tabInfoKanban
    },
    getCurrentKanbanDefinitions(state) {
      return state.currentKanbanDefinitions
    }
  }
}

export default kanban
