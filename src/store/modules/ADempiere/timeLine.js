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

import { timeLines } from '@/api/ADempiere/displayDefinition.ts'
const initState = {
  infoTimeLine: [],
  currentTimeLineDefinitions: {}
}

const timeLine = {
  state: initState,
  mutations: {
    setInfoTimeLine(state, value) {
      state.infotimeLine = value
    },
    setDefinitionsTimeLine(state, value) {
      state.currentTimeLineDefinitions = value
    }
  },
  actions: {
    searchPanelTimeLine({ commit }, {
      id,
      filters
    }) {
      return new Promise(resolve => {
        timeLines({
          id,
          filters
        })
          .then(response => {
            const { records } = response
            commit('setInfoTimeLine', records)
            resolve(records)
          })
      })
    },
    currentTimeLineDefinitions({ commit }, definitions) {
      commit('setDefinitionsTimeLine', definitions)
    }
  },
  getters: {
    getInfoTimeLine: (state) => {
      return state.infotimeLine
    },
    getCurrentTimeLineDefinitions: (state) => {
      return state.currentTimeLineDefinitions
    }
  }
}

export default timeLine
