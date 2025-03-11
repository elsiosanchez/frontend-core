/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Elsio Sanchez ElsioSanchez15@outlook.com https://github.com/ElsioSanchez
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

import language from '@/lang'
import store from '@/store'
import router from '@/router'
// Constants
import { FINANCIAL_REPORT_CODE } from '@/utils/ADempiere/dictionary/report/financialReport.ts'

// API Request Methods

// Utils and Helpers Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { isSalesTransaction } from '@/utils/ADempiere/contextUtils'
import { parseDate } from '@/utils/ADempiere/displayDefinition/resourceTime.js'
import { getUuidv4 } from '@/utils/ADempiere/recordUtil'
import { showMessage } from '@/utils/ADempiere/notification'
import { containerManager as containerManagerReport } from '@/utils/ADempiere/dictionary/report'

import {
  COLUMNNAME_AD_Table_ID, COLUMNNAME_Record_ID
} from '@/utils/ADempiere/constants/systemColumns'
export function getCurrentRecord(recordId) {
  const { currentTab } = store.getters.getContainerInfo
  const { query } = router.app._route
  if (isEmptyValue(recordId)) {
    if (!isEmptyValue(query.recordId)) return query.recordId
    if (!isEmptyValue(currentTab)) {
      return store.getters.getIdOfContainer({
        containerUuid: currentTab.containerUuid,
        tableName: currentTab.table_name
      })
    }
  }
  return recordId
}

function deleteRecordToListKanban({
  isPanelRight,
  currentTab,
  recordId
}) {
  let currentkanban
  if (isPanelRight) {
    currentkanban = store.getters.getCurrentKanbanPanelRightDefinition({
      tableName: currentTab.table_name
    })
  } else {
    currentkanban = store.getters.getCurrentKanbanDefinition({
      tableName: currentTab.table_name
    })
  }

  currentkanban.steps.forEach(step => {
    step.records = step.records.filter(record => record.id !== recordId)
  })
  if (isPanelRight) {
    store.commit('setCurrentKanbanRightDefinition', {
      tableName: currentTab.table_name,
      currentkanban: currentkanban
    })
    return
  }
  store.commit('setCurrentKanbanDefinition', {
    tableName: currentTab.table_name,
    currentkanban: currentkanban
  })
}

// Delete Record from Expand/Collapse
function deleteRecordToListCollapse({
  isPanelRight,
  currentTab,
  recordId
}) {
  let currentCollapse
  if (isPanelRight) {
    currentCollapse = store.getters.getCurrentCollapsePanelRightDefinition({
      tableName: currentTab.table_name
    })
  } else {
    currentCollapse = store.getters.getCurrentCollapseDefinition({
      tableName: currentTab.table_name
    })
  }
  currentCollapse.groups.forEach(group => {
    group.records = group.records.filter(record => record.id !== recordId)
  })
  if (isPanelRight) {
    store.commit('setCollapsePanelTabDefinition', {
      tableName: currentTab.table_name,
      currentCollapse
    })
    return
  }
  store.commit('setCollapseDefinition', {
    tableName: currentTab.table_name,
    currentCollapse
  })
}

// Delete Record from HIERARCHY
function deleteRecordToHierarchy({
  isPanelRight,
  currentTab,
  recordId
}) {
  let currentGroup
  if (isPanelRight) {
    currentGroup = store.getters.getCurrentGroupPanelRightDefinition({
      tableName: currentTab.table_name
    })
  } else {
    currentGroup = store.getters.getCurrentGroupDefinition({
      tableName: currentTab.table_name
    })
  }
  currentGroup.records.forEach(group => {
    group.records = group.records.filter(record => record.id !== recordId)
  })
  if (isPanelRight) {
    store.commit('setGroupPanelTabDefinition', {
      tableName: currentTab.table_name,
      currentGroup
    })
    return
  }
  store.commit('setGroupDefinition', {
    tableName: currentTab.table_name,
    currentGroup
  })
}

// Delete Record from Mosaic

