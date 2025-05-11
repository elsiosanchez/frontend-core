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

import language from '@/lang'
import router from '@/router'
import store from '@/store'
import nprogress from 'nprogress'

// Constants
import {
  ID, IMAGE, LOCATION_ADDRESS, isLookup
} from '@/utils/ADempiere/references'
import {
  COLUMNNAME_AD_Client_ID,
  COLUMNNAME_IsActive,
  COLUMNNAME_Processing,
  COLUMNNAME_Processed,
  COLUMNNAME_Record_ID,
  COLUMNNAME_UUID,
  LOG_COLUMNS_NAME_LIST
} from '@/utils/ADempiere/constants/systemColumns'
import { ROW_ATTRIBUTES } from '@/utils/ADempiere/tableUtils'
import { EXPORT_SUPPORTED_TYPES } from '@/utils/ADempiere/exportUtil.js'

// API Request Methods
import { requestGetTabEntity } from '@/api/ADempiere/user-interface/entities.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { copyWindowContextOnBrowser } from '@/utils/ADempiere/contextUtils/contextBrowser'
import { zoomIn } from '@/utils/ADempiere/coreUtils'
import { showMessage } from '@/utils/ADempiere/notification.js'
import { convertStringToBoolean } from '@/utils/ADempiere/formatValue/booleanFormat'
import { convertObjectToKeyValue } from '@/utils/ADempiere/formatValue/iterableFormat'
import { isReadOnlyTab } from '@/utils/ADempiere/dictionary/window/tab'
import { isEditableRecord, getUuidv4 } from '@/utils/ADempiere/recordUtil'
import { exportRecords } from '@/utils/ADempiere/exportUtil.js'
import { isRunableDocumentAction } from '@/utils/ADempiere/dictionary/workflow'

/**
 * Create new record
 */
export const createNewRecord = {
  sequence: 0,
  name: language.t('actionMenu.createNewRecord'),
  type: 'setDefaultValues',
  enabled: ({ parentUuid, containerUuid }) => {
    if (isReadOnlyTab({ parentUuid, containerUuid })) {
      return false
    }

    const tab = store.getters.getStoredTab(parentUuid, containerUuid)
    // TODO: Verify index Parent Tab
    if (tab.isParentTab && tab.index > 0) {
      return false
    }

    if (!tab.is_insert_record) {
      return false
    }
    const recordUuid = store.getters.getUuidOfContainer(containerUuid)
    if (isEmptyValue(recordUuid)) {
      return false
    }

    if (!tab.isParentTab) {
      const isEditable = isEditableRecord({
        parentUuid
      })
      if (!isEditable) {
        return false
      }
    }

    return true
  },
  svg: false,
  icon: 'el-icon-circle-plus-outline',
  actionName: 'createNewRecord',
  createNewRecord: ({ parentUuid, containerUuid, isCopyValues = false }) => {
    if (isReadOnlyTab({ parentUuid, containerUuid })) {
      return false
    }

    const storedTab = store.getters.getStoredTab(parentUuid, containerUuid)
    if (!storedTab.is_insert_record) {
      return false
    }
    // TODO: Verify index Parent Tab
    if (storedTab.isParentTab && storedTab.index > 0) {
      return false
    }

    // if (storedTab.value.isShowedTableRecords) {
    //   store.dispatch('changeTabAttribute', {
    //     attributeName: 'isShowedTableRecords',
    //     attributeNameControl: undefined,
    //     attributeValue: false,
    //     parentUuid: props.parentUuid,
    //     containerUuid
    //   })
    // }
    const currentValues = {}
    if (isCopyValues) {
      const copyableFields = storedTab.fieldsList.filter(fieldItem => {
        if (fieldItem.isVirtualColumn || fieldItem.is_key) {
          return false
        }
        if ([ID.id, LOCATION_ADDRESS.id].includes(fieldItem.display_type)) {
          return false
        }
        // Ignore Standard Values
        const { columnName } = fieldItem
        if (LOG_COLUMNS_NAME_LIST.includes(columnName)) {
          return false
        }
        if ([COLUMNNAME_AD_Client_ID, COLUMNNAME_IsActive, COLUMNNAME_Processing, COLUMNNAME_Processed, COLUMNNAME_UUID].includes(columnName)) {
          return false
        }
        return fieldItem.is_allow_copy
      })

      const tabContext = store.getters.getValuesView({
        containerUuid,
        format: 'object'
      })
      copyableFields.forEach(fieldItem => {
        const { columnName, display_type, displayColumnName } = fieldItem
        const value = tabContext[columnName]

        if (!isEmptyValue(value)) {
          currentValues[columnName] = value

          // display value
          if (isLookup(storedTab) || [ID.id, IMAGE.id].includes(display_type)) {
            currentValues[displayColumnName] = tabContext[displayColumnName]
          }
        }
      })
    }

    store.dispatch('setTabDefaultValues', {
      parentUuid,
      containerUuid,
      overwriteValues: currentValues
    })
  }
}

