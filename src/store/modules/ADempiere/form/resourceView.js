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
const initState = {
  panelResource: false,
  infoResource: {},
  isLoadingResource: false,
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
    setIsLoadingResource(state, value) {
      state.isLoadingResource = value
    },
    setFilters(state, value) {
      state.filters = value
    }
  },
  actions: {
    searchPanelResource({ commit, getters }, {
      id,
      filters,
      searchValue
    }) {
      commit('setIsLoadingResource', true)
      if (!isEmptyValue(filters)) {
        commit('setFilters', filters)
      }
      if (isEmptyValue(filters)) {
        const storeFiltrs = getters.getFilters
        filters = storeFiltrs
      }
      return new Promise(resolve => {
        resources({
          id,
          filters,
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
            commit('setInfoKResource', all)
            resolve(response)
          })
          .finally(() => {
            commit('setIsLoadingResource', false)
          })
      })
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
    getFilters: (state) => {
      return state.filters
    }
  }
}

export default resource
