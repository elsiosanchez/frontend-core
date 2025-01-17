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

import Vue from 'vue'
import language from '@/lang'

// API Request Methods
import { requestWorkflowMetadata } from '@/api/ADempiere/workflow'
import { workflowsDisplay } from '@/api/ADempiere/displayDefinition.ts'
// Utils and Helper Methods
import { generateWorkflowDiagram } from '@/utils/ADempiere/dictionary/workflow'
import { showMessage } from '@/utils/ADempiere/notification'

const workflow = {
  state: {
    workflowDefinition: {},
    currentWorkflowDefinitions: {},
    isLoading: false,
    currentDisplayWorkflow: {}
  },

  mutations: {
    addWorkflow(state, workflow) {
      Vue.set(state.workflowDefinition, workflow.uuid, workflow)
    },
    dictionaryResetCacheWorkflow(state) {
      state.workflow = {}
    },
    setDefinitionsWorkflow(state, value) {
      state.currentWorkflowDefinitions = value
    },
    setIsLoading(state, value) {
      state.isLoading = value
    },
    setCurrentDisplayWorkflow(state, value) {
      state.currentDisplayWorkflow = value
    }
  },

  actions: {
    getWorkflowFromServer({ commit, dispatch }, {
      id,
      containerUuid,
      routeToDelete
    }) {
      return new Promise(resolve => {
        requestWorkflowMetadata({
          uuid: containerUuid,
          id
        })
          .then(workflowResponse => {
            const panelType = 'workflow'

            // Panel for save on store
            const newWorkflow = {
              ...workflowResponse,
              containerUuid,
              diagramMetadata: generateWorkflowDiagram(workflowResponse),
              panelType
            }

            commit('addWorkflow', newWorkflow)

            resolve(newWorkflow)

            const actions = []

            // Add process menu
            dispatch('setContextMenu', {
              containerUuid,
              actions
            })
          })
          .catch(error => {
            // router.push({
            //   path: '/dashboard'
            // }, () => {})
            // dispatch('tagsView/delView', routeToDelete)
            showMessage({
              message: language.t('page.login.unexpectedError'),
              type: 'error'
            })
            console.warn(`Dictionary Workflow - Error ${error.code}: ${error.message}.`)
          })
      })
    },
    getWorflowDisplay({ commit }, {
      id,
      filters
    }) {
      return new Promise(resolve => {
        commit('setIsLoading', true)
        workflowsDisplay({
          id,
          filters
        })
          .then(response => {
            commit('setCurrentDisplayWorkflow', response)
            resolve(response)
          })
          .finally(() => {
            commit('setIsLoading', false)
          })
      })
    },
    currentWorkflowDefinitions({ commit }, definitions) {
      commit('setDefinitionsWorkflow', definitions)
    }
  },

  getters: {
    getStoredWorkflowByUuid: (state) => (workflowUuid) => {
      return state.workflowDefinition[workflowUuid] || {}
    },
    getCurrentWorkflowDefinitions: (state) => {
      return state.currentWorkflowDefinitions
    },
    getIsLoadingWorkflow: (state) => {
      return state.isLoading
    },
    getCurrentDisplayWorkflow: (state) => {
      return state.currentDisplayWorkflow
    }
  }
}

export default workflow
