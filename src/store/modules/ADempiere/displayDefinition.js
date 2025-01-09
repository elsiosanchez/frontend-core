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

import {
  displayDefinitions, displayDefinitionsExists
} from '@/api/ADempiere/displayDefinition.ts'

const initState = {
  definition: [],
  tabOptions: []
}

const displayDefinition = {
  state: initState,
  mutations: {
    setDisplayDefinition(state, value) {
      state.definition = value
    },
    setTabOptions(state, value) {
      state.tabOptions = value
    }
  },
  actions: {
    getDisplayDefinition({ commit }, {
      tableName
    }) {
      return new Promise(resolve => {
        displayDefinitionsExists({
          tableName
        })
          .then(response => {
            const { record_count } = response
            if (record_count > 0) {
              displayDefinitions({
                tableName
              })
                .then(definition => {
                  const { records } = definition
                  commit('setDisplayDefinition', records)
                  resolve(records)
                })
            }
          })
      })
    }
  },
  getters: {
    getDefinition: (state) => {
      return state.definition
    },
    getTabOptions: (state) => {
      return state.tabOptions
    }
  }
}

export default displayDefinition
