/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
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
  getRecordAccessRequest
} from '@/api/ADempiere/record-management/record-access.js'

import { isEmptyValue } from '@/utils/ADempiere'

const initStateRecordAccess = {
  listRecordAccess: [],
  showRecordAccess: false
}

const containerInfo = {
  state: initStateRecordAccess,

  mutations: {
    setRecordAccess(state, payload) {
      state.listRecordAccess = payload
    },
    setShowRecordAccess(state, payload) {
      state.showRecordAccess = payload
    }
  },

  actions: {
    loadRecordAccessFromServer({ commit }, {
      tableName,
      recordId,
      recordUuid
    }) {
      if (isEmptyValue(tableName) && (isEmptyValue(recordId) || isEmptyValue(recordUuid))) {
        return
      }
      return getRecordAccessRequest({
        tableName,
        recordId,
        recordUuid
      })
        .then(response => {
          commit('setRecordAccess', response)
          return response
        })
        .catch(error => {
          console.warn(`Error getting List Record Access: ${error.message}. Code: ${error.code}.`)
        })
    },
    showPanel({ commit }, show) {
      commit('setShowRecordAccess', show)
    }
  },

  getters: {
    getRecordAccess: (state) => {
      return state.listRecordAccess
    },
    getShowPanelRecordAccess: (state) => {
      return state.showRecordAccess
    }
  }
}

export default containerInfo
