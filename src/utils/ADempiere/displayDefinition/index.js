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

import store from '@/store'
import router from '@/router'
// Constants

// API Request Methods

// Utils and Helpers Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { isSalesTransaction } from '@/utils/ADempiere/contextUtils'
import { parseDate } from '@/utils/ADempiere/displayDefinition/resourceTime.js'
import { getUuidv4 } from '@/utils/ADempiere/recordUtil'

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
  currentkanban.records = currentkanban.records.filter(data => data.id !== recordId)
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
        group_id: value
      }
    ]
    currentkanban.records.push(...list)
  }
  console.log(isPanelRight)
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
      eventColor: colorResource, // resource color
      title: titleResource // resource title
    }))

    // Return the transformed group
    return {
      id: uuidGroup, // Unique group ID
      title: titleGroup, // Group title
      color: colorGroup, // Group color
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

// Mapa de funciones
const functionMap = {
  KANBAN: addNewRecordToListKanban,
  CALENDAR: addNewRecordToListCalendar,
  RESOURCE: addNewRecordToListResource
}

const functionMaDelete = {
  CALENDAR: addNewRecordToListCalendar,
  RESOURCE: addNewRecordToListResource,
  KANBAN: deleteRecordToListKanban
}

// Separate function to handle post-save actions
const handlePostSaveActions = ({
  response,
  isDelete = false,
  isEditRecord = false,
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
    const mandatoryFields = fieldList.filter(field => field.is_mandatory && field.is_insert_record)

    // Comprobar si hay campos obligatorios faltantes
    const hasMissingFields = mandatoryFields.some(field => !(field.column_name in attributes))

    return hasMissingFields
  },
  updateField({
    recordId,
    attributes = {},
    displyDefinitions,
    currentTab,
    isPanelRight
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
            isEditRecord: true
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
    displyDefinitions,
    attributes = {},
    isPanelRight,
    currentTab,
    keyAttribute
  }) {
    return new Promise((resolve) => {
      const persistenceAttributes = getDefaultAttributes({ currentTab })
      if (isPanelRight) {
        attributes[currentTab.table_name + '_ID'] = getCurrentRecord()
      }

      store.dispatch('saveRecord', {
        displayDefinitionId: displyDefinitions.id,
        isResource: displyDefinitions.is_resource,
        attributes: { ...persistenceAttributes, ...attributes }
      })
        .then(response => {
          handlePostSaveActions({
            response,
            displyDefinitions,
            isPanelRight,
            currentTab,
            attributes,
            keyAttribute
          })
          resolve()
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
  }
}