export const undoChange = {
  sequence: 0,
  name: language.t('actionMenu.undo'),
  type: 'undoModifyData',
  enabled: ({ parentUuid, containerUuid }) => {
    const storedTab = store.getters.getStoredTab(parentUuid, containerUuid)
    const { table } = storedTab
    if (!isEmptyValue(table) && table.is_view) {
      return false
    }
    return isEmptyValue(
      store.getters.getUuidOfContainer(containerUuid)
    )
  },
  svg: false,
  icon: 'el-icon-circle-plus-outline',
  actionName: 'undoChange',
  undoChange: ({ parentUuid, containerUuid, containerManager }) => {
    const oldRecordUuid = store.getters.getCurrentRecordOnPanel(containerUuid)
    if (isEmptyValue(oldRecordUuid)) {
      // clear values
      store.dispatch('setTabDefaultValues', {
        parentUuid,
        containerUuid
      })
      return false
    }

    // clear only changes into current record
    const currentRecordUuid = store.getters.getUuidOfContainer(containerUuid)
    if (!isEmptyValue(currentRecordUuid)) {
      const currentChanges = store.getters.getPersistenceAttributes({
        containerUuid,
        recordUuid: currentRecordUuid
      })
      if (!isEmptyValue(currentChanges)) {
        store.dispatch('setOldPersistenceValues', {
          parentUuid,
          containerUuid,
          recordUuid: currentRecordUuid
        })

        const tab = store.getters.getStoredTab(parentUuid, containerUuid)
        tab.fieldsList.forEach(field => {
          store.dispatch('changeDependentFieldsList', {
            field,
            containerManager
          })
        })
        return
      }
    }

    // set old record as current record
    const row = store.getters.getTabRowData({
      containerUuid,
      recordUuid: oldRecordUuid
    })

    const attributes = convertObjectToKeyValue({
      object: row
    })

    store.dispatch('notifyPanelChange', {
      parentUuid,
      containerUuid,
      attributes
    })

    // clear old values
    store.dispatch('clearPersistenceQueue', {
      containerUuid,
      recordUuid: row[COLUMNNAME_UUID]
    }, {
      root: true
    })

    const tab = store.getters.getStoredTab(parentUuid, containerUuid)
    tab.fieldsList.forEach(field => {
      store.dispatch('changeDependentFieldsList', {
        field,
        containerManager
      })
    })

    // update records and logics on child tabs
    tab.childTabs.filter(tabItem => {
      // get loaded tabs with records
      return store.getters.getIsLoadedTabRecord({
        containerUuid: tabItem.uuid
      })
    }).forEach(tabItem => {
      store.dispatch('setOldAsCurrentTabData', {
        parentUuid,
        containerUuid: tabItem.uuid
      })

      const oldRecordUuid = store.getters.getCurrentRecordOnPanel(tabItem.uuid)
      if (isEmptyValue(oldRecordUuid)) {
        return false
      }

      const row = store.getters.getTabRowData({
        containerUuid: tabItem.uuid,
        recordUuid: oldRecordUuid
      })
      const attributes = convertObjectToKeyValue({
        object: row
      })
      store.dispatch('notifyPanelChange', {
        parentUuid,
        containerUuid: tabItem.uuid,
        attributes
      })

      const fieldsList = store.getters.getStoredFieldsFromTab(parentUuid, tabItem.uuid)

      fieldsList.forEach(field => {
        store.dispatch('changeDependentFieldsList', {
          field,
          containerManager
        })
      })

      // clear old values
      store.dispatch('clearPersistenceQueue', {
        containerUuid,
        recordUuid: row[COLUMNNAME_UUID]
      }, {
        root: true
      })
    })
  }
}

