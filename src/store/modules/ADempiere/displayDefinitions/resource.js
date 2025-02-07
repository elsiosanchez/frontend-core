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
import { resources } from '@/api/ADempiere/displayDefinition.ts'

// Constants
import {
  OPERATOR_BETWEEN, OPERATOR_GREATER_EQUAL, OPERATOR_LESS_EQUAL
} from '@/utils/ADempiere/dataUtils'
// import { DISPLAY_TYPE_PANEL } from '@/utils/ADempiere/displaDefinition/index.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
import { getStartAndEndOfCurrentMonth } from '@/utils/ADempiere/valueFormat.js'
import { showMessage } from '@/utils/ADempiere/notification.js'
// import { getUuidv4 } from '@/utils/ADempiere/recordUtil'
import { addGroupEvents } from '@/utils/ADempiere/displayDefinition/resourceTime.js'
import { transformEvents, transformResources, getCurrentRecord } from '@/utils/ADempiere/displayDefinition'

const initState = {
  resource: {},
  resourcePanelRight: {},
  emtpyResource: {
    currentResource: {},
    isLoading: false,
    endStr: getStartAndEndOfCurrentMonth()[1],
    startStr: getStartAndEndOfCurrentMonth()[0],
    columns: [],
    filters: []
  }
}

const resourceDefinition = {
  state: initState,

  mutations: {
    setResourceDefinition(state, {
      currentResource = {},
      isLoading = false,
      endStr = getStartAndEndOfCurrentMonth()[1],
      startStr = getStartAndEndOfCurrentMonth()[0],
      filters = [],
      columns = [],
      tableName
    }) {
      Vue.set(state.resource, tableName, {
        currentResource,
        isLoading,
        startStr,
        filters,
        columns,
        endStr
      })
    },
    setCurrentResourceDefinition(state, {
      currentResource,
      tableName
    }) {
      Vue.set(state.resource[tableName], 'currentResource', currentResource)
    },
    setResourceLoading(state, {
      isLoading,
      tableName
    }) {
      Vue.set(state.resource[tableName], 'isLoading', isLoading)
    },
    setResourceFilters(state, {
      filters,
      tableName
    }) {
      Vue.set(state.resourcePanelRight[tableName], 'filters', filters)
    },
    setResourceChangeDate(state, {
      endStr,
      isPanel,
      startStr,
      tableName
    }) {
      if (isPanel) {
        if (state.resourcePanelRight[tableName]) {
          Vue.set(state.resourcePanelRight[tableName], 'startStr', startStr)
          Vue.set(state.resourcePanelRight[tableName], 'endStr', endStr)
          return
        }
      }
      if (state.resource[tableName]) {
        Vue.set(state.resource[tableName], 'startStr', startStr)
        Vue.set(state.resource[tableName], 'endStr', endStr)
      }
    },
    // Panel Right
    setResourcePanelTabDefinition(state, {
      startStr = null,
      endStr = null,
      currentResource = {},
      isLoading = false,
      filters = [],
      columns = [],
      tableName
    }) {
      Vue.set(state.resourcePanelRight, tableName, {
        currentResource,
        isLoading,
        startStr,
        filters,
        columns,
        endStr
      })
    },
    setCurrentResourceRightDefinition(state, {
      currentResource,
      tableName
    }) {
      Vue.set(state.resourcePanelRight[tableName], 'currentResource', currentResource)
    },
    setResourceRightLoading(state, {
      isLoading,
      tableName
    }) {
      Vue.set(state.resourcePanelRight[tableName], 'isLoading', isLoading)
    }
  },

  actions: {
    requestResource({ state, commit, getters }, {
      id,
      filters = [],
      recordId,
      tableName,
      searchValue,
      isPanel = false
    }) {
      return new Promise(resolve => {
        if (isPanel) {
          if (isEmptyValue(state.resourcePanelRight[tableName])) {
            commit('setResourcePanelTabDefinition', {
              tableName,
              isLoading: true,
              startStr: null,
              endStr: null
            })
          }
          if (isEmptyValue(recordId)) {
            recordId = getCurrentRecord()
          }
          filters = [{ name: [tableName] + '_ID', values: recordId }]
        } else {
          if (isEmptyValue(state.resource[tableName])) {
            // Get the current date
            const currentDate = new Date()
            const currentYear = currentDate.getFullYear()

            // First day of the previous year
            const firstDayPreviousYear = new Date(currentYear - 1, 0, 1) // 0 is January
            const dateStart = firstDayPreviousYear.toJSON()

            // Last day of the next year
            const lastDayNextYear = new Date(currentYear + 1, 11, 31) // 11 is December
            const dateEnd = lastDayNextYear.toJSON()

            commit('setResourceDefinition', {
              tableName,
              isLoading: true,
              startStr: dateStart,
              endStr: dateEnd
            })
          }
        }
        let allFilters = filters
        let currentDefinition, startStr, endStr
        const defaultFilters = []
        if (isPanel) {
          currentDefinition = getters.getCurrentDisplayPanelRightDefinitions({ tableName })
        } else {
          currentDefinition = getters.getCurrentDisplayTabDefinitions({ tableName })
        }
        if (!isEmptyValue(currentDefinition) && !isEmptyValue(currentDefinition.valid_to_column)) {
          if (isPanel) {
            endStr = state.resourcePanelRight[tableName].endStr
            startStr = state.resourcePanelRight[tableName].startStr
          } else {
            endStr = state.resource[tableName].endStr
            startStr = state.resource[tableName].startStr
          }
          if (!isEmptyValue(startStr) && !isEmptyValue(endStr)) {
            defaultFilters.push({
              name: currentDefinition.valid_to_column,
              operator: OPERATOR_BETWEEN.operator,
              values: [startStr, endStr]
            })
          } else if (!isEmptyValue(startStr) && isEmptyValue(endStr)) {
            defaultFilters.push({
              name: currentDefinition.valid_from_column,
              operator: OPERATOR_GREATER_EQUAL,
              values: [startStr],
              value_from: startStr
            })
          } else if (isEmptyValue(startStr) && !isEmptyValue(endStr)) {
            defaultFilters.push({
              name: currentDefinition.valid_from_column,
              operator: OPERATOR_LESS_EQUAL,
              values: [endStr],
              value_to: endStr
            })
          }
        }

        if (isEmptyValue(filters) && !isEmptyValue(defaultFilters)) {
          allFilters = defaultFilters
        }

        if (!isEmptyValue(filters) && !isEmptyValue(defaultFilters)) {
          allFilters = [...filters, ...defaultFilters]
        }

        resources({
          id,
          filters: JSON.stringify(allFilters),
          searchValue
        })
          .then(response => {
            const { records, groups } = response

            // Transforming resources and events
            const resourcesList = transformResources({ groups })
            const resourcesEventsList = transformEvents({ records })

            // Combine group events and resource events
            const groupEventsList = addGroupEvents(resourcesList, resourcesEventsList)
            const eventsList = [...resourcesEventsList, ...groupEventsList]

            // Create final object with all data
            const all = {
              resourcesList,
              eventsList,
              ...response
            }

            // Commit to store depending on panel status
            const mutationType = isPanel ? 'setCurrentResourceRightDefinition' : 'setCurrentResourceDefinition'

            commit(mutationType, {
              tableName,
              currentResource: all
            })
            resolve(all)
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
              commit('setResourceRightLoading', { tableName, isLoading: false })
            } else {
              commit('setResourceLoading', { tableName, isLoading: false })
            }
          })
      })
    },
    changeDateRange({
      commit,
      dispatch,
      getters
    }, {
      isPanel,
      tableName,
      recordId,
      startStr,
      filters,
      endStr,
      listFilters,
      id
    }) {
      if (isPanel) {
        filters = [{ name: [tableName] + '_ID', values: recordId }]
        // filters = JSON.stringify(filters)
      } else {
        filters = listFilters
      }
      commit('setResourceChangeDate', {
        tableName,
        startStr,
        isPanel,
        endStr
      })
      dispatch('requestResource', {
        id,
        isPanel,
        tableName,
        filters
      })
    }
  },

  getters: {
    getResourcePanel: (state) => ({
      tableName,
      isPanel = false
    }) => {
      if (isPanel) return state.resourcePanelRight[tableName]
      return state.resource[tableName]
    },
    getResourceDefinition: (state) => ({ tableName }) => {
      return state.resource[tableName]
    },
    getResourceLoading: (state, getters) => ({ tableName }) => {
      const resourceDefinition = getters.getResourceDefinition({
        tableName
      })
      if (isEmptyValue(resourceDefinition)) return []
      return resourceDefinition.isLoading
    },
    getCurrentResourceDefinition: (state, getters) => ({ tableName }) => {
      const resourceDefinition = getters.getResourceDefinition({
        tableName
      })
      if (isEmptyValue(resourceDefinition)) return {}
      return resourceDefinition.currentResource
    },
    // Panel Right
    getResourcePanelRightDefinitions: (state) => ({ tableName }) => {
      return state.resourcePanelRight[tableName]
    },
    getResourcePanelRightLoading: (state, getters) => ({ tableName }) => {
      const resourcePanelRightDefinition = getters.getResourcePanelRightDefinitions({
        tableName
      })
      if (isEmptyValue(resourcePanelRightDefinition)) return []
      return resourcePanelRightDefinition.isLoading
    },
    getCurrentResourcePanelRightDefinition: (state, getters) => ({ tableName }) => {
      const resourcePanelRightDefinition = getters.getResourcePanelRightDefinitions({
        tableName
      })
      if (isEmptyValue(resourcePanelRightDefinition)) return {}
      return resourcePanelRightDefinition.currentResource
    }
  }
}

export default resourceDefinition
