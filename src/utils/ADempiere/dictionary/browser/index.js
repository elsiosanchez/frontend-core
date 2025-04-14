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

import store from '@/store'
import language from '@/lang'

// Constants
import {
  DISPLAY_COLUMN_PREFIX
} from '@/utils/ADempiere/dictionaryUtils'
import { BUTTON } from '@/utils/ADempiere/references'
import { DEFAULT_EXPORT_TYPE } from '@/utils/ADempiere/exportUtil.js'

// API Request Methods
import { requestSaveBrowseCustomization } from '@/api/ADempiere/user-customization/browsers'

// Utils and Helpers Methods
import { isHiddenField } from '@/utils/ADempiere/references'
import { isEmptyValue, isSameValues } from '@/utils/ADempiere/valueUtils.js'
import { convertStringToBoolean } from '@/utils/ADempiere/formatValue/booleanFormat'
import { showNotification } from '@/utils/ADempiere/notification.js'
import { exportFileFromJson, exportRecords } from '@/utils/ADempiere/exportUtil.js'
import { clientDateTime } from '@/utils/ADempiere/formatValue/dateFormat'
import { formatField } from '@/utils/ADempiere/valueFormat'
import { decodeHtmlEntities } from '@/utils/ADempiere/formatValue/stringFormat'
import { runProcessOfBrowser } from '@/utils/ADempiere/dictionary/browser/actionsMenu'

/**
 * Is displayed field in panel query criteria
 */
export function isDisplayedField({ display_type, is_query_criteria, display_logic, isDisplayedFromLogic }) {
  // button field not showed
  if (isHiddenField(display_type)) {
    return false
  }

  return is_query_criteria && (isEmptyValue(display_logic) || isDisplayedFromLogic)
}

/**
 * Default showed field from user
 */
export function evaluateDefaultFieldShowed({
  display_type, is_query_criteria,
  isShowedFromUser, is_displayed_as_panel,
  default_value, parsedDefaultValue, display_logic,
  is_mandatory, isMandatoryFromLogic, mandatory_logic
}) {
  if (!isEmptyValue(is_displayed_as_panel)) {
    return convertStringToBoolean(is_displayed_as_panel)
  }
  if (!isEmptyValue(display_logic)) {
    return true
  }
  const isMandatoryGenerated = isMandatoryField({
    display_type, is_query_criteria, is_mandatory, isMandatoryFromLogic, mandatory_logic
  })
  if (isMandatoryGenerated) {
    return true
  }
  if (!isEmptyValue(default_value) || !isEmptyValue(parsedDefaultValue)) {
    return true
  }
  return Boolean(isShowedFromUser)
}

/**
 * Smart Browser not manager mandatory logic, used as query
 * @param {boolean} isMandatoryFromLogic
 * @returns {boolean}
 */
export function isMandatoryField({ display_type, is_query_criteria, is_mandatory, isMandatoryFromLogic, mandatory_logic }) {
  if (display_type === BUTTON.id) {
    return false
  }
  return is_query_criteria && (is_mandatory || (!isEmptyValue(mandatory_logic) && isMandatoryFromLogic))
}

export function isReadOnlyField({ is_query_criteria, operator, isReadOnlyFromLogic }) {
  return is_query_criteria && isReadOnlyFromLogic // || IGNORE_VALUE_OPERATORS_LIST.includes(operator)
}

export function evaluateDefaultColumnShowed({
  is_key, display_type, is_displayed,
  isShowedTableFromUser, is_displayed_as_table,
  is_mandatory, isMandatoryFromLogic, mandatory_logic
}) {
  // if (!is_displayed) {
  //   return false;
  // }
  if (!isEmptyValue(is_displayed_as_table)) {
    return convertStringToBoolean(is_displayed_as_table)
  }
  // const isDisplayedColumnGenerated = isDisplayedColumn({
  //   is_key,
  //   display_type,
  //   isDisplayed,
  //   is_mandatory,
  //   isMandatoryFromLogic,
  //   mandatory_logic
  // })
  // if (!isDisplayedColumnGenerated) {
  //   return
  // }
  // const isMandatoryGenerated = isMandatoryColumn({
  //   display_type, is_mandatory, isMandatoryFromLogic, mandatory_logic
  // })
  // if (isMandatoryGenerated) {
  //   return true
  // }

  // return Boolean(isShowedTableFromUser)
  return true
}

