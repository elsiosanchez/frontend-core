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
  listCountriesRequest,
  getCountryRequest,
  listRegionsRequest,
  listCitiesRequest
} from '@/api/ADempiere/fields/location-address.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showMessage } from '@/utils/ADempiere/notification'
import { setComponentSequenceStandardAddressPanel } from '@/utils/ADempiere/dictionary/field/locationAddress'

const standardAddress = {
  showPanelAddress: false,
  isCopyShippingAddress: true,
  address: {
    is_default_shipping: false,
    is_default_billing: false,
    posalCodeAdditional: '',
    countryId: undefined,
    regionId: undefined,
    cityId: undefined,
    locationName: '',
    listCountries: [],
    listRegions: [],
    listCities: [],
    postalCode: '',
    countries: {},
    cityLabel: '',
    longitude: '',
    reference: '',
    address1: '',
    address2: '',
    address3: '',
    address4: '',
    latitude: '',
    altitude: '',
    email: '',
    phone: '',
    id: 0
  },
  newAddress: {
    shippingAddress: {
      is_default_billing: true,
      is_default_shipping: true,
      posalCodeAdditional: '',
      countryId: undefined,
      regionId: undefined,
      cityId: undefined,
      locationName: '',
      listCountries: [],
      listRegions: [],
      listCities: [],
      postalCode: '',
      countries: {},
      cityLabel: '',
      longitude: '',
      reference: '',
      address1: '',
      address2: '',
      address3: '',
      address4: '',
      latitude: '',
      altitude: '',
      email: '',
      phone: '',
      id: 0
    },
    billingAddress: {
      posalCodeAdditional: '',
      countryId: undefined,
      regionId: undefined,
      cityId: undefined,
      locationName: '',
      listCountries: [],
      is_default_billing: true,
      is_default_shipping: true,
      listRegions: [],
      listCities: [],
      postalCode: '',
      countries: {},
      cityLabel: '',
      longitude: '',
      reference: '',
      address1: '',
      address2: '',
      address3: '',
      address4: '',
      latitude: '',
      altitude: '',
      email: '',
      phone: '',
      id: 0
    }
  }
}

export default {
  state: standardAddress,

  mutations: {
    setShowPanelAddress(state, show) {
      state.showPanelAddress = show
    },
    setAttributeFieldAddress(state, {
      attribute,
      value
    }) {
      state.address[attribute] = value
    },
    setAttributeAddres(state, {
      is_default_shipping = true,
      is_default_billing = true,
      posalCodeAdditional = '',
      countryId = undefined,
      regionId = undefined,
      cityId = undefined,
      locationName = '',
      listCountries = [],
      listRegions = [],
      listCities = [],
      postalCode = '',
      countries = {},
      cityLabel = '',
      longitude = '',
      reference = '',
      address1 = '',
      address2 = '',
      address3 = '',
      address4 = '',
      latitude = '',
      altitude = '',
      email = '',
      phone = '',
      id = 0
    }) {
      state.address = {
        is_default_shipping,
        is_default_billing,
        posalCodeAdditional,
        countryId,
        regionId,
        cityId,
        locationName,
        listCountries,
        listRegions,
        listCities,
        postalCode,
        countries,
        cityLabel,
        longitude,
        reference,
        address1,
        address2,
        address3,
        address4,
        latitude,
        altitude,
        email,
        phone,
        id
      }
    },
    setAttributeFieldAddressNew(state, {
      typeLocations,
      attribute,
      value
    }) {
      state.newAddress[typeLocations][attribute] = value
    },
    setAttributeFieldAddressNewInitial(state, {
      typeLocations,
      value
    }) {
      state.newAddress[typeLocations] = value
    },
    setShowShippingAddress(state, show) {
      state.isCopyShippingAddress = show
    }
  },
  actions: {
    /**
     * Fields Locations Customer
     * countriesCustomers -> List All Countris
     * citiesCustomers -> List All cities
     * regionsCustomers -> List All Countris
     * countrieCustomers -> Get Countrie the Fields Customers
     */
    countriesStandardAddress({
      state,
      commit
    }, {
      typeLocations = ''
    }) {
      return new Promise(resolve => {
        listCountriesRequest({})
          .then(response => {
            const { countries } = response
            commit('setAttributeFieldAddress', {
              attribute: 'listCountries',
              value: countries
            })
            resolve(countries)
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
            resolve(error)
          })
      })
    },
    citiesStandardAddress({
      commit,
      getters
    }, {
      typeLocations = ''
    }) {
      return new Promise(resolve => {
        const countryId = getters.getAttributeFieldStandardAddress({
          attribute: 'countryId'
        })
        const regionId = getters.getAttributeFieldStandardAddress({
          attribute: 'regionId'
        })
        listCitiesRequest({
          countryId,
          regionId
        })
          .then(response => {
            const { cities } = response
            commit('setAttributeFieldAddress', {
              attribute: 'listCities',
              value: cities
            })
            resolve(cities)
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
            resolve(error)
          })
      })
    },
    countrieStandardAddress({
      commit
    }, {
      countryId,
      typeLocations = ''
    }) {
      return new Promise(resolve => {
        getCountryRequest({
          id: countryId
        })
          .then(response => {
            commit('setAttributeFieldAddress', {
              attribute: 'countries',
              value: {
                ...response,
                secuenceComponent: setComponentSequenceStandardAddressPanel(response)
              }
            })
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
            resolve(error)
          })
      })
    },
    regionsStandardAddress({
      commit,
      getters
    }, {
      typeLocations = ''
    }) {
      return new Promise(resolve => {
        const countryId = getters.getAttributeFieldStandardAddress({
          attribute: 'countryId'
        })
        listRegionsRequest({
          countryId
        })
          .then(response => {
            const { regions } = response
            commit('setAttributeFieldAddress', {
              attribute: 'listRegions',
              value: regions
            })
            resolve(regions)
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
            resolve(error)
          })
      })
    },
    /**
     * Clear Fields Standard Address
     */
    clearFieldStandardAddress({
      commit
    }, {
      typeLocations
    }) {
      return new Promise(resolve => {
        if (!isEmptyValue(typeLocations)) {
          commit('setAttributeFieldAddressNewInitial', {
            typeLocations,
            value: standardAddress.newAddress[typeLocations]
          })
          resolve()
        }
        // commit('setAttributeAddres')
        // resolve()
      })
    }
  },
  getters: {
    getShowPanelStandardAddress: (state) => {
      return state.showPanelAddress
    },
    getAddressFields: (state) => {
      return state.address
    },
    getAttributeFieldStandardAddress: (state) => ({ attribute }) => {
      return state.address[attribute]
    },
    getAddressNewFields: (state) => ({ typeLocations }) => {
      return state.newAddress[typeLocations]
    },
    getAttributeFieldStandardNewAddress: (state) => ({ attribute, typeLocations }) => {
      return state.newAddress[typeLocations][attribute]
    },
    getShowShippingAddress: (state) => {
      return state.isCopyShippingAddress
    },
    getAllAddressCreating: (state) => ({ typeLocations }) => {
      return state.newAddress[typeLocations]
    }
  }
}