/**
 * Get current record and refresh values on panel and table
 * @param {string} parentUuid
 * @param {string} containerUuid
 * @param {number} recordId
 * @param {string} recordUuid
 * @param {boolean} isRefreshChilds refresh records of childs tabs
 */
export const refreshRecord = {
  name: language.t('actionMenu.refreshRecords'),
  enabled: ({ containerUuid }) => {
    const recordUuid = store.getters.getUuidOfContainer(containerUuid)
    return !isEmptyValue(recordUuid) && recordUuid !== 'create-new'
  },
  svg: false,
  icon: 'el-icon-refresh',
  actionName: 'refreshRecords',
  refreshRecord: ({ parentUuid, containerUuid, recordId, recordUuid, isRefreshChilds = false }) => {
    if (isEmptyValue(recordUuid)) {
      recordUuid = store.getters.getUuidOfContainer(containerUuid)
    }
    const tabDefinition = store.getters.getStoredTab(parentUuid, containerUuid)
    if (isEmptyValue(recordId)) {
      recordId = store.getters.getIdOfContainer({
        containerUuid: containerUuid,
        tableName: tabDefinition.table_name
      })
    }

    store.dispatch('reloadTableData', {
      isLoaded: false,
      containerUuid
    })
    if (recordId < 0) return {}
    nprogress.start()
    return requestGetTabEntity({
      tabId: tabDefinition.id,
      recordId: recordId
    })
      .then(response => {
        const currentRow = store.getters.getTabRowData({
          containerUuid,
          recordUuid
        })

        const newRow = {
          ...ROW_ATTRIBUTES,
          ...currentRow,
          ...response.values,
          isSelectedRow: true,
          rowUid: getUuidv4()
        }

        // add new row on table
        store.commit('setTabRowWithRecord', {
          parentUuid,
          containerUuid,
          recordUuid,
          row: newRow
        })

        store.commit('setTabSelectionsList', {
          parentUuid,
          containerUuid,
          selectionsList: [
            newRow
          ]
        })

        // update fields values
        store.dispatch('updateValuesOfContainer', {
          parentUuid,
          containerUuid,
          attributes: response.values,
          isOverWriteParent: tabDefinition.isParentTab
        }, {
          root: true
        })

        if (isRefreshChilds) {
          // update records and logics on child tabs
          tabDefinition.childTabs.filter(tabItem => {
            const { hasBeenRendered } = store.getters.getStoredTab(parentUuid, tabItem.uuid)
            if (hasBeenRendered) {
              return true
            }
            // get loaded tabs with records
            return store.getters.getIsLoadedTabRecord({
              containerUuid: tabItem.uuid
            })
          }).forEach(tabItem => {
            // if loaded data refresh this data
            store.dispatch('getEntities', {
              parentUuid,
              containerUuid: tabItem.uuid,
              pageNumber: 1 // reload with first page
            })
          })
        }
      })
      .finally(() => {
        store.dispatch('reloadTableData', {
          isLoaded: true,
          containerUuid
        })
        nprogress.done()
      })
  }
}

export function clearFilter(currentRoute) {
  router.replace({
    name: currentRoute.name,
    query: {
      ...currentRoute.query,
      filters: []
    },
    params: {
      ...currentRoute.params
    }
  }, () => {})
}

export const refreshRecords = {
  name: language.t('actionMenu.refreshRecords'),
  enabled: () => {
    return true
  },
  svg: false,
  icon: 'el-icon-refresh',
  actionName: 'refreshRecords',
  refreshRecords: ({ parentUuid, containerUuid }) => {
    nprogress.start()
    // refresh records on current tab
    store.dispatch('getEntities', {
      parentUuid,
      containerUuid,
      filters: []
    })
      .finally(() => {
        nprogress.done()
      })

    // get tabs with same table to refresh without current tab
    const tableName = store.getters.getTableName(parentUuid, containerUuid)
    const tabsWithSameTable = store.getters.getStoredTabsFromTableName({
      parentUuid,
      containerUuid,
      tableName
    })
    // update records on tabs with same table
    if (!isEmptyValue(tabsWithSameTable)) {
      tabsWithSameTable.forEach(tab => {
        const isLoaded = store.getters.getIsLoadedTabRecord({
          containerUuid: tab.uuid
        })
        // if loaded data refresh this data
        // TODO: Verify with one entity, not all list
        if (isLoaded) {
          store.dispatch('getEntities', {
            parentUuid,
            containerUuid: tab.uuid
          })
        }
      })
    }
    clearFilter(router.app._route)
  }
}

