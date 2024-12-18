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

// api request methods
import {
  requestListBusinessPartner,
  requestAddressLocations,
  requestContact
} from '@/api/ADempiere/fields/search/business-partner.ts'

const businessPartner = {
  isLoading: false,
  list: [],
  recordCount: 0,
  pageToken: '',
  pageNumber: 15,
  code: '',
  contact: '',
  phone: '',
  customersOnly: '',
  companyName: '',
  fantasyName: '',
  email: '',
  allOrAny: '',
  zipCode: '',
  showDialog: false,
  rowSelect: [],
  recordLocation: [],
  recordContact: [],
  isLoadingLocation: false,
  isLoadingContact: false
}

const formBusinessPartner = {
  state: businessPartner,
  mutations: {
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
    setCustomersOnly(state, customersOnly) {
      state.customersOnly = customersOnly
    },
    setCompanyName(state, companyName) {
      state.companyName = companyName
    },
    setFantasyName(state, fantasyName) {
      state.fantasyName = fantasyName
    },
    setEmail(state, email) {
      state.email = email
    },
    setAllOrAny(state, allOrAny) {
      state.allOrAny = allOrAny
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
    setPageZise(state, pageNumber) {
      state.pageNumber = pageNumber
    }
  },
  actions: {
    gridBusinessParnet({ commit },
      fieldId,
      value,
      contact,
      email,
      phone,
      name,
      postal_code,
      is_vendor,
      is_customer,
      pageToken,
      pageSize
    ) {
      return new Promise(resolve => {
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
          pageToken,
          pageSize
        )
          .then(response => {
            const { records, next_page_token, record_count } = response
            commit('setPageToken', next_page_token)
            commit('setRecord', records)
            commit('setRecordCount', record_count)
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
    getPageSize: (state) => {
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
    getCustomersOnly: (state) => {
      return state.customersOnly
    },
    getCompanyName: (state) => {
      return state.companyName
    },
    getFantasyName: (state) => {
      return state.fantasyName
    },
    getEmail: (state) => {
      return state.email
    },
    getAllOrAny: (state) => {
      return state.allOrAny
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
    }
  }
}

export default formBusinessPartner