function deleteRecordToMosaic({
  displayDefinition,
  isPanelRight,
  currentTab,
  recordId
}) {
  let currentMosaic
  if (isPanelRight) {
    currentMosaic = store.getters.getCurrentMosaicPanelRightDefinition({
      tableName: currentTab.table_name
    })
  } else {
    currentMosaic = store.getters.getCurrentMosaicDefinition({
      tableName: displayDefinition.table_name
    })
  }
  const { records } = currentMosaic
  const recordList = []
  records.forEach(element => {
    if (element.id !== recordId) {
      recordList.push(element)
    }
  })

  if (isPanelRight) {
    store.commit('setMosaicPanelTabDefinition', {
      tableName: currentTab.table_name,
      currentMosaic: {
        ...currentMosaic,
        records: recordList,
        record_count: recordList.length
      }
    })
    return
  }
  store.commit('setMosaicDefinition', {
    tableName: displayDefinition.table_name,
    currentMosaic: {
      ...currentMosaic,
      records: recordList,
      record_count: recordList.length
    }
  })
}

/**
 * Add New Record to Panel Kanban
 */

function addNewRecordToListKanban({
  isPanelRight,
  newRecord,
  keyAttribute,
  currentTab,
  displayDefinition,
  isEditRecord
}) {
  const {
    table_name,
    group_column
  } = displayDefinition
  let currentkanban
  if (isPanelRight) {
    currentkanban = store.getters.getCurrentKanbanPanelRightDefinition({
      tableName: currentTab.table_name
    })
  } else {
    currentkanban = store.getters.getCurrentKanbanDefinition({
      tableName: table_name
    })
  }
  if (isEditRecord) {
    currentkanban.records = currentkanban.records.map(data => {
      if (data.id === newRecord.id) {
        return {
          ...data,
          ...newRecord
        }
      }
      return {
        ...data
      }
    })
  } else {
    const { fields } = newRecord
    let value = keyAttribute[group_column]
    if (!isEmptyValue(fields[group_column]) && !isEmptyValue(fields[group_column].value)) {
      value = fields[group_column].value
    }
    const list = [
      {
        ...newRecord,
        group_id: String(value)
      }
    ]
    let stepIndex = currentkanban.steps.findIndex(step =>
      String(step.value) === String(list[0].group_id)
    )
    if (stepIndex < 0) stepIndex = 0
    if (isEmptyValue(currentkanban.steps[stepIndex])) {
      currentkanban.steps[stepIndex] = { records: [...list] }
    } else {
      currentkanban.steps[stepIndex].records.push(...list)
    }
  }
  if (isPanelRight) {
    store.commit('setCurrentKanbanRightDefinition', {
      tableName: currentTab.table_name,
      currentkanban: currentkanban
    })
    return
  }
  store.commit('setCurrentKanbanDefinition', {
    tableName: table_name,
    currentkanban: currentkanban
  })
}

/**
 * Add New Record to Panel Collapse
 */

function addNewRecordToListCollapse({
  isPanelRight,
  newRecord,
  keyAttribute,
  currentTab,
  displayDefinition,
  isEditRecord
}) {
  const {
    table_name,
    group_column
  } = displayDefinition
  let currentCollapse
  if (isPanelRight) {
    currentCollapse = store.getters.getCurrentCollapsePanelRightDefinition({
      tableName: currentTab.table_name
    })
  } else {
    currentCollapse = store.getters.getCurrentCollapseDefinition({
      tableName: table_name
    })
  }
  if (isEditRecord) {
    currentCollapse.records = currentCollapse.records.map(data => {
      if (data.id === newRecord.id) {
        return {
          ...data,
          ...newRecord
        }
      }
      return {
        ...data
      }
    })
  } else {
    let indexColumn = currentCollapse.groups.findIndex(list => list.value === keyAttribute[group_column])
    if (indexColumn < 0) indexColumn = 0
    if (isEmptyValue(currentCollapse.groups[indexColumn])) {
      currentCollapse.groups[indexColumn] = { records: [...newRecord, ...keyAttribute] }
    } else {
      currentCollapse.groups[indexColumn].records.push({
        ...newRecord,
        ...keyAttribute
      })
    }
  }
  if (isPanelRight) {
    store.commit('setCollapsePanelTabDefinition', {
      tableName: currentTab.table_name,
      currentCollapse
    })
    return
  }
  store.commit('setCollapseDefinition', {
    tableName: table_name,
    currentCollapse
  })
}

/**
 * Add New Record to Panel Hierarchy
 */

