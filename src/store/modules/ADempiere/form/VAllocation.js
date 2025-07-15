/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
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

import Vue from 'vue'

// API Request Methods
import {
  requestListTransactionTypes,
  requestProcess,
  requestListPayments,
  requestListInvoices
} from '@/api/ADempiere/form/VAllocation.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
import { dateTimeFormats } from '@/utils/ADempiere/formatValue/dateFormat'
import { showMessage } from '@/utils/ADempiere/notification.js'

const initStateCriteria = {
  businessPartnerId: '',
  organizationId: -1,
  currencyId: -1,
  currency: {},
  listOrganization: [],
  conversionTypeId: -1,
  listConversionTypes: [],
  listCurrency: [],
  isMultiCurrency: false,
  date: '',
  transactionType: '',
  description: '',
  chargeId: -1
}

const initStateVAllocation = {
  transactionTypes: {},
  searchCriteria: {
    ...initStateCriteria
  },
  listRecord: {
    payments: [],
    invoce: []
  },
  selectListRecord: {
    payments: [],
    invoce: []
  },
  difference: {
    amount: 0,
    transactionType: ''
  },
  listAllDifference: [],
  list: {
    payments: [],
    invoces: []
  },
  process: {
    date: '',
    chargeId: 0,
    description: '',
    totalDifference: 0,
    transactionOrganizationsList: [],
    transactionOrganizationId: ''
  },
  paymentAssignment: {
    list: {
      invoces: [],
      payments: [],
      difference: []
    }
  },
  listSelectAll: [],
  isLoadingPayments: false,
  isLoadingInvoices: false,
  steps: 0
}

