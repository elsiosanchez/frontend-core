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

import lang from '@/lang'
import Vue from 'vue'
// API Request Methods
import { runCallOutRequest } from '@/api/ADempiere/userInterface/window.ts'

// Constants
import { ROW_ATTRIBUTES } from '@/utils/ADempiere/tableUtils'
import {
  DISPLAY_COLUMN_PREFIX, UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX
} from '@/utils/ADempiere/dictionaryUtils'

// Utils and Helper Methods
import { getTypeOfValue, isEmptyValue, isSameValues } from '@/utils/ADempiere/valueUtils'
import { showMessage } from '@/utils/ADempiere/notification'
import { convertObjectToKeyValue } from '@/utils/ADempiere/formatValue/iterableFormat'
import { isDateField, isDecimalField } from '@/utils/ADempiere/references'

const calloutManager = {
  state: {
    calloutQueue: [],
    isProcessing: {}
  },
  mutations: {
    setIsProcessing(state, {
      containerUuid,
      isLoading
    }) {
      Vue.set(state.isProcessing, containerUuid, isLoading)
      // state.isProcessing = isProcessing
    },
    setAddCalloutToQueue(state, callout) {
      state.calloutQueue.push({ payload: callout })
    },
    setUpdateCallout(state, { index, value, oldValue }) {
      state.calloutQueue[index].payload.value = value
      state.calloutQueue[index].payload.oldValue = oldValue
    }
  },
  actions: {
    startCallout({ dispatch }, {
      parentUuid,
      containerUuid,
      displayType,
      callout,
      tableName,
      columnName,
      value,
      oldValue
    }) {
      return new Promise((resolve, reject) => {
        const currentCallout = {
          parentUuid,
          containerUuid,
          displayType,
          callout,
          tableName,
          columnName,
          value,
          oldValue
        }
        // Before processing
        if (!isEmptyValue(callout)) {
          dispatch('addToCalloutQueue', currentCallout)
        }
      })
    },
    addToCalloutQueue({ commit, getters, dispatch }, currentCallout) {
      const { parentUuid, containerUuid, tableName, columnName } = currentCallout
      const allCalloutQueue = getters.getAllCalloutQueue
      // Validate if it already exists in the queue
      const existingCalloutIndex = allCalloutQueue.findIndex(item => {
        const itemPayload = item.payload
        return (
          itemPayload.parentUuid === parentUuid &&
          itemPayload.containerUuid === containerUuid &&
          itemPayload.tableName === tableName &&
          itemPayload.columnName === columnName
        )
      })

      if (existingCalloutIndex !== -1) {
        commit('setUpdateCallout', {
          index: existingCalloutIndex,
          value: currentCallout.value,
          oldValue: currentCallout.oldValue
        })
      } else {
        commit('setAddCalloutToQueue', currentCallout)
      }
      clearTimeout()
      setTimeout(() => {
        dispatch('processCalloutQueue', { containerUuid })
      }, 500)
    },
    processCalloutQueue({ commit, dispatch, getters, state }, {
      containerUuid
    }) {
      return new Promise((resolve, reject) => {
        const recordUuid = getters.getUuidOfContainer(containerUuid)
        const allCalloutQueue = getters.getAllCalloutQueue
        const isProcessing = getters.isProcessing({ containerUuid })
        const contextAttributes = {}
        let parentFieldsList = []
        if (
          isProcessing &&
          isEmptyValue(allCalloutQueue)
        ) {
          resolve({})
          return
        }

        commit('setIsProcessing', {
          containerUuid,
          isLoading: true
        })
        const { payload } = state.calloutQueue.shift()

        const { displayType, parentUuid, columnName, tableName, oldValue, callout } = payload

        let value = payload.value

        // Validate callout

        if (isEmptyValue(callout) || isSameValues(value, oldValue)) {
          resolve({})
          commit('setIsProcessing', {
            containerUuid,
            isLoading: false
          })
          dispatch('processCalloutQueue')
          return
        }

        const { id, fieldsList, isParentTab, firstTabUuid } = getters.getStoredTab(parentUuid, containerUuid)

        if (!isParentTab && !isEmptyValue(firstTabUuid)) {
          parentFieldsList = getters.getStoredFieldsFromTab(parentUuid, firstTabUuid)
        }

        getters.getValuesView({
          parentUuid,
          containerUuid
        }).filter(attribute => {
          const { columnName } = attribute
          return !isEmptyValue(attribute.value) &&
            !columnName.startsWith(DISPLAY_COLUMN_PREFIX) &&
            !columnName.endsWith(UNIVERSALLY_UNIQUE_IDENTIFIER_COLUMN_SUFFIX) &&
            !Object.prototype.hasOwnProperty.call(ROW_ATTRIBUTES, columnName)
        }).forEach(attribute => {
          const { columnName, value } = attribute
          let currentValue = value
          if (isEmptyValue(currentValue)) {
            currentValue = null
          }

          const field = fieldsList.find(fieldItem => fieldItem.column_name === columnName)
          let currentDisplayType = null
          if (!isEmptyValue(field)) {
            currentDisplayType = field.display_type
          } else {
            const parentField = parentFieldsList.find(fieldItem => fieldItem.column_name === columnName)
            if (!isEmptyValue(parentField)) {
              currentDisplayType = parentField.display_type
            }
          }

          if (getTypeOfValue(currentValue) !== 'OBJECT') {
            if (isDateField(currentDisplayType)) {
              currentValue = {
                type: 'date',
                value: currentValue
              }
            } else if (isDecimalField(currentDisplayType)) {
              currentValue = {
                type: 'decimal',
                value: currentValue
              }
            }
          }
          contextAttributes[columnName] = currentValue
        })

        if (getTypeOfValue(value) !== 'OBJECT') {
          if (isDateField(displayType)) {
            value = {
              type: 'date',
              value
            }
          } else if (isDecimalField(displayType)) {
            value = {
              type: 'decimal',
              value
            }
          }
        }

        const previousValues = {}
        fieldsList.forEach(fieldItem => {
          const { column_name } = fieldItem
          const oldStoredValue = getters.getValueOfFieldOnContainer({ parentUuid, containerUuid, columnName: column_name })
          previousValues[column_name] = oldStoredValue
          if (column_name === columnName) previousValues[column_name] = oldValue
        })

        runCallOutRequest({
          tabId: id,
          callout,
          tableName,
          columnName,
          value,
          oldValue,
          contextAttributes
        })
          .then(calloutResponse => {
            const { values } = calloutResponse

            const attributesList = convertObjectToKeyValue({ object: values })

            const rowIndex = getters.getTabRowIndex({ containerUuid, recordUuid })

            const currentRow = getters.getTabRowData({ containerUuid, recordUuid })

            attributesList.forEach(attribute => {
              const {
                value: attributeValue,
                columnName: attributeColumnName
              } = attribute

              const attributeOldValue = getters.getCurrentAttributes({ parentUuid, containerUuid, recordUuid, columnName: attributeColumnName })
              if (
                !isSameValues(attribute.value, attributeOldValue)
              ) {
                const field = fieldsList.find(fieldItem => fieldItem.column_name === attributeColumnName)
                if (!isEmptyValue(field)) {
                  dispatch('windowActionPerformed', {
                    columnName: attributeColumnName,
                    oldValue: attributeOldValue,
                    currentCallout: callout,
                    value: attributeValue,
                    containerUuid,
                    recordUuid,
                    field
                  })
                }
              }
            })
            dispatch('updateValuesOfContainer', {
              parentUuid,
              containerUuid,
              attributes: attributesList,
              isOverWriteParent: isParentTab
            })

            commit('setTabRow', {
              parentUuid,
              containerUuid,
              recordUuid,
              rowIndex,
              row: {
                ...ROW_ATTRIBUTES,
                ...currentRow,
                ...values
              }
            })
            commit('setIsProcessing', {
              containerUuid,
              isLoading: false
            })
            resolve(values)
          })
          .catch(error => {
            reject(error)
            commit('setIsProcessing', {
              containerUuid,
              isLoading: false
            })
            showMessage({
              message: error.message || lang.t('window.callout.error'),
              type: 'error'
            })
            console.warn(`Field ${columnName} error callout. Code ${error.code}: ${error.message}`)
          })
          .finally(() => {
            commit('setIsProcessing', {
              containerUuid,
              isLoading: false
            })
          })
      })
    }
  },
  getters: {
    getAllCalloutQueue: (state) => {
      return state.calloutQueue
    },
    isProcessing: (state) => ({
      containerUuid
    }) => {
      return state.isProcessing[containerUuid] || false
    }
  }
}

export default calloutManager
