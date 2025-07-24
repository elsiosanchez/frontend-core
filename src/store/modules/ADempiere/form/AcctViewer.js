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

// API Request Methods
import {
  requestListAccountingSchemas,
  requestPostingTypesList,
  requestListOrganizations,
  requestAccountingFacts,
  requestExistsAccountingDocument
} from '@/api/ADempiere/form/accounting.js'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'
import { formatQuantity } from '@/utils/ADempiere/formatValue/numberFormat'

const initState = {
  currentAccountingSchemaId: -1,
  accountingShemasList: [],
  currentPostingTypeValue: '',
  postingTypesList: [],
  currentAccountingOrganizationId: ' ',
  accountingOrganizationsList: [],
  isLoadingAccountingRecords: false,
  accountingRecordsList: [],
  // user interface
  isDisplayDocumentInfo: false,
  isDisplaySourceInfo: false,
  isDisplayQuantity: false,
  isShowAccountingFacts: false // TODO: Add support by Table Name and Record ID
}

const acctViewer = {
  state: initState,

  mutations: {
    setAccountSchemaId(state, id) {
      state.currentAccountingSchemaId = id
    },
    setAccountSchemasList(state, records = []) {
      state.accountingShemasList = records
    },
    setPostingTypeValue(state, value) {
      state.currentPostingTypeValue = value
    },
    setPostingTypesList(state, records = []) {
      state.postingTypesList = records
    },
    setAccountingOrganizationId(state, id) {
      state.currentAccountingOrganizationId = id
    },
    setAccountingOrganizationsList(state, records = []) {
      state.accountingOrganizationsList = records
    },
    setIsLoadingAccountingRecords(state, isLoading = false) {
      state.isLoadingAccountingRecords = isLoading
    },
    setAccountingRecordsList(state, records = []) {
      state.accountingRecordsList = records
    },
    setIsDisplayDocumentInfo(state, isShow = false) {
      state.isDisplayDocumentInfo = isShow
    },
    setIsDisplaySourceInfo(state, isShow = false) {
      state.isDisplaySourceInfo = isShow
    },
    setIsDisplayQuantity(state, isShow = false) {
      state.isDisplayQuantity = isShow
    },
    setIsShowAccountingFacts(state, isShow = false) {
      state.isShowAccountingFacts = isShow
    }
  },

  actions: {
    getAccountingSchemasFromServer({ commit }, {
      searchValue
    }) {
      return new Promise(resolve => {
        requestListAccountingSchemas({
          searchValue
        })
          .then(response => {
            const { records } = response
            // let list = records
            const recordsList = records.map(row => {
              const { KeyColumn, UUID, DisplayColumn } = row.values
              return {
                UUID,
                KeyColumn,
                DisplayColumn
              }
            })

            commit('setAccountSchemasList', recordsList)
            resolve(recordsList)
          })
      })
    },

    getPostingTypesFromServer({ commit }, {
      searchValue
    }) {
      return new Promise(resolve => {
        requestPostingTypesList({
          searchValue
        })
          .then(response => {
            const { records } = response
            // let list = records
            const recordsList = records.map(row => {
              const { KeyColumn, UUID, DisplayColumn } = row.values
              return {
                UUID,
                KeyColumn,
                DisplayColumn
              }
            })

            commit('setPostingTypesList', recordsList)
            resolve(recordsList)
          })
      })
    },

    getAccountingOrganizationsFromServer({ commit }, {
      searchValue
    }) {
      return new Promise(resolve => {
        requestListOrganizations({
          searchValue
        })
          .then(response => {
            const { records } = response
            // let list = records
            const recordsList = records.map(row => {
              const { KeyColumn, UUID, DisplayColumn } = row.values
              return {
                UUID,
                KeyColumn,
                DisplayColumn
              }
            })

            commit('setAccountingOrganizationsList', recordsList)
            resolve(recordsList)
          })
      })
    },

    getAccountingFactsFromServer({ commit, getters }, {
      searchValue,
      tableName,
      recordUuid,
      recordId
    }) {
      const accountingSchemaId = getters.getCurrentStoredAccountingSchemaId
      if (isEmptyValue(accountingSchemaId)) {
        return
      }
      return new Promise(resolve => {
        commit('setIsLoadingAccountingRecords', true)
        const organizationId = getters['user/getOrganization'].id
        const postingType = getters.getCurrentStoredPostingTypeValue
        requestAccountingFacts({
          accountingSchemaId,
          organizationId,
          postingType: isEmptyValue(postingType) ? undefined : postingType,
          tableName,
          recordId,
          recordUuid,
          searchValue,
          filters: []
        })
          .then(response => {
            const recordsList = response.records.map(row => {
              const { id, tableName, values } = row
              const { AmtSourceDr, AmtSourceCr, AmtAcctDr, AmtAcctCr } = values
              let rate = Number(AmtSourceDr.value) + Number(AmtSourceCr.value)
              if (rate !== 0) {
                rate = (Number(AmtAcctDr.value) + Number(AmtAcctCr.value)) / (Number(AmtSourceDr.value) + Number(AmtSourceCr.value))
              }
              return {
                ...values,
                AmtSourceDr: formatQuantity({
                  value: Number(AmtSourceDr.value)
                }),
                AmtSourceCr: formatQuantity({
                  value: Number(AmtSourceCr.value)
                }),
                AmtAcctDr: formatQuantity({
                  value: Number(AmtAcctDr.value)
                }),
                AmtAcctCr: formatQuantity({
                  value: Number(AmtAcctCr.value)
                }),
                DateAcct: formatDate({
                  value: values.DateAcct
                }),
                DateTrx: formatDate({
                  value: values.DateTrx
                }),
                Qty: formatQuantity({
                  value: Number(values.Qty.value)
                }),
                Rate: formatQuantity({
                  value: rate
                }),
                id,
                tableName
              }
            })
            commit('setAccountingRecordsList', recordsList)
            resolve(recordsList)
          })
          .finally(() => {
            commit('setIsLoadingAccountingRecords', false)
          })
      })
    },

    getExistsAccountingDocument({ commit, getters }, {
      accountingSchemaId,
      tableName,
      recordId
    }) {
      return new Promise(resolve => {
        if (isEmptyValue(tableName) || isEmptyValue(recordId)) {
          commit('setIsShowAccountingFacts', false)
          resolve(false)
          return
        }
        const organizationId = getters['user/getOrganization'].id

        requestExistsAccountingDocument({
          accountingSchemaId,
          organizationId,
          tableName,
          recordId
        })
          .then(response => {
            const { is_show_accounting } = response
            commit('setIsShowAccountingFacts', is_show_accounting)
            resolve(is_show_accounting)
          })
          .catch(error => {
            console.warn(error)
            commit('setIsShowAccountingFacts', false)
            resolve(false)
          })
      })
    }
  },

  getters: {
    getCurrentStoredAccountingSchemaId: (state) => {
      return state.currentAccountingSchemaId
    },
    getStoredAccountingShemasList: (state) => {
      return state.accountingShemasList
    },
    getCurrentStoredPostingTypeValue: (state) => {
      return state.currentPostingTypeValue
    },
    getStoredPostingTypesList: (state) => {
      return state.postingTypesList
    },
    getCurrentStoredAccountingOrganizationId: (state) => {
      return state.currentAccountingOrganizationId
    },
    getStoredAccountingOrganizationsList: (state) => {
      return state.accountingOrganizationsList
    },
    getIsLoadingAccountingRecords: (state) => {
      return state.isLoadingAccountingRecords
    },
    getAccountingRecordsList: (state) => {
      return state.accountingRecordsList
    },
    getIsDisplayDocumentInfo: (state) => {
      return state.isDisplayDocumentInfo
    },
    getIsDisplaySourceInfo: (state) => {
      return state.isDisplaySourceInfo
    },
    getIsDisplayQuantity: (state) => {
      return state.isDisplayQuantity
    },
    getIsShowAccountingFacts: (state) => {
      return state.isShowAccountingFacts
    }
  }
}

export default acctViewer