function addNewRecordToHierarchy({
  isPanelRight,
  newRecord,
  keyAttribute,
  currentTab,
  displayDefinition,
  isEditRecord
}) {
  const {
    table_name
  } = displayDefinition
  let currentGroup
  if (isPanelRight) {
    currentGroup = store.getters.getCurrentGroupPanelRightDefinition({
      tableName: currentTab.table_name
    })
  } else {
    currentGroup = store.getters.getCurrentGroupDefinition({
      tableName: table_name
    })
  }
  if (isEditRecord) {
    currentGroup.records.childs = currentGroup.records.childs.map(data => {
      if (data.id === newRecord.id) {
        return {
          ...data,
          ...newRecord
        }
      }
      return {
        ...data
      }
    })
  } else {
    currentGroup.records.push({
      ...newRecord
    })
  }
  if (isPanelRight) {
    store.commit('setGroupPanelTabDefinition', {
      tableName: currentTab.table_name,
      currentGroup
    })
    return
  }
  store.commit('setGroupDefinition', {
    tableName: table_name,
    currentGroup
  })
}

/**
 * New Record Mosaic
 */

function addNewRecordToMosaic({
  isPanelRight,
  newRecord,
  currentTab,
  displayDefinition,
  isEditRecord
}) {
  let currentMosaic
  if (isPanelRight) {
    currentMosaic = store.getters.getCurrentMosaicPanelRightDefinition({
      tableName: currentTab.table_name
    })
  } else {
    currentMosaic = store.getters.getCurrentMosaicDefinition({
      tableName: displayDefinition.table_name
    })
  }

  currentMosaic.records.push(newRecord)

  if (isPanelRight) {
    store.commit('setMosaicPanelTabDefinition', {
      tableName: currentTab.table_name,
      currentMosaic
    })
    return
  }
  store.commit('setMosaicDefinition', {
    tableName: displayDefinition.table_name,
    currentMosaic
  })
}

/**
 * Resource
 */

export function transformEvents({
  records
}) {
  return records.map(({ id, title, name, valid_from, valid_to, description }) => {
    const start = isEmptyValue(valid_from) ? valid_to : valid_from
    const end = isEmptyValue(valid_to) ? valid_from : valid_to

    return {
      id,
      title: `${title} - ${name}`,
      start: parseDate(start),
      textColor: '#FFFFFF',
      borderColor: '#080062',
      eventColor: '#558BF7',
      end: parseDate(end),
      resourceId: id,
      description
    }
  })
}

/**
 * Transforms an array of groups into a structured resource list.
 * Each group becomes an object with a unique ID, a title, a color and a list of child resources.
 *
 * @param {Array} groups - Array of groups, where each group contains a color, a name and a list of resources.
 * @returns {Array} - Array of transformed objects, where each object represents a group with its child resources.
 */

export function transformResources({
  groups
}) {
  return groups.map(({ color: colorGroup, name: titleGroup, resources }) => {
    // Generates a unique ID for the group
    const uuidGroup = getUuidv4()

    // Transforms each resource within the group
    const resourcesChilds = resources.map(({ id, color: colorResource, name: titleResource }) => ({
      id, // ID del recurso
      // eventColor: colorResource, // resource color
      eventColor: '#558BF7',
      borderColor: '#000000',
      textColor: '#FFFFFF',
      title: titleResource // resource title
    }))

    // Return the transformed group
    return {
      id: uuidGroup, // Unique group ID
      title: titleGroup, // Group title
      eventColor: '#909399', // Group color
      borderColor: '#000000',
      textColor: '#FFFFFF',
      children: resourcesChilds // List of child resources
    }
  })
}

/**
 * Add New Record to Panel Resource
 */
function addNewRecordToListResource({
  isPanelRight,
  currentTab,
  displayDefinition
}) {
  const {
    table_name,
    id
  } = displayDefinition

  // let currentResource
  if (isPanelRight) {
    const {
      startStr,
      endStr
    } = store.getters.getResourcePanelRightDefinitions({
      tableName: currentTab.table_name
    })

    store.dispatch('changeDateRange', {
      id,
      endStr,
      startStr,
      isPanel: isPanelRight,
      tableName: currentTab.table_name,
      recordId: getCurrentRecord()
    })
    return
  }
  const {
    startStr,
    endStr
  } = store.getters.getResourceDefinition({
    tableName: table_name
  })
  const listFilters = store.getters.getDisplayFilters({ tableName: table_name })
  store.dispatch('changeDateRange', {
    id,
    endStr,
    startStr,
    listFilters,
    isPanel: false,
    tableName: table_name
  })
  return
}

