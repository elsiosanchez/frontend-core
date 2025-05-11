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

// Constants
import {
  COLUMNNAME_AD_Client_ID,
  COLUMNNAME_IsActive,
  COLUMNNAME_Processing,
  COLUMNNAME_Processed
} from '@/utils/ADempiere/constants/systemColumns'

// Utils and Helper Methods
import { convertStringToBoolean } from '@/utils/ADempiere/formatValue/booleanFormat'

export const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/

/**
 * Reflect latest best-practices for producing RFC4122-compliant UUIDs
 * @returns {String}
 */
export function getUuidv4() {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  )
}

/**
 * Get a List with the values of the key Columns of the Tab
 * @param {string} parentUuid
 * @param {string} containerUuid
 * @param {Array[String]} keyColumns
 * return {object} keyColumnsList
 */
export function getTableKeyValues({
  parentUuid,
  containerUuid,
  keyColumns = []
}) {
  const keyColumnValues = {}
  if (keyColumns) {
    keyColumns.forEach(keyColumnName => {
      const value = store.getters.getValueOfField({
        parentUuid,
        containerUuid,
        columnName: keyColumnName
      })
      keyColumnValues[keyColumnName] = value
    })
  }
  return keyColumnValues
}

export function isEditableRecord({ parentUuid, containerUuid }) {
  const preferenceClientId = store.getters.getSessionContextClientId
  // client id value of record
  const clientIdRecord = store.getters.getValueOfField({
    parentUuid,
    containerUuid,
    columnName: COLUMNNAME_AD_Client_ID
  })
  if (preferenceClientId !== clientIdRecord) {
    return false
  }

  // is active value of record
  const isActiveRecord = store.getters.getValueOfField({
    parentUuid,
    containerUuid,
    columnName: COLUMNNAME_IsActive
  })
  if (convertStringToBoolean(isActiveRecord)) {
    // return false
  }

  // is processed value of record
  const isProcessedRecord = store.getters.getValueOfField({
    parentUuid,
    containerUuid,
    columnName: COLUMNNAME_Processed
  })
  if (convertStringToBoolean(isProcessedRecord)) {
    return false
  }

  // is processing value of record
  const isProcessingRecord = store.getters.getValueOfField({
    parentUuid,
    containerUuid,
    columnName: COLUMNNAME_Processing
  })
  if (convertStringToBoolean(isProcessingRecord)) {
    return false
  }

  return true
}