/**
 * Delete record (entity)
 */
export const deleteRecord = {
  name: language.t('actionMenu.deleteRecord'),
  enabled: ({ parentUuid, containerUuid }) => {
    if (isReadOnlyTab({ parentUuid, containerUuid })) {
      return false
    }

    const tab = store.getters.getStoredTab(parentUuid, containerUuid)
    // TODO: Verify index Parent Tab
    if (tab.isParentTab && tab.index > 0) {
      return false
    }
    if (!tab.table.is_deleteable) {
      return false
    }

    const recordUuid = store.getters.getUuidOfContainer(containerUuid)
    if (isEmptyValue(recordUuid) || recordUuid === 'create-new') {
      return false
    }

    const preferenceClientId = store.getters.getSessionContextClientId
    if (tab.isShowedTableRecords) {
      const selectionsRecords = store.getters.getTabSelectionsList({
        containerUuid
      })
      if (isEmptyValue(selectionsRecords)) {
        return false
      }
      // TODO: Improve creating method to define if record is enabled
      if (!tab.isParentTab) {
        const isEditable = isEditableRecord({
          parentUuid
        })
        if (!isEditable) {
          return false
        }
      }
      const isNotEditableAnyRecord = selectionsRecords.some(record => {
        // TODO: Improve and implement isEditableRecord
        return record[COLUMNNAME_AD_Client_ID] !== preferenceClientId || convertStringToBoolean(record[COLUMNNAME_Processed]) || convertStringToBoolean(record[COLUMNNAME_Processing])
        // record[COLUMNNAME_Processed] || convertStringToBoolean(record[COLUMNNAME_Processing])
      })
      if (isNotEditableAnyRecord) {
        return false
      }
    } else {
      const isEditable = isEditableRecord({
        parentUuid,
        containerUuid
      })
      if (!isEditable) {
        return false
      }
    }

    return true
  },
  svg: false,
  icon: 'el-icon-delete',
  type: 'deleteEntity',
  actionName: 'deleteRecord',
  deleteRecord: ({ parentUuid, containerUuid, recordId, recordUuid }) => {
    if (isReadOnlyTab({ parentUuid, containerUuid })) {
      return false
    }

    const storedTab = store.getters.getStoredTab(parentUuid, containerUuid)
    if (isEmptyValue(storedTab)) {
      return false
    }
    const {
      isShowedTableRecords, table, isParentTab, firstTabUuid
    } = storedTab
    if (!table.is_deleteable) {
      return false
    }

    // delete selection of records on table
    if (isShowedTableRecords) {
      const selectionsRecords = store.getters.getTabSelectionsList({
        containerUuid
      })
      if (isEmptyValue(selectionsRecords)) {
        return false
      }
      store.dispatch('deleteSelectedRecordsFromWindow', {
        parentUuid,
        containerUuid
      })
      return
    }

    // delete record on panel
    store.dispatch('deleteEntity', {
      parentUuid,
      containerUuid,
      recordId,
      recordUuid
    })
      .then(() => {
        showMessage({
          message: language.t('recordManager.deleteRecordSuccessful'),
          type: 'success'
        })
        if (!isParentTab) {
          const storedFirstTab = store.getters.getStoredTab(
            parentUuid,
            firstTabUuid
          )
          if (!isEmptyValue(storedFirstTab) && storedFirstTab.table.is_document) {
            refreshRecord.refreshRecord({
              parentUuid: parentUuid,
              containerUuid: firstTabUuid
            })
          }
        }
      })
      .catch(error => {
        showMessage({
          message: language.t('recordManager.deleteRecordError') + ' ' + error.message,
          type: 'error'
        })
        console.warn(`Delete Entity - Error ${error.message}, Code: ${error.code}.`)
      })
  }
}

