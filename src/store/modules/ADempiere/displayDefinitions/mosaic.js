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
import { mosaic } from '@/api/ADempiere/displayDefinition.ts'

// Constants
// import {
//   OPERATOR_BETWEEN, OPERATOR_GREATER_EQUAL, OPERATOR_LESS_EQUAL
// } from '@/utils/ADempiere/dataUtils'
// import { DISPLAY_TYPE_PANEL } from '@/utils/ADempiere/displaDefinition/index.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
// import { getStartAndEndOfCurrentMonth } from '@/utils/ADempiere/valueFormat.js'
import { showMessage } from '@/utils/ADempiere/notification.js'
import { getCurrentRecord } from '@/utils/ADempiere/displayDefinition'

const initState = {
  mosaic: {},
  mosaicPanelRight: {}
}

const mosaicDefinition = {
  state: initState,

  mutations: {
    setMosaicDefinition(state, {
      currentMosaic = {},
      isLoading = false,
      tableName
    }) {
      Vue.set(state.mosaic, tableName, {
        currentMosaic,
        isLoading
      })
    },
    setCurrentMosaicDefinition(state, {
      currentMosaic,
      tableName
    }) {
      Vue.set(state.mosaic[tableName], 'currentMosaic', currentMosaic)
    },
    setMosaicLoading(state, {
      isLoading,
      tableName
    }) {
      Vue.set(state.mosaic[tableName], 'isLoading', isLoading)
    },
    setMosaicFilters(state, {
      filters,
      tableName
    }) {
      Vue.set(state.mosaicPanelRight[tableName], 'filters', filters)
    },
    // Panel Right
    setMosaicPanelTabDefinition(state, {
      startStr = null,
      endStr = null,
      currentMosaic = {},
      isLoading = false,
      filters = [],
      columns = [],
      tableName
    }) {
      Vue.set(state.mosaicPanelRight, tableName, {
        currentMosaic,
        isLoading,
        startStr,
        filters,
        columns,
        endStr
      })
    },
    setCurrentMosaicRightDefinition(state, {
      currentMosaic,
      tableName
    }) {
      Vue.set(state.mosaicPanelRight[tableName], 'currentMosaic', currentMosaic)
    },
    setMosaicRightLoading(state, {
      isLoading,
      tableName
    }) {
      Vue.set(state.mosaicPanelRight[tableName], 'isLoading', isLoading)
    }
  },

  actions: {
    requestMosaic({ state, commit, getters }, {
      id,
      filters = [],
      tableName,
      recordId,
      searchValue,
      isPanel = false,
      pageSize,
      pageToken
    }) {
      return new Promise(resolve => {
        if (isPanel) {
          if (isEmptyValue(recordId)) recordId = getCurrentRecord()
          filters = [{ name: [tableName] + '_ID', values: recordId }]
          commit('setMosaicPanelTabDefinition', { tableName, isLoading: true })
        } else {
          commit('setMosaicDefinition', { tableName, isLoading: true })
        }
        mosaic({
          id,
          filters: JSON.stringify(filters),
          searchValue,
          pageSize,
          pageToken
        })
          .then(response => {
            if (isPanel) {
              commit('setMosaicPanelTabDefinition', {
                tableName,
                currentMosaic: response
              })
            } else {
              commit('setMosaicDefinition', {
                tableName,
                currentMosaic: response
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
              commit('setMosaicRightLoading', { tableName, isLoading: false })
            } else {
              commit('setMosaicLoading', { tableName, isLoading: false })
            }
          })
      })
    }
  },

  getters: {
    getMosaicPanel: (state) => ({
      tableName,
      isPanel = false
    }) => {
      if (isPanel) return state.mosaicPanelRight[tableName]
      return state.mosaic[tableName]
    },
    getMosaicDefinition: (state) => ({ tableName }) => {
      return state.mosaic[tableName]
    },
    getMosaicLoading: (state, getters) => ({ tableName }) => {
      const mosaicDefinition = getters.getMosaicDefinition({
        tableName
      })
      if (isEmptyValue(mosaicDefinition)) return []
      return mosaicDefinition.isLoading
    },
    getCurrentMosaicDefinition: (state, getters) => ({ tableName }) => {
      const mosaicDefinition = getters.getMosaicDefinition({
        tableName
      })
      if (isEmptyValue(mosaicDefinition)) return {}
      return mosaicDefinition.currentMosaic
    },
    // Panel Right
    getMosaicPanelRightDefinitions: (state) => ({ tableName }) => {
      return state.mosaicPanelRight[tableName]
    },
    getMosaicPanelRightLoading: (state, getters) => ({ tableName }) => {
      const mosaicPanelRightDefinition = getters.getMosaicPanelRightDefinitions({
        tableName
      })
      if (isEmptyValue(mosaicPanelRightDefinition)) return []
      return mosaicPanelRightDefinition.isLoading
    },
    getCurrentMosaicPanelRightDefinition: (state, getters) => ({ tableName }) => {
      const mosaicPanelRightDefinition = getters.getMosaicPanelRightDefinitions({
        tableName
      })
      if (isEmptyValue(mosaicPanelRightDefinition)) return {}
      return mosaicPanelRightDefinition.currentMosaic
    }
  }
}

export default mosaicDefinition
