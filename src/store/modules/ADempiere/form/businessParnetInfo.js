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

// API Request Methods
import {
  requestListBusinessPartner,
  requestAddressLocations,
  requestContact
} from '@/api/ADempiere/fields/search/business-partner.ts'

// Constants
import { ROW_ATTRIBUTES } from '@/utils/ADempiere/tableUtils'
import { COLUMN_NAME } from '@/utils/ADempiere/dictionary/field/search/businessPartner.ts'

// Utils and Helper Methods
import { generatePageToken } from '@/utils/ADempiere/dataUtils'
import { formatQuantity } from '@/utils/ADempiere/formatValue/numberFormat'
import { convertBooleanToTranslationLang } from '@/utils/ADempiere/formatValue/booleanFormat'

const businessPartner = {
  isLoading: false,
  list: [],
  recordCount: 0,
  pageToken: '',
  pageSize: 100,
  pageNumber: 1,
  code: '',
  contact: '',
  groupId: -1,
  phone: '',
  isCustomer: '',
  isVendor: '',
  name: '',
  email: '',
  zipCode: '',
  showDialog: false,
  rowSelect: [],
  recordLocation: [],
  recordContact: [],
  isLoadingLocation: false,
  isLoadingContact: false,
  tabOptions: 'location'
}

const formBusinessPartner = {
  state: businessPartner,
  mutations: {
    setDefaulCriteria(state) {
      state.code = ''
      state.contact = ''
      state.phone = ''
      state.isCustomer = ''
      state.isVendor = ''
      state.name = ''
      state.email = ''
      state.groupId = -1
      state.zipCode = ''
      state.rowSelect = []
      state.recordLocation = []
      state.recordContact = []
    },
    setTabOptionsBusiness(state, tabOptions) {
      state.tabOptions = tabOptions
    },
    setIsLoadingContact(state, isLoadingContact) {
      state.isLoadingContact = isLoadingContact
    },
    setIsLoadingLocation(state, isLoadingLocation) {
      state.isLoadingLocation = isLoadingLocation
    },
    setRecordContact(state, recordContact) {
      state.recordContact = recordContact
    },
    setRecordLocation(state, recordLocation) {
      state.recordLocation = recordLocation
    },
    setRowSelect(state, rowSelect) {
      state.rowSelect = rowSelect
    },
    showDialogBusiness(state, show) {
      state.showDialog = show
    },
    setCode(state, code) {
      state.code = code
    },
    setContact(state, contact) {
      state.contact = contact
    },
    setPhone(state, phone) {
      state.phone = phone
    },
    setIsCustomer(state, isCustomer) {
      state.isCustomer = isCustomer
    },
    setIsVendor(state, isVendor) {
      state.isVendor = isVendor
    },
    setBusinessPartnerName(state, name) {
      state.name = name
    },
    setBusinessPartnerGroupId(state, groupId) {
      state.groupId = groupId
    },
    setEmail(state, email) {
      state.email = email
    },
    setZipCode(state, zipCode) {
      state.zipCode = zipCode
    },
    setRecord(state, record) {
      state.list = record
    },
    setIsLoading(state, isLoading) {
      state.isLoading = isLoading
    },
    setRecordCount(state, recordCount) {
      state.recordCount = recordCount
    },
    setPageToken(state, pageToken) {
      state.pageToken = pageToken
    },
    setPageNumber(state, pageNumber) {
      state.pageNumber = pageNumber
    },
    setPageZise(state, pageSize) {
      state.pageSize = pageSize
    }
  },
  actions: {
    loadBusinessPartnerFromServer({ commit },
      fieldId,
      value,
      contact,
      email,
      phone,
      name,
      postal_code,
      is_vendor,
      is_customer,
      business_partner_group_id,
      pageNumber,
      pageSize
    ) {
      return new Promise(resolve => {
        const pageToken = generatePageToken({ pageNumber })

        requestListBusinessPartner(
          fieldId,
          value,
          contact,
          email,
          phone,
          name,
          postal_code,
          is_vendor,
          is_customer,
          business_partner_group_id,
          pageToken,
          pageSize
        )
          .then(response => {
            const { records, next_page_token, record_count } = response
            commit('setPageToken', next_page_token)
            commit('setRecordCount', record_count)

            const recordsList = records.map((row, rowIndex) => {
              return {
                [COLUMN_NAME]: row.id,
                ...row,
                isCustomerFormated: convertBooleanToTranslationLang(row.is_customer),
                isVendorFormated: convertBooleanToTranslationLang(row.is_vendor),
                // open_balance_amount: Number(row.open_balance_amount),
                openBalanceAmountFormated: formatQuantity({
                  value: row.open_balance_amount
                }),
                // credit_available_amount: Number(row.credit_available_amount),
                creditAvailableAmountFormated: formatQuantity({
                  value: row.credit_available_amount
                }),
                // credit_used_amount: Number(row.credit_used_amount),
                creditUsedAmountFormated: formatQuantity({
                  value: row.credit_used_amount
                }),
                // revenue_amount: Number(row.revenue_amount),
                revenueAmountFormated: formatQuantity({
                  value: row.revenue_amount
                }),
                // datatables app attributes
                ...ROW_ATTRIBUTES,
                rowIndex
              }
            })
            commit('setRecord', recordsList)

            resolve()
          })
          .catch(error => {
            console.error('Error fetching business partners:', error)
            resolve()
          })
          .finally(() => {
            commit('setIsLoading', false)
          })
      })
    },
    requestLocation({ commit },
      id
    ) {
      commit('setIsLoadingLocation', true)
      return new Promise(resolve => {
        requestAddressLocations(id)
          .then(response => {
            const { records	} = response
            commit('setRecordLocation', records)
            resolve()
          })
          .catch(error => {
            console.error('Error fetching address locations:', error)
            resolve()
          })
          .finally(() => {
            commit('setIsLoadingLocation', false)
          })
      })
    },
    requestContact({ commit },
      id
    ) {
      commit('setIsLoadingContact', true)
      return new Promise(resolve => {
        requestContact(id)
          .then(response => {
            const { records	} = response
            commit('setRecordContact', records)
          })
          .catch(error => {
            console.error('Error fetching address locations:', error)
            resolve()
          })
          .finally(() => {
            commit('setIsLoadingContact', false)
          })
      })
    }
  },
  getters: {
    getBusinessPartners: (state) => {
      return state.list
    },
    getIsLoadingBusinness: (state) => {
      return state.isLoading
    },
    getRecordCount: (state) => {
      return state.recordCount
    },
    getPageTokenBusinness: (state) => {
      return state.pageToken
    },
    getPageSizeBusiness: (state) => {
      return state.pageSize
    },
    getPageNumberBusiness: (state) => {
      return state.pageNumber
    },
    getCode: (state) => {
      return state.code
    },
    getContact: (state) => {
      return state.contact
    },
    getPhone: (state) => {
      return state.phone
    },
    getIsCustomer: (state) => {
      return state.isCustomer
    },
    getIsVendor: (state) => {
      return state.isVendor
    },
    getBusinessPartnerGroupId: (state) => {
      return state.groupId
    },
    getBusinessPartnerName: (state) => {
      return state.name
    },
    getEmail: (state) => {
      return state.email
    },
    getZipCode: (state) => {
      return state.zipCode
    },
    getShowDialog: (state) => {
      return state.showDialog
    },
    getRowSelect: (state) => {
      return state.rowSelect
    },
    getRowLocation: (state) => {
      return state.recordLocation
    },
    getRowContact: (state) => {
      return state.recordContact
    },
    getIsLoadingLocation: (state) => {
      return state.isLoadingLocation
    },
    getIsLoadingContact: (state) => {
      return state.isLoadingContact
    },
    getTabOptionsBusiness: (state) => {
      return state.tabOptions
    }
  }
}

export default formBusinessPartner
