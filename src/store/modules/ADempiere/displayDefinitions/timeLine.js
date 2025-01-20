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
import { timeLines } from '@/api/ADempiere/displayDefinition.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
import { showMessage } from '@/utils/ADempiere/notification.js'

const initState = {
  timeLine: {},
  emtpyTimeLine: {
    currentTimeLine: {},
    isLoading: false
  }
}

const timeLineDefinition = {
  state: initState,

  mutations: {
    setTimeLineDefinition(state, {
      currentTimeLine = {},
      isLoading = false,
      tableName
    }) {
      Vue.set(state.timeLine, tableName, {
        currentTimeLine,
        isLoading,
        tableName
      })
    },
    setCurrentTimeLineDefinition(state, {
      currentTimeLine,
      tableName
    }) {
      Vue.set(state.timeLine[tableName], 'currentTimeLine', currentTimeLine)
    },
    setTimeLineLoading(state, {
      isLoading,
      tableName
    }) {
      Vue.set(state.timeLine[tableName], 'isLoading', isLoading)
    }
  },
  actions: {
    requestTimeLine({ commit }, {
      id,
      filters = [],
      searchValue,
      tableName
    }) {
      return new Promise(resolve => {
        commit('setTimeLineDefinition', { tableName, isLoading: true })
        timeLines({
          id,
          filters: JSON.stringify(filters),
          searchValue
        })
          .then(response => {
            if (!isEmptyValue(response) && !isEmptyValue(response.records)) {
              const { records	} = response
              commit('setCurrentTimeLineDefinition', {
                tableName,
                currentTimeLine: records
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
            commit('setTimeLineLoading', { tableName, isLoading: false })
          })
      })
    }
  },
  getters: {
    getTimeLineDefinition: (state) => ({ tableName }) => {
      return state.timeLine[tableName]
    },
    getTimeLineLoading: (state, getters) => ({ tableName }) => {
      const timeLineDefinition = getters.getTimeLineDefinition({
        tableName
      })
      if (isEmptyValue(timeLineDefinition)) return []
      return timeLineDefinition.isLoading
    },
    getCurrentTimeLineDefinition: (state, getters) => ({ tableName }) => {
      const timeLineDefinition = getters.getTimeLineDefinition({
        tableName
      })
      if (isEmptyValue(timeLineDefinition)) return {}
      return timeLineDefinition.currentTimeLine
    }
  }
}

export default timeLineDefinition
