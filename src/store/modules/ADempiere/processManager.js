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
import lang from '@/lang'
import router from '@/router'

// API Request Methods
import {
  requestRunBusinessProcess,
  requestRunBusinessProcessAsBrowser,
  requestRunBusinessProcessAsWindow
} from '@/api/ADempiere/business-data/runBusinessProcess.ts'

// Constants
import { COLUMNNAME_Record_ID } from '@/utils/ADempiere/constants/systemColumns'
// import { IDENTIFIER_COLUMN_SUFFIX } from '@/utils/ADempiere/dictionaryUtils'

// Utils and Helper Methods
import { getToken } from '@/utils/auth'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { getContextAttributes } from '@/utils/ADempiere/contextUtils/contextAttributes'
import { showMessage, showNotification } from '@/utils/ADempiere/notification'
import { containerManager } from '@/utils/ADempiere/dictionary/process.js'
import { refreshRecord } from '@/utils/ADempiere/dictionary/window/actionsMenu'

const processManager = {
  state: {
    isLoadingProcessOfBrowser: {}
  },

  mutations: {
    setIsloadingProcessOfBrowser(state, {
      containerUuid,
      isLoading
    }) {
      Vue.set(state.isLoadingProcessOfBrowser, containerUuid, {
        isLoading
      })
    }
  },

  actions: {
    processActionPerformed({ dispatch, getters }, {
      containerUuid,
      field,
      value,
      valueTo
    }) {
      return new Promise(resolve => {
        const fieldsList = getters.getStoredFieldsFromProcess(containerUuid)

        // change Dependents
        dispatch('changeDependentFieldsList', {
          field,
          fieldsList,
          containerManager
        })
      })
    },

    startProcess({ dispatch, rootGetters }, {
      containerUuid
    }) {
      return new Promise(resolve => {
        const processDefinition = rootGetters.getStoredProcess(containerUuid)
        const { fieldsList } = processDefinition

        const fieldsEmpty = rootGetters.getProcessParametersEmptyMandatory({
          containerUuid,
          fieldsList
        })
        if (!isEmptyValue(fieldsEmpty)) {
          showMessage({
            message: lang.t('notifications.mandatoryFieldMissing') + fieldsEmpty,
            type: 'info'
          })
          return
        }

        const parameters = rootGetters.getProcessParameters({
          containerUuid,
          fieldsList
        })

        const isSession = !isEmptyValue(getToken())
        let procesingNotification = {
          close: () => false
        }
        if (isSession) {
          procesingNotification = showNotification({
            title: lang.t('notifications.processing'),
            message: processDefinition.name,
            summary: processDefinition.description,
            type: 'info'
          })
        }

        let isProcessedError = false
        let summary = ''

        // close current page
        const currentRoute = router.app._route
        const tabViewsVisited = rootGetters.visitedViews
        dispatch('tagsView/delView', currentRoute)
        // go to back page
        const oldRouter = tabViewsVisited[tabViewsVisited.length - 1]
        router.push({
          path: oldRouter.path
        }, () => {})

        requestRunBusinessProcess({
          id: processDefinition.internal_id,
          parameters
        })
          .then(runProcessRepsonse => {
            isProcessedError = runProcessRepsonse.is_error
            summary = runProcessRepsonse.summary

            resolve(runProcessRepsonse)
          })
          .catch(error => {
            isProcessedError = true
            console.warn(`Error getting print formats: ${error.message}. Code: ${error.code}.`)
          })
          .finally(() => {
            dispatch('setProcessDefaultValues', { containerUuid })
            dispatch('finishProcess', {
              summary,
              name: processDefinition.name,
              isError: isProcessedError
            })
              .then(() => {
                // close runing process notification
                if (!isEmptyValue(procesingNotification)) {
                  setTimeout(() => {
                    procesingNotification.close()
                  }, 1000)
                }
              })
          })
      })
    },

    /**
     * Start run process of browser
     * @param {string} parentUuid, browser calling this process
     * @param {string} containerUuid, process associated of browser
     * @returns
     */
    startProcessOfBrowser({ commit, dispatch, rootGetters }, {
      parentUuid,
      containerUuid,
      isAllSelection = false
    }) {
      return new Promise(resolve => {
        const browserDefinition = rootGetters.getStoredBrowser(parentUuid)
        const {
          process: processDefinition, uuid: browserUuid, context_column_names, fieldsList
        } = browserDefinition

        const parametersList = rootGetters.getProcessParameters({
          containerUuid
        })

        const selectionsList = rootGetters.getBrowserSelectionToServer({
          containerUuid: parentUuid
        })

        const isSession = !isEmptyValue(getToken())
        let procesingNotification = {
          close: () => false
        }
        if (isSession) {
          procesingNotification = showNotification({
            title: lang.t('notifications.processing'),
            message: processDefinition.name,
            summary: processDefinition.description,
            type: 'info'
          })
        }

        let isProcessedError = false
        let summary = ''
        let processLogs = []

        let recordId = rootGetters.getValueOfField({
          parentUuid,
          containerUuid,
          columnName: COLUMNNAME_Record_ID
        })
        if (isEmptyValue(recordId)) {
          const currentRoute = router.app._route
          if (!isEmptyValue(currentRoute.query.recordId)) {
            recordId = currentRoute.query.recordId
          }
        }

        let browserContextAttributes = '{}'
        let browserCriteriaFilters = '[]'
        if (isAllSelection) {
          // get context values
          const contextAttributesList = getContextAttributes({
            containerUuid: browserUuid,
            contextColumnNames: context_column_names,
            format: 'object'
          })
          if (!isEmptyValue(contextAttributesList)) {
            browserContextAttributes = JSON.stringify(contextAttributesList)
          }

          // parameters Query Criteria
          const queryCriteriaFilters = rootGetters.getBrowserQueryCriteria({
            containerUuid: browserUuid,
            fieldsList
          })
          const filtersList = queryCriteriaFilters.map(parameter => {
            const {
              columnName,
              operator,
              value,
              valueTo,
              values
            } = parameter
            return JSON.stringify({
              name: columnName,
              operator,
              // values > value, valueTo > value
              values: !isEmptyValue(values) ? values : !isEmptyValue(valueTo) ? [value, valueTo] : value
            })
          }).toString()
          if (!isEmptyValue(filtersList)) {
            browserCriteriaFilters = '[' + filtersList + ']'
          }
        }

        requestRunBusinessProcessAsBrowser({
          uuid: containerUuid,
          parametersList,
          // in browser
          id: browserDefinition.process.internal_id,
          browserId: browserDefinition.id,
          selectionsList,
          isAllSelection,
          browserContextAttributes,
          browserCriteriaFilters,
          // in window
          recordId
        })
          .then(runProcessRepsonse => {
            isProcessedError = runProcessRepsonse.is_error
            summary = runProcessRepsonse.summary
            processLogs = runProcessRepsonse.logs

            // window refresh data
            const windowsUuid = router.app._route.query.parentUuid
            if (!isEmptyValue(recordId) && !isEmptyValue(windowsUuid)) {
              const storedWindow = rootGetters.getStoredWindow(windowsUuid)
              if (!isEmptyValue(storedWindow)) {
                const { tabsList, tabsListParent, tabsListChild } = storedWindow
                // update records and logics on child tabs
                tabsList.filter(tabItem => {
                  // always laoded first tab parent
                  if (tabItem.uuid === tabsListParent.at().uuid) {
                    return true
                  }
                  // always laoded first tab child
                  if (!isEmptyValue(tabsListChild) && tabsListChild.at().uuid === tabItem.uuid) {
                    return true
                  }
                  if (tabItem.hasBeenRendered) {
                    return true
                  }
                  // reloaded tabs with records
                  return rootGetters.getIsLoadedTabRecord({
                    containerUuid: tabItem.uuid
                  })
                }).forEach(tabItem => {
                  refreshRecord.refreshRecord({
                    parentUuid: windowsUuid,
                    containerUuid: tabItem.uuid,
                    recordId: recordId,
                    isRefreshChilds: true
                  })
                })
              }
            }

            resolve(runProcessRepsonse)

            // clear data and set default values or refresh query
            commit('clearBrowserData', {
              containerUuid: browserDefinition.uuid
            })
            if (isEmptyValue(recordId) || isEmptyValue(windowsUuid)) {
              dispatch('getBrowserSearch', {
                containerUuid: browserDefinition.uuid,
                isClearSelection: true
              })
            } else {
              dispatch('setBrowserDefaultValues', {
                containerUuid: browserDefinition.uuid
              })
            }
          })
          .catch(error => {
            isProcessedError = true
            console.warn(`Error getting print formats: ${error.message}. Code: ${error.code}.`)
          })
          .finally(() => {
            dispatch('finishProcess', {
              summary,
              processLogs,
              name: processDefinition.name,
              isError: isProcessedError
            })
              .then(() => {
                // close runing process notification
                if (!isEmptyValue(procesingNotification)) {
                  setTimeout(() => {
                    procesingNotification.close()
                  }, 1000)
                }
              })

            commit('setBrowserProcessAll', {
              uuid: browserUuid,
              isAll: false
            })
            resolve()
          })
      })
    },

    startProcessOfWindows({ commit, dispatch, getters, rootGetters }, {
      parametersList = [],
      defaultProcess,
      currentTab,
      containerUuid,
      recordUuid,
      parentUuid,
      tableName,
      recordId
    }) {
      return new Promise(resolve => {
        const windowUuid = router.app._route.meta.uuid
        const isSession = !isEmptyValue(getToken())
        // const currentTab = getters.getTabAttributes
        const storedTab = rootGetters.getStoredTab(windowUuid, parentUuid)
        // if (isEmptyValue(storedTab)) {
        //   storedTab = rootGetters.getStoredTab(windowUuid, parentUuid)
        // }
        const currentPanel = getters.getTabAttributes

        let storedProcessDefinition
        const processModal = getters.getModalDialogManager({ containerUuid: containerUuid })

        storedProcessDefinition = storedTab.processes.find(process => { process.uuid === processModal.containerUuid })
        // Get Parameters Process
        if (isEmptyValue(parametersList)) {
          const fieldsList = getters.getStoredFieldsFromProcess(containerUuid)
          parametersList = rootGetters.getProcessParameters({ containerUuid, fieldsList })
        }

        if (isEmptyValue(recordId)) {
          recordId = rootGetters.getIdOfContainer({
            containerUuid: currentPanel.containerUuid,
            tableName: currentPanel.table_name
          })
        }

        if (isEmptyValue(storedProcessDefinition)) {
          storedProcessDefinition = defaultProcess
        }
        // const recordsSelection = rootGetters.getTabSelectionsList({ containerUuid: storedTab.uuid })

        // if (!isEmptyValue(recordsSelection) && recordsSelection.length === 1) {
        //   const currentRow = recordsSelection[0]
        //   recordId = currentRow[table_name + IDENTIFIER_COLUMN_SUFFIX]
        //   recordUuid = currentRow.UUID
        // }

        // const selectionsList = getSelectionsList({
        //   processDefinition: storedProcessDefinition,
        //   currentTab: storedTab,
        //   isShowedTableRecords,
        //   recordsSelection,
        //   containerUuid,
        //   windowUuid
        // })
        let selectionsList = []
        const recordsSelection = rootGetters.getTabSelectionsList({
          containerUuid: currentPanel.uuid
        })
        if (storedProcessDefinition.is_multi_selection && currentPanel.isShowedTableRecords) {
          selectionsList = rootGetters.getTabSelectionToServer({
            parentUuid: windowUuid,
            containerUuid: currentPanel.uuid,
            selectionsList: recordsSelection
          })
          recordId = ''
        }

        let procesingNotification = { close: () => false }

        if (isSession) {
          procesingNotification = showNotification({
            title: lang.t('notifications.processing'),
            message: storedProcessDefinition.name,
            summary: storedProcessDefinition.description,
            type: 'info'
          })
        }

        let isProcessedError = false
        let summary = ''

        requestRunBusinessProcessAsWindow({
          id: storedProcessDefinition.internal_id,
          recordId,
          parametersList,
          selectionsList,
          tableName: currentPanel.table_name
        })
          .then(runProcessRepsonse => {
            isProcessedError = runProcessRepsonse.is_error
            summary = runProcessRepsonse.summary
            // TODO: Update record on window
            resolve(runProcessRepsonse)
          })
          .catch(error => {
            isProcessedError = true
            console.warn(`Error executing process: ${error.message}. Code: ${error.code}.`)
          })
          .finally(() => {
            commit('setTabAttributes', {})
            dispatch('finishProcess', {
              summary,
              name: storedProcessDefinition.name,
              isError: isProcessedError
            })
              .then(() => {
                // close runing process notification
                if (!isEmptyValue(procesingNotification)) {
                  setTimeout(() => {
                    procesingNotification.close()
                  }, 1000)
                }
              })
          })
      })
    },

    finishProcess({ commit }, {
      name,
      summary,
      processLogs,
      isError
    }) {
      let processMessage = {
        name,
        title: lang.t('notifications.succesful'),
        message: lang.t('notifications.processExecuted'),
        type: 'success',
        logs: processLogs,
        summary
      }

      if (isError) {
        const errorMessage = !isEmptyValue(summary)
          ? summary
          : lang.t('notifications.error')

        processMessage = {
          name,
          title: lang.t('notifications.error'),
          message: errorMessage,
          type: 'error',
          logs: processLogs
        }
      }

      const isSession = !isEmptyValue(getToken())
      if (isSession) {
        showNotification(processMessage)
      }
    }
  },

  getters: {
    getIsloadingProcessOfBrowser: (state) => ({
      containerUuid
    }) => {
      if (isEmptyValue(containerUuid)) return false
      return state.isLoadingProcessOfBrowser[containerUuid].isLoading
    }
  }
}

export default processManager