/**
 * Add New Record to Panel Calendar
 */
function addNewRecordToListCalendar({
  displayDefinition,
  isPanelRight,
  currentTab
}) {
  const {
    table_name,
    id
  } = displayDefinition
  if (isPanelRight) {
    store.dispatch('changeDateCalendar', {
      id,
      isPanel: isPanelRight,
      tableName: currentTab.table_name,
      recordId: getCurrentRecord()
    })
    return
  } else {
    const filtersList = store.getters.getDisplayFilters({ tableName: table_name })
    store.dispatch('changeDateCalendar', {
      id,
      filters: filtersList,
      isPanel: isPanelRight,
      tableName: table_name
    })
  }
}

function closeModalDefinition({
  displyDefinitions,
  show = false,
  name = ''
}) {
  store.dispatch('changeTabPanelDefinition', {
    displyDefinitions,
    name
  })
  store.commit('setShowPanel', {
    id: displyDefinitions.id,
    show
  })
}

// Reusable helper for filtering valid attributes
const filterValidAttributes = (items) => {
  return items.reduce((acc, { columnName, value }) => {
    if (!isEmptyValue(columnName) && !isEmptyValue(value)) {
      acc[columnName] = value
    }
    return acc
  }, {})
}

// Function to Obtain Default Attributes
const getDefaultAttributes = ({ currentTab }) => {
  const { parentUuid, containerUuid } = currentTab
  const { fieldsList } = store.getters.getStoredTab(parentUuid, containerUuid)

  const isSOTrx = isSalesTransaction({
    parentUuid,
    containerUuid,
    isRecord: false
  })

  const parsedDefaults = store.getters.getTabParsedDefaultValue({
    parentUuid,
    containerUuid,
    isSOTrxDictionary: isSOTrx,
    fieldsList
  })

  return filterValidAttributes(parsedDefaults)
}

// Process

function runProcess({
  uuid,
  tableName,
  containerUuid,
  recordId,
  containerManager,
  storedTab,
  title,
  currentDisplyDefinitions
}) {
  const currentRoute = router.app._route
  const { query, params } = currentRoute
  store.dispatch('setModalDialog', {
    containerUuid,
    title,
    containerManager,
    doneMethod: ({ parentUuid, containerUuid }) => {
      const recordUuid = store.getters.getUuidOfContainer(parentUuid)
      if (isEmptyValue(recordId)) {
        if (!isEmptyValue(query.recordId)) {
          recordId = query.recordId
        }
        if (isEmptyValue(recordId) && !isEmptyValue(params.recordId)) {
          recordId = params.recordId
        }
      }
      store.dispatch('startProcessOfWindows', {
        parentUuid,
        containerUuid,
        tableName,
        recordId,
        recordUuid
      })
        .then(async response => {
          store.dispatch('readRecordData', {
            recordId,
            displayDefinitionId: currentDisplyDefinitions.id
          })
          // await refreshRecord.refreshRecord({
          //   parentUuid,
          //   tabId: storedTab.id,
          //   recordUuid,
          //   recordId
          // })
        })
    },
    beforeOpen: ({ parentUuid, containerUuid }) => {
      const parentValues = store.getters.getValuesView({
        containerUuid: parentUuid,
        isOnlyColumns: true,
        isOnlyWithValue: false,
        format: 'array'
      })
      parentValues.push({
        columnName: currentDisplyDefinitions.table_name + '_ID',
        value: recordId
      })
      parentValues.push({
        columnName: COLUMNNAME_AD_Table_ID,
        value: currentDisplyDefinitions.table_id
      })
      parentValues.push({
        columnName: COLUMNNAME_Record_ID,
        value: recordId
      })
      currentDisplyDefinitions.field_definitions.forEach(data => {
        parentValues.push({
          columnName: data.column_name,
          value: data.internal_id
        })
      })
      store.dispatch('updateValuesOfContainer', {
        containerUuid,
        attributes: parentValues
      })
    },
    loadData: ({ parentUuid, containerUuid }) => {
      const processDefinition = store.getters.getStoredProcess(parentUuid)
      if (!isEmptyValue(processDefinition)) {
        return Promise.resolve(processDefinition)
      }

      return store.dispatch('getProcessDefinitionFromServer', {
        id: uuid.toString(),
        containerUuidAssociated: containerUuid
      })
    },
    // TODO: Change to string and import dynamic in component
    componentPath: () => import('@/components/ADempiere/PanelDefinition/index.vue'),
    isShowed: true
  })
}