/**
 * Export current record
 */
export const exportCurrentRecord = {
  name: language.t('actionMenu.exportRecord'),
  displayed: ({ parentUuid, containerUuid }) => {
    const currentTab = store.getters.getStoredTab(parentUuid, containerUuid)

    // only single record
    return !currentTab.isShowedTableRecords
  },
  enabled: ({ containerUuid, containerManager }) => {
    const currentRecord = store.getters.getUuidOfContainer(containerUuid)

    return !isEmptyValue(currentRecord)
  },
  svg: false,
  icon: 'el-icon-download',
  actionName: 'exportCurrentRecord',
  exportCurrentRecord: ({ root, parentUuid, containerUuid, containerManager }) => {
    const currrentRecord = store.getters.getTabCurrentRow({ containerUuid })
    exportRecords({ parentUuid, containerUuid, containerManager, currrentRecord })
  },
  // generate export formats
  childs: Object.keys(EXPORT_SUPPORTED_TYPES).map(format => {
    return {
      name: EXPORT_SUPPORTED_TYPES[format],
      enabled: ({ containerUuid, containerManager }) => {
        return true
      },
      svg: false,
      icon: 'el-icon-download',
      actionName: 'exportCurrentRecord',
      exportCurrentRecord: ({ root, parentUuid, containerUuid, containerManager }) => {
        // change default format to current format
        const currrentRecord = store.getters.getTabCurrentRow({ containerUuid })
        exportRecords({ root, parentUuid, containerUuid, containerManager, formatToExport: format, currrentRecord })
      }
    }
  })
}

/**
 * Open Document Action to process workflow
 */
export const openDocumentAction = {
  name: language.t('actionMenu.startDocumentAction'),
  enabled: ({ parentUuid, containerUuid }) => {
    return isRunableDocumentAction({
      parentUuid,
      containerUuid
    })
  },
  isSvgIcon: true,
  icon: 'example',
  actionName: 'openDocumentAction',
  openDocumentAction: ({ parentUuid, containerUuid, uuid }) => {
    store.commit('setSelectProcessWindows', uuid)

    store.commit('setShowedModalDialog', {
      parentUuid: containerUuid,
      containerUuid: uuid,
      isShowed: true
    })
  }
}

/**
 * Run process associated on table or button field
 * @param {string} parentUuid
 * @param {string} containerUuid
 * @param {number} recordId
 * @param {string} recordUuid
 */
export const openSequenceTab = {
  name: language.t('window.tab.sequenceTab'),
  enabled: ({ parentUuid, containerUuid }) => {
    const recordUuid = store.getters.getUuidOfContainer(containerUuid)
    return !isEmptyValue(recordUuid)
  },
  svg: false,
  icon: 'el-icon-sort',
  actionName: 'openSequenceTab',
  openSequenceTab: ({ parentUuid, containerUuid, uuid, contextColumnNames }) => {
    const currentTab = store.getters.getStoredTab(parentUuid, containerUuid)
    const { sequenceTabsList } = currentTab
    const sequenceTab = sequenceTabsList.find(itemTab => {
      return itemTab.uuid === uuid
    })

    store.commit('setSelectProcessWindows', sequenceTab.uuid)

    store.commit('setShowedModalDialog', {
      parentUuid,
      containerUuid: sequenceTab.uuid,
      isShowed: true
    })
  }
}

/**
 * Run process associated on table or button field
 */
export const runProcessOfWindow = {
  name: language.t('actionMenu.runProcess'),
  enabled: ({ parentUuid, containerUuid, uuid }) => {
    const storedTab = store.getters.getStoredTab(
      parentUuid,
      containerUuid
    )
    if (!storedTab.isShowedTableRecords) {
      const recordUuid = store.getters.getUuidOfContainer(containerUuid)
      return !isEmptyValue(recordUuid)
    }

    // multi selection process
    const recordsSelection = store.getters.getTabSelectionsList({
      containerUuid
    })
    if (isEmptyValue(recordsSelection)) {
      return false
    }
    const currentProcess = storedTab.processes.find(process => {
      // return process.name === processModal.title
      return process.uuid === uuid
    })
    return currentProcess.is_multi_selection
  },
  svg: false,
  icon: 'el-icon-setting',
  actionName: 'runProcessOfWindow',
  runProcessOfWindow: ({ parentUuid, containerUuid, uuid }) => {
    store.commit('setSelectProcessWindows', uuid)

    store.commit('setShowedModalDialog', {
      parentUuid: containerUuid,
      containerUuid: uuid,
      isShowed: true
    })
  }
}
/**
 * Generate report associated on table or button field
 */
