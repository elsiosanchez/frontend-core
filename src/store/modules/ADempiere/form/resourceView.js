/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Ricardo Fenomeno ricardofenomeno13@gmail.com https://github.com/Ricrgame
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

import Vue from 'vue'

// API Request Methods
import { resources } from '@/api/ADempiere/displayDefinition.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { getStartAndEndOfCurrentMonth } from '@/utils/ADempiere/valueFormat.js'
import { getUuidv4 } from '@/utils/ADempiere/recordUtil'
import { addGroupEvents, parseDate } from '@/utils/ADempiere/displayDefinition/resourceTime.js'

const initState = {
  tabPanelResource: {},
  panelResource: {},
  infoResource: {},
  isLoadingResource: false,
  endStr: getStartAndEndOfCurrentMonth()[1],
  startStr: getStartAndEndOfCurrentMonth()[0],
  filters: [],
  currentResourcesDefinitions: {}
}

const resource = {
  state: initState,
  mutations: {
    setPanelResource(state, {
      show,
      tableName
    }) {
      Vue.set(state.panelResource, tableName, show)
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
    },
    setDefinitionsResources(state, value) {
      state.currentResourcesDefinitions = value
    }
  },
  actions: {
    currentResourcesDefinitions({ commit }, definitions) {
      commit('setDefinitionsResources', definitions)
    },
    searchPanelResource({ state, commit, getters, dispatch }, {
      id,
      filters,
      searchValue,
      isPanel
    }) {
      commit('setIsLoadingResource', true)
      let defaultFilters = ''
      const currentDefinitions = getters.getTabOptions
      if (!isEmptyValue(currentDefinitions) && !isEmptyValue(currentDefinitions.valid_to_column)) {
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

            const resourcesList = groups.map(groupItem => {
              const {
                color: colorGroup, name: titleGroup, resources
              } = groupItem
              const uuidGroup = getUuidv4()

              const resourcesChilds = resources.map(resourceItem => {
                const {
                  id, color: colorResource, name: titleResource
                } = resourceItem
                return {
                  id: id,
                  eventColor: colorResource,
                  title: titleResource
                }
              })

              return {
                id: uuidGroup,
                title: titleGroup,
                color: colorGroup,
                children: resourcesChilds
              }
            })

            const resourcesEventsList = records.map(eventItem => {
              const {
                id, title, name,
                valid_from, valid_to
                // group_name
              } = eventItem
              let start = valid_from
              if (isEmptyValue(valid_from) && !isEmptyValue(valid_to)) {
                start = valid_to
              }
              let end = valid_to
              if (isEmptyValue(valid_to) && !isEmptyValue(valid_from)) {
                end = valid_from
              }
              return {
                id,
                title: title + ' - ' + name,
                start: parseDate(start),
                end: parseDate(end),
                resourceId: id
              }
            })

            let eventsList = []
            eventsList = resourcesEventsList
            // Add events on parent
            const groupEventsList = addGroupEvents(resourcesList, eventsList)
            eventsList = resourcesEventsList.concat(groupEventsList)

            const all = {
              resourcesList,
              eventsList,
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
      isPanel,
      id,
      filters
    }) {
      const dateDefaults = getStartAndEndOfCurrentMonth()
      if (isEmptyValue(startStr)) startStr = dateDefaults[0]
      if (isEmptyValue(endStr)) endStr = dateDefaults[1]
      // const currentDefinitions = getters.getPanelOptions
      commit('setDateDefaults', { startStr, endStr })
      dispatch('searchPanelResource', { id, isPanel, filters })
    }
  },
  getters: {
    getPanelResource: (state) => ({ tableName }) => {
      return state.panelResource[tableName] || false
    },
    getInfoResource: (state) => {
      return state.infoResource
    },
    getIsLoadingResource: (state) => {
      return state.isLoadingResource
    },
    getTabPanelResource: (state) => {
      return state.tabPanelResource
    },
    getCurrentResourcesDefinitions: (state) => {
      return state.currentResourcesDefinitions
    }
  }
}

export default resource