/**
 * Is displayed column in table multi record
 */
export function isDisplayedColumn({ display_type, is_displayed, is_key, isGeneratedRange }) {
  // column check to selection or button field not showed
  if (is_key || isGeneratedRange || isHiddenField(display_type)) {
    return false
  }

  return is_displayed
}

export function isMandatoryColumn({ display_type, is_mandatory, isMandatoryFromLogic, mandatory_logic }) {
  if (display_type === BUTTON.id) {
    return false
  }
  return is_mandatory || (!isEmptyValue(mandatory_logic) && isMandatoryFromLogic)
}

/**
 * Read only column in table multi record
 * @param {boolean} is_read_only
 * @returns {boolean}
 */
export function isReadOnlyColumn({ is_read_only }) {
  return is_read_only
}

export function changeFieldAttribure({
  containerUuid,
  columnName,
  attributeName,
  attributeValue
}) {
  return store.dispatch('changeBrowseFieldAttribute', {
    containerUuid,
    columnName,
    attributeName,
    attributeValue
  })
}

/**
 * Manage the browser panel
 */
export const containerManager = {
  getPanel({ containerUuid }) {
    return store.getters.getStoredBrowser(containerUuid)
  },
  changePanelAttribute({
    containerUuid,
    attributeName,
    attributeValue
  }) {
    store.commit('changeBrowserAttribute', {
      uuid: containerUuid,
      attributeName,
      attributeValue
    })
  },
  getFieldsList({ containerUuid }) {
    return store.getters.getStoredFieldsFromBrowser(containerUuid)
  },
  getFieldsToHidden: ({ containerUuid, showedMethod, isEvaluateDefaultValue, isTable, fieldsList }) => {
    return store.getters.getBrowserFieldsListToHidden({
      containerUuid,
      fieldsList,
      showedMethod,
      isEvaluateDefaultValue,
      isTable
    })
  },

  actionPerformed({ field, value, valueTo, containerUuid }) {
    return store.dispatch('browserActionPerformed', {
      containerUuid,
      field,
      value,
      valueTo
    })
  },

  setDefaultValues: ({ parentUuid, containerUuid }) => {
    store.dispatch('setBrowserDefaultValues', {
      parentUuid,
      containerUuid
    })
  },

  /**
   * Is displayed field in panel single record
   */
  isDisplayedField,
  isDisplayedDefault: ({ is_mandatory }) => {
    // add is showed from user
    if (is_mandatory) {
      return true
    }
    return false
  },
  isDisplayedColumn,
  isDisplayedDefaultTable: ({ is_mandatory, is_key }) => {
    if (is_mandatory && !is_key) {
      return true
    }
    return false
  },

  isMandatoryField,
  isMandatoryColumn,

  isReadOnlyField,

  changeFieldAttribure,
  changeFieldShowedFromUser({ containerUuid, fieldsShowed }) {
    store.dispatch('changeBrowserFieldShowedFromUser', {
      containerUuid,
      fieldsShowed
    })
  },
  changeColumnShowedFromUser({ parentUuid, containerUuid, fieldsShowed }) {
    store.dispatch('changeBrowseColumnShowedFromUser', {
      parentUuid,
      containerUuid,
      fieldsShowed
    })
  },

  setSelection: ({
    containerUuid,
    recordsSelected
  }) => {
    store.commit('setBrowserSelectionsList', {
      containerUuid,
      selectionsList: recordsSelected
    })
  },
  getSelection: ({
    containerUuid
  }) => {
    return store.getters.getBrowserSelectionsList({
      containerUuid
    })
  },
  getRecordCount({ containerUuid }) {
    return store.getters.getBrowserRecordCount({
      containerUuid
    })
  },

  getRecordsList: ({ containerUuid }) => {
    return store.getters.getBrowserRecordsList({
      containerUuid: containerUuid
    })
  },

  setRow: ({ containerUuid, rowUid, row }) => {
    return store.commit('setBrowserRow', {
      containerUuid,
      rowUid,
      row
    })
  },
  getRow: ({ containerUuid, rowUid }) => {
    return store.getters.getBrowserRowData({
      containerUuid,
      rowUid
    })
  },

  setCell: ({ containerUuid, rowUid, columnName, value }) => {
    return store.commit('setBrowserCell', {
      containerUuid,
      rowUid,
      columnName,
      value
    })
  },
  getCell: ({ containerUuid, rowUid, columnName }) => {
    return store.getters.getBrowserCellData({
      containerUuid,
      rowUid,
      columnName
    })
  },

  setPageNumber: ({ containerUuid, pageNumber, pageSize }) => {
    store.dispatch('getBrowserSearch', {
      containerUuid,
      pageSize,
      pageNumber
    })
  },
  getPageNumber({ containerUuid }) {
    return store.getters.getBrowserPageNumber({
      containerUuid
    })
  },
  setPageSize: ({ containerUuid, pageSize, pageNumber = 1 }) => {
    store.dispatch('getBrowserSearch', {
      containerUuid,
      pageNumber,
      pageSize
    })
  },
  getPageSize({ containerUuid }) {
    return store.getters.getBrowserPageSize({
      containerUuid
    })
  },

  /**
   * @returns Promisse with value and displayedValue
   */
  getDefaultValue({ parentUuid, containerUuid, name, uuid, id, contextColumnNames, inTable, rowUid, columnName, value }) {
    return store.dispatch('getDefaultValueFromServer', {
      parentUuid,
      containerUuid,
      contextColumnNames,
      id,
      browseFieldId: id,
      uuid,
      browseFieldUuid: uuid,
      //
      columnName,
      value
    }).then(response => {
      let newValueByServer, newDisplayValueByServer
      if (!isEmptyValue(response) && !isEmptyValue(response.value)) {
        newValueByServer = response.value
      }

      // TODO: Evaluate if add `is_query_criteria` to condition
      if (inTable) {
        return store.commit('setBrowserCell', {
          containerUuid,
          rowUid,
          columnName,
          value
        })
      }
      const field = store.getters.getStoredBrowserFieldFromColumnName({
        containerUuid,
        columnName
      })

      // update element column name
      if (!field.isSameColumnElement) {
        store.commit('updateValueOfField', {
          containerUuid,
          columnName: field.element_name,
          value: newValueByServer
        })

        store.commit('updateValueOfField', {
          containerUuid,
          columnName: DISPLAY_COLUMN_PREFIX + field.element_name,
          value: newDisplayValueByServer
        })
      }

      // TODO: Evaluate if add `is_query_criteria` to condition
      if ((field.isGetServerValue && !response.reason === 'In Request') ||
        (response.reason === 'Successful default value' && !isSameValues(value, newValueByServer))) {
        store.dispatch('browserActionPerformed', {
          containerUuid,
          field,
          value: newValueByServer
        })
      }
      return {
        ...response,
        value: newValueByServer,
        displayedValue: newDisplayValueByServer
      }
    })
  },
  getLookupList({ parentUuid, containerUuid, contextColumnNames, uuid, id, searchValue, isAddBlankValue = false, blankValue }) {
    return store.dispatch('getLookupListFromServer', {
      parentUuid,
      containerUuid,
      contextColumnNames,
      browseFieldId: id,
      browseFieldUuid: uuid,
      searchValue,
      // app attributes
      isAddBlankValue,
      blankValue
    })
  },
  getSearchDefinition({ parentUuid, containerUuid, contextColumnNames, tableName, columnName, uuid, id }) {
    return store.dispatch('getSearchFieldsFromServer', {
      parentUuid,
      containerUuid,
      contextColumnNames,
      uuid,
      browseFieldId: id,
      tableName,
      columnName
    })
  },
  getSearchRecordsList({ parentUuid, containerUuid, contextColumnNames, tableName, columnName, id, filters, searchValue, pageNumber, pageSize }) {
    return store.dispatch('getSearchRecordsFromServer', {
      parentUuid,
      containerUuid,
      contextColumnNames,
      browseFieldId: id,
      tableName,
      columnName,
      filters,
      searchValue,
      pageNumber,
      pageSize
    })
  },

  warehouseLocatorSearch({
    containerUuid,
    parentUuid,
    warehouseId,
    contextColumnNames,
    contextAttributesList,
    uuid,
    searchValue,
    // tableName,
    // columnName,
    pageNumber,
    pageSize
  }) {
    return store.dispatch('listWarehouseLocatorsFromServer', {
      containerUuid,
      parentUuid,
      warehouseId,
      contextColumnNames,
      contextAttributesList,
      browseFieldUuid: uuid,
      searchValue,
      // tableName,
      // columnName,
      pageNumber,
      pageSize
    })
  },

  applyCustomization({
    containerUuid,
    levelType,
    levelValue,
    fieldAttributes
  }) {
    return requestSaveBrowseCustomization({
      browseId: containerUuid,
      levelType,
      levelValue,
      fieldAttributes
    })
  },
  searchFieldZoom({
    id,
    columnName,
    tabTableName,
    valueField
  }) {
    return store.dispatch('getListZoomWindowsRequest', {
      browse_field_id: id,
      column_name: columnName,
      table_name: tabTableName,
      valueField
    })
  },
  refreshRecords({
    containerUuid
  }) {
    store.dispatch('getBrowserSearch', {
      containerUuid
    })
  },

  runProcess({
    containerUuid
  }) {
    runProcessOfBrowser.runProcessOfBrowser({
      containerUuid
    })
  },

  enableExport({
    containerUuid
  }) {
    const emptyMandatory = store.getters.getBrowserFieldsEmptyMandatory({
      containerUuid
    })
    if (!isEmptyValue(emptyMandatory)) {
      return false
    }
    const recordCount = store.getters.getBrowserRecordCount({
      containerUuid
    })
    if (isEmptyValue(recordCount) || recordCount <= 0) {
      return false
    }
    return true
  },
  exportAllRecords({
    containerUuid,
    parentUuid
  }) {
    store.dispatch('getBrowserExportRecords', {
      containerUuid
    }).then(response => {
      const currentSelection = response
      const fieldsList = this.getFieldsList({
        containerUuid
      })
      const fieldsListAvailable = fieldsList.filter(fieldItem => {
        const {
          isShowedTableFromUser,
          is_encrypted
        } = fieldItem
        // Hide encrypted fields
        if (is_encrypted) {
          return false
        }

        if (this.isDisplayedColumn(fieldItem)) {
          const isMandatoryGenerated = this.isMandatoryColumn(fieldItem)
          const isDisplayedDefault = this.isDisplayedDefaultTable({
            ...fieldItem,
            is_mandatory: isMandatoryGenerated
          })
          // madatory, not parent column and without default value to window, mandatory or with default value to others
          if (isDisplayedDefault) {
            return true
          }
          // showed by user
          return isShowedTableFromUser
        }

        return false
      }).sort((a, b) => a.sequence - b.sequence)
      const headerList = fieldsListAvailable.map(fieldItem => {
        return decodeHtmlEntities(fieldItem.name)
      })
      const data = currentSelection.map(row => {
        const newRow = {}
        fieldsListAvailable.forEach(field => {
          const { column_name, displayColumnName, display_type } = field
          const value = formatField({
            displayType: display_type,
            value: row[column_name],
            displayedValue: row[displayColumnName]
          })
          newRow[column_name] = value
        })
        return newRow
      })
      const title = this.getPanel({
        parentUuid,
        containerUuid
      }).name
      exportFileFromJson({
        header: headerList,
        data,
        fileName: `${title} ${clientDateTime()}`,
        exportType: DEFAULT_EXPORT_TYPE
      })
    })
  },
  exportOnlyRecords({
    parentUuid,
    containerUuid,
    containerManager
  }) {
    const selection = store.getters.getBrowserSelectionsList({
      containerUuid
    })
    if (isEmptyValue(selection)) {
      showNotification({
        title: language.t('data.selectionRequired'),
        type: 'warning'
      })
      return
    }
    exportRecords({
      parentUuid,
      containerUuid,
      containerManager,
      formatToExport: DEFAULT_EXPORT_TYPE
    })
  }
}