function runProcessReport({
  uuid,
  tableName,
  containerUuid,
  recordId,
  containerManager,
  storedTab,
  parentUuid,
  title
}) {
  store.dispatch('getReportDefinitionFromServer', {
    id: uuid,
    tableName
  })
    .then(response => {
      if (!isEmptyValue(response)) {
        const doneMethodByReport = ({ parentUuid: tabAssociatedUuid, containerUuid }) => {
          const emptyMandatory = store.getters.getFieldsListEmptyMandatory({
            containerUuid: uuid
          })
          if (!isEmptyValue(emptyMandatory)) {
            showMessage({
              message: language.t('notifications.mandatoryFieldMissing') + emptyMandatory,
              type: 'info'
            })
            return
          }
          const recordUuid = store.getters.getUuidOfContainer(parentUuid)
          let code = ''
          if (
            !isEmptyValue(uuid)
          ) {
            const storedReportDefinition = store.getters.getStoredReport(uuid)
            if (!isEmptyValue(storedReportDefinition)) {
              code = storedReportDefinition.code
            }
          }
          if (code === FINANCIAL_REPORT_CODE) {
            store.dispatch('startReport', {
              parentUuid: parentUuid,
              containerUuid: uuid,
              recordUuid,
              tableName,
              pageSize: 500
            })
          } else {
            store.dispatch('runReport', {
              parentUuid: parentUuid,
              containerUuid: uuid,
              recordUuid,
              recordId,
              tableName
            })
          }
        }
        store.dispatch('setModalDialog', {
          containerUuid: uuid,
          title,
          containerManager: containerManagerReport,
          doneMethod: doneMethodByReport,
          beforeOpen: ({ parentUuid: tabAssociatedUuid, containerUuid }) => {
            // set context values
            const parentValues = store.getters.getValuesView({
              containerUuid: tabAssociatedUuid,
              isOnlyColumns: true,
              isOnlyWithValue: false,
              format: 'array'
            })
            // const parentValues = getContextAttributes({
            //   parentUuid: windowUuid,
            //   containerUuid: tabAssociatedUuid,
            //   contextColumnNames: relatedColumns
            // })
            parentValues.push({
              columnName: COLUMNNAME_AD_Table_ID,
              value: storedTab.table.internal_id
            })
            parentValues.push({
              columnName: COLUMNNAME_Record_ID,
              value: recordId
            })

            store.dispatch('updateValuesOfContainer', {
              containerUuid: uuid,
              attributes: parentValues
            })
          },
          loadData: ({ parentUuid: tabAssociatedUuid, containerUuid }) => {
            const reportDefinition = store.getters.getStoredReport(uuid)
            if (!isEmptyValue(reportDefinition)) {
              // clear values to report associated and set with tab
              store.dispatch('setReportDefaultValues', {
                parentUuid: tabAssociatedUuid,
                containerUuid: uuid
              })
              // auto run report if without parameters
              if (!reportDefinition.has_parameters || isEmptyValue(reportDefinition.fieldsList)) {
                // close modal dialog
                store.commit('setShowedModalDialog', {
                  containerUuid: reportDefinition.uuid,
                  isShowed: false
                })
                doneMethodByReport({
                  parentUuid: tabAssociatedUuid,
                  containerUuid
                })
              }
              return Promise.resolve(reportDefinition)
            }
            return store.dispatch('getReportDefinitionFromServer', {
              isLegacyReport: true,
              id: uuid,
              tableName
            })
              .then(reportDefinitionResponse => {
                // auto run report if without parameters
                if (isEmptyValue(reportDefinitionResponse.fieldsList)) {
                  // close modal dialog
                  store.commit('setShowedModalDialog', {
                    containerUuid: uuid,
                    isShowed: false
                  })
                  doneMethodByReport({
                    parentUuid: tabAssociatedUuid,
                    containerUuid
                  })
                }
              })
              .finally(() => {
                // clear values to report associated and set with tab
                store.dispatch('setReportDefaultValues', {
                  parentUuid: tabAssociatedUuid,
                  containerUuid: uuid
                })
              })
          },
          // TODO: Change to string and import dynamic in component
          componentPath: () => import('@/components/ADempiere/PanelDefinition/index.vue'),
          isShowed: true
        })
      }
    })
}

