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
import { workflowsDisplay } from '@/api/ADempiere/displayDefinition.ts'

// Utils and Helper Methods
import { showMessage } from '@/utils/ADempiere/notification.js'
import { isEmptyValue } from '@/utils/ADempiere'
import { getCurrentRecord } from '@/utils/ADempiere/displayDefinition'

const initState = {
  workflow: {},
  emtpyWorkflow: {
    currentWorkflow: {},
    isLoading: false,
    activate: -1
  }
}

const workflowDefinition = {
  state: initState,

  mutations: {
    setWorkflowDefinition(state, {
      currentWorkflow = {},
      isLoading = false,
      tableName
    }) {
      Vue.set(state.workflow, tableName, {
        currentWorkflow,
        isLoading,
        tableName
      })
    },
    setCurrentWorkflowDefinition(state, {
      currentWorkflow,
      tableName
    }) {
      Vue.set(state.workflow[tableName], 'currentWorkflow', currentWorkflow)
    },
    setWorkflowLoading(state, {
      isLoading,
      tableName
    }) {
      Vue.set(state.workflow[tableName], 'isLoading', isLoading)
    },
    setWorkflowActivate(state, {
      activate,
      tableName
    }) {
      Vue.set(state.workflow[tableName], 'activate', activate)
    }
  },
  actions: {
    requestWorkflow({ commit }, {
      id,
      filters = [],
      searchValue,
      recordId,
      tableName
    }) {
      return new Promise(resolve => {
        commit('setWorkflowDefinition', { tableName, isLoading: true })
        if (isEmptyValue(recordId)) recordId = getCurrentRecord()
        filters = [{ name: [tableName] + '_ID', values: recordId }]
        workflowsDisplay({
          id,
          filters: JSON.stringify(filters),
          searchValue
        })
          .then(response => {
            commit('setCurrentWorkflowDefinition', {
              tableName,
              currentWorkflow: response
            })
            if (!isEmptyValue(response) && !isEmptyValue(response.records)) {
              const stepIndex = response.steps.findIndex(step => step.value === String(response.records[0].group_id))
              commit('setWorkflowActivate', {
                activate: stepIndex,
                tableName
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
            commit('setWorkflowLoading', { tableName, isLoading: false })
          })
      })
    },
    requestWorkflowActivate({ commit }, {
      activate,
      tableName
    }) {
      commit('setWorkflowActivate', { tableName, activate })
    }
  },
  getters: {
    getWorkflowDefinition: (state) => ({ tableName }) => {
      return state.workflow[tableName]
    },
    getWorkflowLoading: (state, getters) => ({ tableName }) => {
      const workflowDefinition = getters.getWorkflowDefinition({
        tableName
      })
      if (isEmptyValue(workflowDefinition)) return []
      return workflowDefinition.isLoading
    },
    getCurrentWorkflowDefinition: (state, getters) => ({ tableName }) => {
      const workflowDefinition = getters.getWorkflowDefinition({
        tableName
      })
      if (isEmptyValue(workflowDefinition)) return {}
      return workflowDefinition.currentWorkflow
    },
    getWorkflowActivate: (state, getters) => ({ tableName }) => {
      const workflowDefinition = getters.getWorkflowDefinition({
        tableName
      })
      if (isEmptyValue(workflowDefinition)) return {}
      return workflowDefinition.activate
    }
  }
}

export default workflowDefinition