export default {
  state: {
    ...initStateVAllocation
  },

  mutations: {
    setTransactionTypes(state, payload) {
      state.transactionTypes = payload
    },
    setSearchCriteria(state, structure) {
      state.searchCriteria = structure
    },
    setBusinessPartner(state, id) {
      state.searchCriteria.businessPartnerId = id
    },
    setOrganizations(state, id) {
      state.searchCriteria.organizationId = id
    },
    setCurrency(state, id) {
      state.searchCriteria.currencyId = id
    },
    setDate(state, date) {
      state.searchCriteria.date = date
    },
    setTransactionType(state, type) {
      state.searchCriteria.transactionType = type
    },
    setListPayments(state, list) {
      state.listRecord.payments = list
    },
    setListInvoces(state, list) {
      state.listRecord.invoce = list
    },
    setSelectListPayments(state, listSelect) {
      state.selectListRecord.payments = listSelect
    },
    setSelectListInvoces(state, listSelect) {
      state.selectListRecord.invoce = listSelect
    },
    setDiference(state, {
      attribute,
      value
    }) {
      Vue.set(state.difference, attribute, value)
    },
    setProcess(state, {
      attribute,
      value
    }) {
      Vue.set(state.process, attribute, value)
    },
    setListDifference(state) {
      const payments = state.list.payments
      const invoces = state.list.invoces
      const list = payments.concat(invoces)
      state.listAllDifference = list
    },
    setListSelectPayments(state, list) {
      state.list.payments = list
    },
    setListSelectInvoices(state, list) {
      state.list.invoces = list
    },
    /**
     * Update Attribute
     * Generic mutation that allows to change the state of the store
     * @param {string} attribute - Attribute and which one to update - Requires it to be an Object
     * @param {string} criteria - Object Criteria
     * @param {string} value - Value to Update
     */
    updateAttributeCriteriaVallocation(state, {
      attribute,
      criteria,
      value
    }) {
      state[criteria][attribute] = value
    },
    setChangeSteps(state, steps) {
      state.steps = steps
    },
    setAddListInvoces(state, invoces) {
      state.paymentAssignment.list.invoces = invoces
    },
    setAddListPayments(state, payments) {
      state.paymentAssignment.list.payments = payments
    },
    setAddDiference(state, addDiference) {
      const allList = state.paymentAssignment.list.difference
      const isExistList = allList.find(row => row.id === addDiference.id)
      if (isEmptyValue(isExistList)) {
        state.paymentAssignment.list.difference.push(addDiference)
      }
    },
    setDiferenceTotal(state, list) {
      state.paymentAssignment.list.difference = list
    },
    setListSelectInvoceandPayment(state, list) {
      state.listSelectAll = list
    },
    setIsLoadingPayments(state, isLoading = false) {
      state.isLoadingPayments = isLoading
    },
    setIsLoadingInvoices(state, isLoading = false) {
      state.isLoadingInvoices = isLoading
    },
    resetStateVAllocation(state) {
      Vue.set(state, 'searchCriteria', {
        ...initStateCriteria
      })
      state = {
        ...initStateVAllocation
      }
    }
  },

  actions: {
    loadTransactonsTypesFromServer({ commit, state }) {
      return new Promise(resolve => {
        requestListTransactionTypes()
          .then(response => {
            const { records } = response

            const transactionTypes = {}
            records.forEach(item => {
              const { values } = item
              const { KeyColumn, DisplayColumn } = values
              transactionTypes[KeyColumn] = DisplayColumn
            })

            commit('setTransactionTypes', transactionTypes)

            resolve(transactionTypes)
          })
      })
    },

    findListPayment({ commit, state }) {
      return new Promise(resolve => {
        const {
          businessPartnerId,
          date,
          organizationId,
          currencyId,
          isMultiCurrency,
          conversionTypeId,
          transactionType,
          isAutomaticWriteOff
        } = state.searchCriteria

        commit('setIsLoadingPayments', true)
        requestListPayments({
          businessPartnerId,
          date,
          organizationId,
          currencyId,
          isMultiCurrency,
          conversionTypeId,
          transactionType,
          isAutomaticWriteOff
        })
          .then(response => {
            const { records } = response
            const recordsList = records.map(payment => {
              return {
                ...payment,
                transaction_date: dateTimeFormats(payment.transaction_date, 'YYYY-MM-DD'),
                applied: 0,
                open_amount: Number(payment.open_amount),
                payment_amount: Number(payment.payment_amount),
                converted_amount: Number(payment.converted_amount),
                amountApplied: 0,
                isSelect: false,
                type: 'isPayment'
              }
            })
            commit('setListPayments', recordsList)

            resolve(recordsList)
            commit('setIsLoadingPayments', false)
          })
          .catch(error => {
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })

            resolve([])
            commit('setIsLoadingPayments', false)
            console.warn(`Error getting List Product: ${error.message}. Code: ${error.code}.`)
          })
      })
    },
    findListInvoices({ commit, state }) {
      return new Promise(resolve => {
        const {
          businessPartnerId,
          date,
          organizationId,
          currencyId,
          isMultiCurrency,
          conversionTypeId,
          transactionType,
          isAutomaticWriteOff
        } = state.searchCriteria

        commit('setIsLoadingInvoices', true)
        requestListInvoices({
          businessPartnerId,
          date,
          organizationId,
          currencyId,
          isMultiCurrency,
          conversionTypeId,
          transactionType,
          isAutomaticWriteOff
        })
          .then(response => {
            const { records } = response
            const recordsList = records.map(invoice => {
              return {
                ...invoice,
                date_invoiced: dateTimeFormats(invoice.date_invoiced, 'YYYY-MM-DD'),
                applied: Number(invoice.open_amount),
                writeOff: 0,
                isSelect: false,
                discount_amount: Number(invoice.discount_amount),
                open_amount: Number(invoice.open_amount),
                amountApplied: 0,
                overUnderPay: 0,
                type: 'isInvoce'
              }
            })
            commit('setListInvoces', recordsList)

            resolve(recordsList)
            commit('setIsLoadingInvoices', false)
          })
          .catch(error => {
            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            resolve([])
            commit('setIsLoadingInvoices', false)
            console.warn(`Error getting List Product: ${error.message}. Code: ${error.code}.`)
          })
      })
    },
    processSend({ dispatch, state }) {
      return new Promise(resolve => {
        let invoiceSelectionList = []
        let paymentSelectionsList = []
        const {
          businessPartnerId,
          currencyId,
          isMultiCurrency,
          conversionTypeId
        } = state.searchCriteria
        const {
          date,
          chargeId,
          description,
          totalDifference
        } = state.process
        let transactionOrganizationId = state.process.transactionOrganizationId
        if (isEmptyValue(transactionOrganizationId)) {
          transactionOrganizationId = state.searchCriteria.organizationId
        }
        let listInvoce, listPayments
        if (!isEmptyValue(state.listSelectAll)) {
          listInvoce = state.listSelectAll.filter(list => list.type === 'isInvoce')
          listPayments = state.listSelectAll.filter(list => list.type === 'isPayment')
        }
        if (!isEmptyValue(listInvoce)) {
          invoiceSelectionList = listInvoce.map(list => {
            return {
              ...list,
              date_invoiced: new Date(list.date_invoiced),
              discount_amount: list.discount_amount.toString(),
              write_off_amount: list.writeOff.toString(),
              applied_amount: list.amountApplied.toString(),
              open_amount: list.open_amount.toString()
            }
          })
        }
        if (!isEmptyValue(listPayments)) {
          paymentSelectionsList = listPayments.map(list => {
            return {
              ...list,
              transaction_date: new Date(list.transaction_date),
              applied_amount: list.applied.toString()
            }
          })
        }
        requestProcess({
          date: new Date(date),
          chargeId,
          currencyId,
          isMultiCurrency,
          conversionTypeId,
          description,
          totalDifference: totalDifference.toString(),
          businessPartnerId,
          invoiceSelectionList,
          paymentSelectionsList,
          transactionOrganizationId
        })
          .then(response => {
            const { message } = response
            showMessage({
              type: 'success',
              message,
              showClose: true
            })
            dispatch('findListPayment')
            dispatch('findListInvoices')
            resolve(response)
          })
          .catch(error => {
            let message = error.message
            if (!isEmptyValue(error.response) && !isEmptyValue(error.response.data.message)) {
              message = error.response.data.message
            }
            showMessage({
              type: 'error',
              message,
              showClose: true
            })
            resolve([])
            console.warn(`Error getting List Product: ${error.message}. Code: ${error.code}.`)
          })
      })
    },
    changeDiference({ commit, state }, {
      row
    }) {
      const list = state.paymentAssignment.list.difference
      const filters = list.filter(difference => difference.id !== row.id)
      commit('setDiferenceTotal', filters)
      return
    }
  },

  getters: {
    getStoredTransactionTypes(state) {
      return state.transactionTypes
    },
    getSearchFilter(state) {
      return state.searchCriteria
    },
    getListVAllocation(state) {
      return state.listRecord
    },
    getSelectListPayments(state) {
      return state.selectListRecord.payments
    },
    getSelectListInvoces(state) {
      return state.selectListRecord.invoce
    },
    getListDifference(state) {
      const payments = state.list.payments
      const invoces = state.list.invoces
      if (isEmptyValue(payments) && isEmptyValue(invoces)) {
        return []
      }
      return payments.concat(invoces).map(list => {
        const date = Object.keys(list).find(key => key.includes('date'))
        return {
          transactionDate: list[date],
          transactionType: list.transaction_type.value,
          amount: list.applied
        }
      })
    },
    getProcess(state) {
      return state.process
    },
    getPaymentAssignment(state) {
      return state.paymentAssignment.list
    },
    getSteps(state) {
      return state.steps
    },
    getAllDiference(state) {
      return state.paymentAssignment.list.difference
    },
    getListSelectInvoceandPayment(state) {
      return state.listSelectAll
    },
    getIsLoadingPayments(state) {
      return state.isLoadingPayments
    },
    getIsLoadingInvoices(state) {
      return state.isLoadingInvoices
    }
  }
}
