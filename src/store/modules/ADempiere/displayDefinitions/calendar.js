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
import { listCalendars } from '@/api/ADempiere/form/task-management.ts'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
// import { getStartAndEndOfCurrentMonth } from '@/utils/ADempiere/valueFormat.js'
import { showMessage } from '@/utils/ADempiere/notification.js'
import { getCurrentRecord } from '@/utils/ADempiere/displayDefinition'
// Constants
// import { DISPLAY_TYPE_PANEL } from '@/utils/ADempiere/displaDefinition/index.ts'

const initState = {
  calendar: {},
  calendarPanelRight: {},
  emtpyCalendar: {
    listRecordsCalendar: [],
    isLoading: false,
    endStr: '',
    startStr: '',
    columns: [],
    filters: []
  }
}

const calendarDefinition = {
  state: initState,

  mutations: {
    setCalendarDefinition(state, {
      listRecordsCalendar = [],
      isLoading = false,
      endStr = '',
      startStr = '',
      filters = [],
      columns = [],
      tableName
    }) {
      Vue.set(state.calendar, tableName, {
        listRecordsCalendar,
        isLoading,
        startStr,
        filters,
        columns,
        endStr
      })
    },
    setListRecordsCalendarDefinition(state, {
      listRecordsCalendar,
      tableName
    }) {
      Vue.set(state.calendar[tableName], 'listRecordsCalendar', listRecordsCalendar)
    },
    setCalendarLoading(state, {
      isLoading,
      tableName
    }) {
      Vue.set(state.calendar[tableName], 'isLoading', isLoading)
    },
    setCalendarPanelFilter(state, {
      filters,
      tableName
    }) {
      Vue.set(state.calendarPanelRight[tableName], 'filters', filters)
    },
    setCalendarChangeDate(state, {
      endStr,
      isPanel,
      startStr,
      tableName
    }) {
      if (isPanel) {
        if (state.calendarPanelRight[tableName]) {
          Vue.set(state.calendarPanelRight[tableName], 'startStr', startStr)
          Vue.set(state.calendarPanelRight[tableName], 'endStr', endStr)
          return
        }
      }
      if (state.calendar[tableName]) {
        Vue.set(state.calendar[tableName], 'startStr', startStr)
        Vue.set(state.calendar[tableName], 'endStr', endStr)
      }
    },
    // Panel Right
    setCalendarPanelTabDefinition(state, {
      startStr = '',
      endStr = '',
      listRecordsCalendar = [],
      isLoading = false,
      filters = [],
      columns = [],
      idDefinitions = undefined,
      tableName
    }) {
      Vue.set(state.calendarPanelRight, tableName, {
        listRecordsCalendar,
        idDefinitions,
        isLoading,
        startStr,
        filters,
        columns,
        endStr
      })
    },
    setListRecordsCalendarRightDefinition(state, {
      listRecordsCalendar,
      tableName
    }) {
      Vue.set(state.calendarPanelRight[tableName], 'listRecordsCalendar', listRecordsCalendar)
    },
    setCalendarRightLoading(state, {
      isLoading,
      tableName
    }) {
      Vue.set(state.calendarPanelRight[tableName], 'isLoading', isLoading)
    }
  },

  actions: {
    requestCalendar({ state, commit, getters }, {
      id,
      filters,
      recordId,
      tableName,
      searchValue,
      pageSize = 500,
      isPanel = false
    }) {
      return new Promise(resolve => {
        if (isPanel) {
          if (isEmptyValue(state.calendarPanelRight[tableName])) {
            commit('setCalendarPanelTabDefinition', { tableName, isLoading: true })
          } else {
            commit('setCalendarRightLoading', { tableName, isLoading: true })
          }
          if (isEmptyValue(recordId)) recordId = getCurrentRecord()
          filters = [{ name: [tableName] + '_ID', values: recordId }]
        } else {
          if (isEmptyValue(state.calendar[tableName])) {
            commit('setCalendarDefinition', { tableName, isLoading: true })
          } else {
            commit('setCalendarLoading', { tableName, isLoading: true })
          }
        }

        listCalendars({
          id,
          pageSize,
          filters: JSON.stringify(filters),
          searchValue
        })
          .then(response => {
            const { records } = response
            if (isPanel) {
              commit('setListRecordsCalendarRightDefinition', {
                tableName,
                listRecordsCalendar: records
              })
            } else {
              commit('setListRecordsCalendarDefinition', {
                tableName,
                listRecordsCalendar: records
              })
            }
            resolve(records)
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
              commit('setCalendarPanelFilter', {
                tableName,
                filters
              })
              commit('setCalendarRightLoading', { tableName, isLoading: false })
            } else {
              commit('setCalendarLoading', { tableName, isLoading: false })
            }
          })
      })
    },
    changeDateCalendar({
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
      id
    }) {
      if (isPanel) {
        filters = [{ name: [tableName] + '_ID', values: recordId }]
        filters = JSON.stringify(filters)
      } else {
        filters = JSON.stringify(filters)
      }
      commit('setCalendarChangeDate', {
        tableName,
        startStr,
        isPanel,
        endStr
      })
      dispatch('requestCalendar', {
        id,
        isPanel,
        tableName,
        filters
      })
    }
  },

  getters: {
    getCalendarPanel: (state) => ({
      tableName,
      isPanel = false
    }) => {
      if (isPanel) return state.calendarPanelRight[tableName]
      return state.calendar[tableName]
    },
    getCalendarDefinition: (state) => ({ tableName }) => {
      return state.calendar[tableName]
    },
    getCalendarLoading: (state, getters) => ({ tableName }) => {
      const calendarDefinition = getters.getCalendarDefinition({
        tableName
      })
      if (isEmptyValue(calendarDefinition)) return []
      return calendarDefinition.isLoading
    },
    getListRecordsCalendarDefinition: (state, getters) => ({ tableName }) => {
      const calendarDefinition = getters.getCalendarDefinition({
        tableName
      })
      if (isEmptyValue(calendarDefinition)) return {}
      return calendarDefinition.listRecordsCalendar
    },
    // Panel Right
    getCalendarPanelRightDefinitions: (state) => ({ tableName }) => {
      return state.calendarPanelRight[tableName]
    },
    getCalendarPanelRightLoading: (state, getters) => ({ tableName }) => {
      const CalendarPanelRightDefinition = getters.getCalendarPanelRightDefinitions({
        tableName
      })
      if (isEmptyValue(CalendarPanelRightDefinition)) return []
      return CalendarPanelRightDefinition.isLoading
    },
    getListRecordsCalendarPanelRightDefinition: (state, getters) => ({ tableName }) => {
      const CalendarPanelRightDefinition = getters.getCalendarPanelRightDefinitions({
        tableName
      })
      if (isEmptyValue(CalendarPanelRightDefinition)) return {}
      return CalendarPanelRightDefinition.listRecordsCalendar
    }
  }
}

export default calendarDefinition
