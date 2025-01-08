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

import { kanbans } from '@/api/ADempiere/displayDefinition.ts'
const initState = {
  panelKanban: false,
  infoKanban: [],
  isLoadingKanban: false
}

const kanban = {
  state: initState,
  mutations: {
    setPanelKanban(state, value) {
      state.panelKanban = value
    },
    setInfoKanvan(state, value) {
      state.infoKanban = value
    },
    setIsLoadingKanban(state, value) {
      state.isLoadingKanban = value
    }
  },
  actions: {
    searchPanelKanban({ commit }, {
      id,
      filters,
      searchValue
    }) {
      commit('setIsLoadingKanban', true)
      return new Promise(resolve => {
        kanbans({
          id,
          filters,
          searchValue
        })
          .then(response => {
            commit('setInfoKanvan', response)
            resolve(response)
          })
          .finally(() => {
            commit('setIsLoadingKanban', false)
          })
      })
    }
  },
  getters: {
    getPanelKanban: (state) => {
      return state.panelKanban
    },
    getInfoKanban: (state) => {
      return state.infoKanban
    },
    getIsLoadingKanban: (state) => {
      return state.isLoadingKanban
    }
  }
}

export default kanban