// Function Change Records Size Hierarchy

function changePageSizeToHierarchy({
  id,
  searchValue,
  tableName,
  pageSize,
  pageToken,
  recordId,
  isPanelRight
}) {
  store.dispatch('requestGroup', {
    id,
    tableName,
    recordId,
    searchValue,
    isPanel: isPanelRight,
    pageSize,
    pageToken
  })
}

// Function Change Records Size Mosaic

function changePageSizeToMosaic({
  id,
  searchValue,
  tableName,
  pageSize,
  pageToken,
  recordId,
  isPanelRight
}) {
  store.dispatch('requestMosaic', {
    id,
    tableName,
    recordId,
    searchValue,
    isPanel: isPanelRight,
    pageSize,
    pageToken
  })
}

// Function Change Records Size Collapse

function changePageSizeToCollapse({
  id,
  searchValue,
  tableName,
  pageSize,
  pageToken,
  recordId,
  isPanelRight
}) {
  store.dispatch('requestCollapse', {
    id,
    tableName,
    recordId,
    searchValue,
    isPanel: isPanelRight,
    pageSize,
    pageToken
  })
}

// Mapa de funciones
const functionMap = {
  KANBAN: addNewRecordToListKanban,
  CALENDAR: addNewRecordToListCalendar,
  RESOURCE: addNewRecordToListResource,
  EXPAND_COLLAPSE: addNewRecordToListCollapse,
  MOSAIC: addNewRecordToMosaic,
  HIERARCHY: addNewRecordToHierarchy
}

const functionMaDelete = {
  CALENDAR: addNewRecordToListCalendar,
  RESOURCE: addNewRecordToListResource,
  KANBAN: deleteRecordToListKanban,
  EXPAND_COLLAPSE: deleteRecordToListCollapse,
  MOSAIC: deleteRecordToMosaic,
  HIERARCHY: deleteRecordToHierarchy
}

const functionProcess = {
  Process: runProcess,
  Report: runProcessReport
}

const functionChangePageSize = {
  HIERARCHY: changePageSizeToHierarchy,
  MOSAIC: changePageSizeToMosaic,
  EXPAND_COLLAPSE: changePageSizeToCollapse
}
// Separate function to handle post-save actions
const handlePostSaveActions = ({
  response,
  isDelete = false,
  isEditRecord = false,
  isBachtEntry = false,
  displyDefinitions,
  isPanelRight,
  currentTab,
  keyAttribute,
  attributes,
  recordId
}) => {
  const actionType = displyDefinitions.type?.toUpperCase()
  let functionToCall
  if (isDelete) {
    functionToCall = functionMaDelete[actionType]
    functionToCall({
      isPanelRight,
      currentTab,
      keyAttribute,
      displayDefinition: displyDefinitions,
      recordId
    })
    return
  }
  functionToCall = functionMap[actionType]
  if (functionToCall) {
    functionToCall({
      isPanelRight,
      newRecord: {
        id: response.id,
        ...response
      },
      attributes,
      currentTab,
      keyAttribute,
      displayDefinition: displyDefinitions,
      isEditRecord
    })
    if (isBachtEntry) return
  }
  if (!isEditRecord) {
    closeModalDefinition({ displyDefinitions })
  }
}

/**
 * Container Manage the Field Definition
 */
