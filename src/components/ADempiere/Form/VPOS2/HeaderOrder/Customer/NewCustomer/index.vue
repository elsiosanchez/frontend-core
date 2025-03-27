<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-card
    shadow="never"
    :body-style="{ padding: '5px' }"
  >
    <el-dropdown
      trigger="click"
      style="float: right"
      @command="handleSelectTemplate"
    >
      <span class="el-dropdown-link">
        {{ $t('form.pos.order.BusinessPartnerCreate.partnerTemplate') }}
        <b v-if="!isEmptyValue(currentTemplates)">
          {{ '(' + currentTemplates + ')' }}
        </b>
        <i
          class="el-icon-arrow-down el-icon--right"
        />
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="(template, index) in listTemplate"
          :key="index"
          :command="template"
        >
          <i
            v-if="template.id === customerTemplate"
            class="el-icon-d-arrow-right"
          /> {{ template.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <br>
    <br>
    <customer-data />
    <br>
    <add-address
      v-if="isVisibleAddress"
      :is-copy-shipping-address="copyShippingAddress"
    />
    <el-row :gutter="24">
      <el-col :span="24">
        <samp style="float: right; padding-top: 5px;">
          <el-checkbox
            v-model="isVisibleAddress"
            :label="$t('form.pos.order.BusinessPartnerCreate.addBillingAddress')"
            :border="true"
            style="float: right;margin: 0px;"
          />
          <el-checkbox
            v-model="isEditTaxId"
            :label="$t('form.pointOfSales.customer.fieldCutomer.isEditTax')"
            :border="true"
            style="float: right;margin: 0px;"
          />
          <el-checkbox
            v-if="isVisibleAddress"
            v-model="copyShippingAddress"
            :label="$t('form.byInvoice.copyShippingAddress')"
            :border="true"
            style="float: right;margin-right: 5px;"
          />
        </samp>
      </el-col>
    </el-row>
    <el-row :gutter="24">
      <el-col :span="24">
        <samp style="float: right; padding-right: 10px;">
          <el-button
            type="danger"
            class="button-base-icon"
            icon="el-icon-close"
            @click="close()"
          />
          <el-button
            type="primary"
            class="button-base-icon"
            icon="el-icon-check"
            :disabled="isDisabled || isLoading"
            :loading="isLoading"
            @click="createBusinessParter"
          />
        </samp>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import {
  defineComponent,
  computed,
  // watch,
  ref
} from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import CustomerData from './CustomerData.vue'
import AddAddress from './AddAddress/index.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'

export default defineComponent({
  name: 'NewCustomer',

  components: {
    CustomerData,
    AddAddress
  },

  setup() {
    // Ref
    const activeNames = ref(['1', '2'])
    const isVisibleAddress = ref(false)
    const copyShippingAddress = ref(true)
    const isLoading = ref(false)
    const isEditTaxId = computed({
      get() {
        return store.getters.getShowTax
      },
      // setter
      set(value) {
        if (value) {
          store.commit('setAttributeFieldCustomer', {
            attribute: 'identificationNumber',
            value: ''
          })
        }
        store.commit('setShowTax', value)
      }
    })

    // Computed
    const isDisabled = computed(() => {
      const taxId = store.getters.getAttributeFieldCustomer({
        attribute: 'identificationNumber'
      })
      const name = store.getters.getAttributeFieldCustomer({
        attribute: 'name'
      })

      if (isEmptyValue(name)) return true

      if (isEditTaxId.value && isEmptyValue(taxId)) return true

      if (isVisibleAddress.value) {
        if (!copyShippingAddress.value) {
          const countryShipping = store.getters.getAttributeFieldLocationsCustomers({
            typeLocations: 'shippingAddress',
            attribute: 'countryId'
          })
          if (isEmptyValue(countryShipping)) {
            return true
          }
        }
        const countryBilling = store.getters.getAttributeFieldLocationsCustomers({
          typeLocations: 'billingAddress',
          attribute: 'countryId'
        })
        if (isEmptyValue(countryBilling)) {
          return true
        }
      }
      return false
    })

    const addresses = computed(() => {
      const billingAddress = store.getters.getAttributeBillingAddress

      const shippingAddress = store.getters.getAttributeShippingAddress

      const phone = store.getters.getAttributeFieldCustomer({
        attribute: 'phone'
      })

      const email = store.getters.getAttributeFieldCustomer({
        attribute: 'email'
      })

      if (isVisibleAddress.value && copyShippingAddress.value) {
        return [
          {
            ...billingAddress,
            phone,
            email,
            is_default_billing: true,
            is_default_shipping: true,
            location_name: billingAddress.locationName
          }
        ]
      }
      if (isVisibleAddress.value) {
        return [
          {
            ...billingAddress,
            phone,
            email,
            is_default_billing: true,
            is_default_shipping: false,
            location_name: billingAddress.locationName
          },
          {
            ...shippingAddress,
            phone,
            email,
            is_default_billing: false,
            is_default_shipping: true,
            location_name: shippingAddress.locationName
          }
        ]
      }
      return [
        {
          ...billingAddress,
          phone,
          email,
          is_default_billing: true,
          is_default_shipping: false,
          city_name: billingAddress.cityLabel,
          location_name: billingAddress.locationName
        },
        {
          ...shippingAddress,
          phone,
          email,
          is_default_billing: false,
          is_default_shipping: true,
          location_name: shippingAddress.locationName
        }
      ]
    })

    const customerTemplate = computed({
      get() {
        return store.getters.getCurrentTemplates
      },
      // setter
      set(value) {
        store.commit('setCurrentTemplates', value)
      }
    })

    const listTemplate = computed(() => {
      return store.getters.getCustomerTemplates
    })

    const currentTemplates = computed(() => {
      if (listTemplate.value) {
        const template = listTemplate.value.find(template => template.id === customerTemplate.value)
        if (template) return template.name
      }
      return ''
    })

    // Methods

    /**
     * Close Panel Create New Customer
     */
    function close() {
      store.commit('setShowCustomerList', false)
      store.dispatch('clearDataFormCustomer')
    }

    function createBusinessParter() {
      isLoading.value = true
      store.dispatch('createCustomer', {
        customer_template_id: customerTemplate.value,
        addresses: addresses.value.map(list => {
          return {
            ...list,
            city_id: list.cityId,
            region_id: list.regionId,
            city_name: list.cityLabel,
            country_id: list.countryId,
            postal_code: list.postalCode,
            location_name: list.locationName,
            postal_code_additional: list.posalCodeAdditional
          }
        })
      })
        .finally(() => {
          isLoading.value = false
          close()
        })
    }

    function handleSelectTemplate(template) {
      customerTemplate.value = template.id
    }

    return {
      // Ref
      isLoading,
      isEditTaxId,
      activeNames,
      isVisibleAddress,
      copyShippingAddress,
      // Computed
      addresses,
      isDisabled,
      listTemplate,
      currentTemplates,
      customerTemplate,
      // Methods
      close,
      handleSelectTemplate,
      createBusinessParter
    }
  }
})
</script>

<style lang="scss" scoped>
.label {
  display: contents;
}
</style>
