/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
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

// API Request Methods
import {
  getImportFormats,
  getListImportTables,
  listImportProcess,
  saveRecordImport
} from '@/api/ADempiere/form/VFileImport.js'

// Utils and Helper Methods
import { Message } from 'element-ui'

const VFileImport = {
  attribute: {
    charsets: String(''),
    importFormats: String(''),
    tablaId: Number(0),
    isProcess: Boolean(false),
    formatFields: Array([]),
    processDefinition: Object({}),
    step: Number(1)
  },
  options: {
    listCharsets: Array([]),
    listImportFormats: Array([]),
    listTables: Array([]),
    listProcess: Array([])
  },
  file: {
    data: Array([]),
    header: Array([]),
    resource: Object({})
  },
  infoFormat: Object({}),
  navigationLine: Object({})
}

export default {
  state: VFileImport,
  mutations: {
    /**
     * Update Attribute
     * Generic mutation that allows to change the state of the store
     * @param {string} attribute - Attribute and which one to update - Requires it to be an Object
     * @param {string} criteria - Object Criteria
     * @param {string} value - Value to Update
     */
    updateAttributeVFileImport(state, {
      attribute,
      criteria,
      value
    }) {
      state[attribute][criteria] = value
    },
    /**
     * Set File
     * @param {object} file - File
     */
    setFile(state, file) {
      state.file = file
    },
    setInfoFormat(state, formats) {
      state.infoFormat = formats
    },
    setNavigationLine(state, line) {
      state.navigationLine = line
    }
  },
  actions: {
    /**
     * Get List Import Formats
     * @param id 
     * @returns {Array} Return a List with the Importer Records
     */

    importFormats({ commit }, {
      id
    }) {
      return new Promise(resolve => {
        getImportFormats({
          id
        })
          .then(response => {
            commit('updateAttributeVFileImport', {
              attribute: 'attribute',
              criteria: 'formatFields',
              value: response.formatFields
            })
            commit('setInfoFormat', response)
            resolve(response)
          })
          .catch(error => {
            console.warn(`Error getting Import Formats: ${error.message}. Code: ${error.code}.`)
            resolve([])
          })
      })
    },

    /**
     * Find List Tables
     * @returns {Array} Return a List with the Importer Records 
     */

    findListTable({ commit }) {
      return new Promise(resolve => {
        getListImportTables()
          .then(response => {
            const { records } = response
            commit('updateAttributeVFileImport', {
              attribute: 'options',
              criteria: 'listTables',
              value: records
            })
            resolve(records)
          })
          .catch(error => {
            console.warn(`Error getting Import Table: ${error.message}. Code: ${error.code}.`)
            commit('updateAttributeVFileImport', {
              attribute: 'options',
              criteria: 'listTables',
              value: []
            })
            resolve([])
          })
      })
    },

    /**
     * Change Table
     * @param {Number} id - Change Table ID 
     */

    changeTable({ commit }, {
      id
    }) {
      commit('updateAttributeVFileImport', {
        attribute: 'attribute',
        criteria: 'tablaId',
        value: id
      })
    },
 
    /**
     * List of Processes associated with the Table
     * @param {String} TableName
     * @returns {Array} List Process Associated
     */

    listProcess({ commit }, {
      tableName
    }) {
      return new Promise(resolve => {
        listImportProcess({
          tableName
        })
          .then(response => {
            const { records } = response
            const list = records.map(list => {
              return {
                ...list,
                ...list.values
              }
            })
            commit('updateAttributeVFileImport', {
              attribute: 'options',
              criteria: 'listProcess',
              value: list
            })
            resolve(response)
          })
          .catch(error => {
            console.warn(`Error getting List Process Import: ${error.message}. Code: ${error.code}.`)
            resolve([])
          })
      })
    },

    /**
     * Save and Process Import
     * @returns {string} Message
     */

    saveRecords({ commit, getters }) {
      return new Promise(resolve => {
        const {
          charsets,
          isProcess,
          importFormats,
          processDefinition
        } = getters.getAttribute
        const { id } = getters.getFile
        const { containerUuid, fieldsList } = processDefinition
        const parametersList = getters.getProcessParameters({
          containerUuid,
          fieldsList
        })
        saveRecordImport({
          id,
          isProcess,
          parameters: parametersList,
          processId: processDefinition.id,
          charset: charsets,
          importFormatId: importFormats
        })
          .then(response => {
            const { message } = response
            Message({
              type: 'success',
              message: message
            })
            resolve(true)
          })
          .catch(error => {
            Message({
              type: 'success',
              message: error.message
            })
            resolve(true)
          })
      })
    }
  },
  getters: {
    getAttribute(state) {
      return state.attribute
    },
    getOptions(state) {
      return state.options
    },
    getFile(state) {
      return state.file
    },
    getInfoFormat(state) {
      return state.infoFormat
    },
    getNavigationLine(state) {
      return state.navigationLine
    }
  }
}