export const containerManagerFieldDefinition = {
  isDisplayedField({
    isNewRecord = false,
    is_insert_record,
    is_displayed
  }) {
    if (!isNewRecord) return is_displayed
    return is_displayed && is_insert_record
  },
  validateMandatoryFieldsEmpty({
    fieldList = [],
    attributes = {}
  }) {
    if (isEmptyValue(fieldList)) return false

    // Filtrar los campos obligatorios
    const mandatoryFields = fieldList.filter(field => field.is_mandatory && field.is_insert_record && field.is_displayed)
    // Comprobar si hay campos obligatorios faltantes
    const hasMissingFields = mandatoryFields.some(field => !(field.column_name in attributes))

    return hasMissingFields
  },
  updateField({
    recordId,
    attributes = {},
    displyDefinitions,
    currentTab,
    isPanelRight,
    isEditRecord = true
  }) {
    return new Promise((resolve, reject) => {
      if (isEmptyValue(attributes)) return resolve()
      store.dispatch('updateField', {
        id: recordId,
        attributes,
        isResource: displyDefinitions.is_resource,
        displayDefinitionId: displyDefinitions.id
      })
        .then(response => {
          handlePostSaveActions({
            response,
            displyDefinitions,
            isPanelRight,
            currentTab,
            attributes,
            isEditRecord
          })
          resolve()
        })
        .catch(() => {
          reject()
        })
        .finally(() => {
          resolve()
        })
    })
  },
  createNewRecord({
    parentUuid,
    displyDefinitions,
    attributes = {},
    isPanelRight,
    currentTab,
    keyAttribute,
    isBachtEntry = false
  }) {
    return new Promise((resolve) => {
      const persistenceAttributes = getDefaultAttributes({
        currentTab
      })
      if (isPanelRight) {
        attributes[currentTab.table_name + '_ID'] = getCurrentRecord()
      }

      const contextAttributesList = store.getters.getValuesView({
        parentUuid: parentUuid,
        isOnlyColumns: true,
        format: 'object'
      })
      contextAttributesList[displyDefinitions.group_column] = attributes[displyDefinitions.group_column]
      let contextAttributes = '{}'
      if (!isEmptyValue(contextAttributesList)) {
        contextAttributes = JSON.stringify(contextAttributesList)
      }

      store.dispatch('saveRecord', {
        displayDefinitionId: displyDefinitions.id,
        isResource: displyDefinitions.is_resource,
        contextAttributes,
        attributes: {
          ...persistenceAttributes,
          ...attributes
        }
      })
        .then(response => {
          handlePostSaveActions({
            response,
            displyDefinitions,
            isPanelRight,
            currentTab,
            attributes,
            keyAttribute,
            isBachtEntry
          })
          resolve(response)
        })
        .finally(() => {
          resolve()
        })
    })
  },
  async loadRecord({
    recordId,
    displayDefinitionId
  }) {
    store.dispatch('readRecordData', {
      recordId,
      displayDefinitionId
    })
  },
  async deleteRecord({
    recordId,
    currentTab,
    isPanelRight,
    displyDefinitions
  }) {
    store.dispatch('removerRecord', {
      recordId,
      isResource: displyDefinitions.is_resource,
      displayDefinitionId: displyDefinitions.id
    })
      .then(() => {
        store.commit('setShowPanel', {
          id: displyDefinitions.id,
          show: false
        })
        handlePostSaveActions({
          isPanelRight,
          isDelete: true,
          currentTab,
          displyDefinitions,
          recordId
        })
      })
  },
  async processDisplay({
    uuid,
    tableName,
    containerUuid,
    recordId,
    containerManager,
    storedTab,
    isReport,
    parentUuid,
    title,
    currentDisplyDefinitions
  }) {
    let typeProcess = 'Process'
    if (isReport) typeProcess = 'Report'
    const functionToCall = functionProcess[typeProcess]
    if (functionToCall) {
      functionToCall({
        uuid,
        tableName,
        containerUuid,
        recordId,
        containerManager,
        storedTab,
        parentUuid,
        title,
        currentDisplyDefinitions
      })
      return
    }
  },
  async changeSizeRecords({
    id,
    recordId,
    tableName,
    displyDefinitions,
    isPanelRight = false,
    pageToken,
    pageSize = 25
  }) {
    const actionType = displyDefinitions.type?.toUpperCase()
    const functionToCall = functionChangePageSize[actionType]
    functionToCall({
      id,
      recordId,
      tableName,
      isPanelRight,
      pageToken,
      pageSize
    })
  }
}