export const generateReportOfWindow = {
  name: language.t('actionMenu.generateReport'),
  enabled: ({ parentUuid, containerUuid, uuid }) => {
    const storedTab = store.getters.getStoredTab(
      parentUuid,
      containerUuid
    )
    if (!storedTab.isShowedTableRecords) {
      const recordUuid = store.getters.getUuidOfContainer(containerUuid)
      return !isEmptyValue(recordUuid)
    }

    // multi selection process
    const recordsSelection = store.getters.getTabSelectionsList({
      containerUuid
    })
    if (isEmptyValue(recordsSelection)) {
      return false
    }
    const currentProcess = storedTab.processes.find(process => {
      // return process.name === processModal.title
      return process.uuid === uuid
    })
    if (isEmptyValue(currentProcess)) {
      return false
    }
    return currentProcess.is_multi_selection
  },
  isSvgIcon: true,
  icon: 'skill',
  actionName: 'generateReportOfWindow',
  generateReportOfWindow: ({ parentUuid, containerUuid, uuid }) => {
    store.commit('setSelectProcessWindows', uuid)

    store.commit('setShowedModalDialog', {
      parentUuid: containerUuid,
      containerUuid: uuid,
      isShowed: true
    })
  }
}

/**
 * Open Form Associated in Process
 */
export const openFormAssociated = {
  name: language.t('actionMenu.openSpecialForm'),
  enabled: ({ parentUuid, containerUuid }) => {
    const recordUuid = store.getters.getUuidOfContainer(containerUuid)
    return !isEmptyValue(recordUuid)
  },
  isSvgIcon: true,
  icon: 'form',
  actionName: 'openFormAssociated',
  openFormAssociated: function({ parentUuid, containerUuid, uuid, formId, formUuid }) {
    if (isEmptyValue(formId) || isEmptyValue(formUuid)) {
      const process = store.getters.getStoredProcessFromTab({
        windowUuid: parentUuid,
        tabUuid: containerUuid,
        processUuid: uuid
      })
      if (!isEmptyValue(process)) {
        formId = process.form_id || process.form.id
        formUuid = process.form.uuid
      }
    }
    // set record id from window
    const storedTab = store.getters.getStoredTab(parentUuid, containerUuid)
    const { keyColumn } = storedTab

    const recordId = store.getters.getValueOfField({
      parentUuid,
      containerUuid,
      columnName: keyColumn
    })

    if (!isEmptyValue(recordId)) {
      store.commit('updateValueOfField', {
        containerUuid: formUuid,
        columnName: COLUMNNAME_Record_ID,
        value: recordId
      })
    }

    const inMenu = zoomIn({
      uuid: formUuid,
      params: {
        formId: 0,
        formUuid
      },
      query: {
        [COLUMNNAME_Record_ID]: recordId,
        recordId
      },
      isShowMessage: false
    })
    if (!inMenu) {
      router.push({
        name: 'Form',
        params: {
          formId: 0,
          formUuid
        },
        query: {
          [COLUMNNAME_Record_ID]: recordId,
          recordId
        }
      }, () => {})
    }
  }
}

/**
 * Open Smart Browser Associated in Process
 */
