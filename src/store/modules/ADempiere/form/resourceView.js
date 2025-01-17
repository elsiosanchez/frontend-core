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

import { resources } from '@/api/ADempiere/displayDefinition.ts'
import { isEmptyValue } from '@/utils/ADempiere'
import { getStartAndEndOfCurrentMonth } from '@/utils/ADempiere/valueFormat.js'
const initState = {
  tabPanelResource: {},
  panelResource: false,
  infoResource: {},
  isLoadingResource: false,
  endStr: getStartAndEndOfCurrentMonth()[1],
  startStr: getStartAndEndOfCurrentMonth()[0],
  filters: []
}

const resource = {
  state: initState,
  mutations: {
    setPanelResource(state, value) {
      state.panelResource = value
    },
    setInfoKResource(state, value) {
      state.infoResource = value
    },
    setIsLoadingResource(state, isLoading) {
      state.isLoadingResource = isLoading
    },
    setFilters(state, value) {
      state.filters = value
    },
    setDateDefaults(state, {
      startStr,
      endStr
    }) {
      state.startStr = startStr
      state.endStr = endStr
    },
    setTabPanelResource(state, value) {
      state.tabPanelResource = value
    }
  },
  actions: {
    searchPanelResource({ state, commit, getters, dispatch }, {
      id,
      filters,
      searchValue,
      isPanel
    }) {
      commit('setIsLoadingResource', true)
      let defaultFilters = ''
      const currentDefinitions = getters.getTabOptions
      if (!isEmptyValue(currentDefinitions.valid_to_column)) {
        defaultFilters += `[{"name":"${currentDefinitions.valid_to_column}","operator":"between","values":["${state.startStr}","${state.endStr}"]}],`
      }
      // if (!isEmptyValue(currentDefinitions.valid_to_column)) {
      //   defaultFilters += `[{"name": "${currentDefinitions.valid_to_column}", "operator":"equal", "value": "${state.startStr}"}]`
      // }
      // if (!isEmptyValue(currentDefinitions.valid_from_column)) {
      //   defaultFilters += `[{"name": "${currentDefinitions.valid_from_column}", "operator":"equal", "value": "${state.endStr}"}]`
      // }
      let allFilters
      if (!isEmptyValue(filters)) {
        allFilters = filters + ',' + defaultFilters
      } else {
        allFilters = defaultFilters
      }

      return new Promise(resolve => {
        resources({
          id,
          filters: allFilters,
          searchValue
        })
          .then(response => {
            const { records, groups } = response
            const groupsRecurso = groups.map(list => {
              const { color, name, resources } = list
              return {
                id: name,
                title: name,
                eventColor: color,
                building: name,
                children: resources.map(child => {
                  return {
                    id: child.name,
                    title: child.name,
                    eventColor: child.color
                  }
                })
              }
            })
            const recordsEvents = records.map(events => {
              return {
                ...events,
                id: events.id,
                title: events.title,
                start: events.valid_from,
                end: events.valid_to,
                resourceId: events.name,
                resourceTitle: events.resource_name,
                eventColor: events.color
              }
            })
            const all = {
              groupsRecurso,
              recordsEvents,
              ...response
            }
            if (isPanel) {
              commit('setTabPanelResource', all)
            } else {
              commit('setInfoKResource', all)
            }
            resolve(response)
          })
          .finally(() => {
            commit('setIsLoadingResource', false)
          })
      })
    },
    setDateDefault({ commit, dispatch, getters }, {
      startStr,
      endStr,
      isPanel
    }) {
      const dateDefaults = getStartAndEndOfCurrentMonth()
      if (isEmptyValue(startStr)) startStr = dateDefaults[0]
      if (isEmptyValue(endStr)) endStr = dateDefaults[1]
      const currentDefinitions = getters.getTabOptions
      commit('setDateDefaults', { startStr, endStr })
      dispatch('searchPanelResource', { id: currentDefinitions.id, isPanel })
    }
  },
  getters: {
    getPanelResource: (state) => {
      return state.panelResource
    },
    getInfoResource: (state) => {
      return state.infoResource
    },
    getIsLoadingResource: (state) => {
      return state.isLoadingResource
    },
    getTabPanelResource: (state) => {
      return state.tabPanelResource
    }
  }
}

export default resource
