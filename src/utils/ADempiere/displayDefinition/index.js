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

// Constants

// API Request Methods

// Utils and Helpers Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

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
    const mandatoryFields = fieldList.filter(field => field.is_mandatory)

    // Comprobar si hay campos obligatorios faltantes
    const hasMissingFields = mandatoryFields.some(field => !(field.column_name in attributes))

    return hasMissingFields
  },
  updateField({
    recordId,
    attributes = {}
  }) {
    return new Promise((resolve, reject) => {
      if (isEmptyValue(attributes)) return resolve()
      store.dispatch('updateField', {
        id: recordId,
        attributes
      })
        .then(() => {
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
  async createNewRecord({
    displayDefinitionId,
    attributes = {},
    currentTab
  }) {
    store.dispatch('setTabDefaultValues', {
      parentUuid: currentTab.parentUuid,
      containerUuid: currentTab.containerUuid,
      overwriteValues: {}
    })

    const persistence = store.getters.getPersistenceAttributes({
      containerUuid: currentTab.containerUuid
    })

    const persistenceAttributes = persistence.reduce((element, { columnName, value }) => {
      if (!isEmptyValue(columnName) && !isEmptyValue(value)) {
        element[columnName] = value
      }
      return element
    }, {}) || {}
    store.dispatch('saveRecord', {
      displayDefinitionId,
      attributes: {
        ...persistenceAttributes,
        ...attributes
      }
    })
      .then(() => {
        store.dispatch('changeTabPanelDefinition', {
          name: '',
          id: displayDefinitionId
        })
        store.commit('setShowPanel', false)
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
    displayDefinitionId
  }) {
    store.dispatch('removerRecord', {
      recordId,
      displayDefinitionId
    })
      .then(() => {
        store.commit('setShowPanel', false)
      })
  }
}