export const openBrowserAssociated = {
  name: language.t('actionMenu.openSmartBrowser'),
  enabled: ({ parentUuid, containerUuid }) => {
    const recordUuid = store.getters.getUuidOfContainer(containerUuid)
    return !isEmptyValue(recordUuid)
  },
  isSvgIcon: true,
  icon: 'search',
  actionName: 'openBrowserAssociated',
  openBrowserAssociated: function({ parentUuid, containerUuid, uuid, browserId, browserUuid }) {
    if (isEmptyValue(browserId) || browserId <= 0) {
      const process = store.getters.getStoredProcessFromTab({
        windowUuid: parentUuid,
        tabUuid: containerUuid,
        processUuid: uuid
      })
      browserId = process.browser_id
      if (isEmptyValue(browserUuid)) {
        browserUuid = process.browser.uuid
      }
    }
    if (isEmptyValue(browserUuid)) {
      browserUuid = store.getters.getStoredBrowserUuidById(browserId)
    }
    const storedBrowser = store.getters.getStoredBrowser(browserUuid)
    if (!isEmptyValue(storedBrowser)) {
      // overwrite values
      store.dispatch('setBrowserDefaultValues', {
        containerUuid: browserUuid
      })

      // copy context values
      copyWindowContextOnBrowser({
        browserUuid,
        fieldsList: storedBrowser.fieldsList,
        windowUuid: parentUuid,
        tabUuid: containerUuid
      })

      // clear resutls
      store.dispatch('clearBrowserData', {
        containerUuid: browserUuid
      })
    }

    // set record id from window
    const storedTab = store.getters.getStoredTab(parentUuid, containerUuid)
    const { keyColumn } = storedTab

    // Set Record ID
    const recordId = store.getters.getValueOfField({
      parentUuid,
      containerUuid,
      columnName: keyColumn
    })

    const containerIdentifier = 'browser_' + browserId
    const inMenu = zoomIn({
      attributeValue: containerIdentifier,
      attributeName: 'containerKey',
      query: {
        parentUuid,
        containerUuid,
        recordId
      },
      isShowMessage: false
    })

    if (!inMenu) {
      router.push({
        name: 'Smart Browser',
        params: {
          browserId: browserId,
          browserUuid: browserUuid
        },
        query: {
          parentUuid,
          containerUuid,
          recordId
        }
      }, () => {})
    }
  }
}

export const lockRecord = {
  name: language.t('recordManager.lockRecord'),
  type: 'lockRecord',
  enabled: ({ parentUuid, containerUuid }) => {
    const currentRole = store.getters['user/getRole']
    if (!currentRole.personal_lock) {
      return false
    }
    return !isEmptyValue(
      store.getters.getUuidOfContainer(containerUuid)
    )
  },
  svg: false,
  icon: 'el-icon-lock',
  actionName: 'lockRecord',
  lockRecord: ({ parentUuid, containerUuid, tableName }) => {
  }
}

export const unlockRecord = {
  name: language.t('recordManager.unlockRecord'),
  type: 'unlockRecord',
  enabled: ({ parentUuid, containerUuid }) => {
    const currentRole = store.getters['user/getRole']
    if (!currentRole.personal_lock) {
      return false
    }
    return !isEmptyValue(
      store.getters.getUuidOfContainer(containerUuid)
    )
  },
  svg: false,
  icon: 'el-icon-unlock',
  actionName: 'unlockRecord',
  unlockRecord: ({ parentUuid, containerUuid, tableName }) => {
  }
}

/**
 * Record access
 * @param {string} tableName
 * @param {number} recordId
 * @param {string} recordUuid
 */
export const recordAccess = {
  name: language.t('data.recordAccess.actions'),
  description: language.t('data.noDescription'),
  enabled: ({ parentUuid, containerUuid }) => {
    const currentRole = store.getters['user/getRole']
    // if (!currentRole.is_personal_access) {
    if (!currentRole.personal_lock) {
      return false
    }
    return !isEmptyValue(
      store.getters.getUuidOfContainer(containerUuid)
    )
  },
  svg: false,
  icon: 'el-icon-set-up',
  actionName: 'recordAccess',
  recordAccess: ({ parentUuid, containerUuid, recordId, recordUuid }) => {
    const storedTab = store.getters.getStoredTab(parentUuid, containerUuid)
    const { table_name } = storedTab
    if (isEmptyValue(recordId)) {
      recordId = store.getters.getIdOfContainer({
        containerUuid: containerUuid,
        tableName: table_name
      })
    }
    store.dispatch('loadRecordAccessFromServer', {
      tableName: table_name,
      recordId,
      recordUuid
    })
    store.commit('setShowRecordAccess', true)
  }
}
