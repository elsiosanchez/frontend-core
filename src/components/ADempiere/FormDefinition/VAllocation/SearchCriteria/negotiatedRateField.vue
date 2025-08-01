<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
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
  <el-form-item
    style="width: 100%;"
    :required="true"
  >
    <template slot="label">
      <!-- {{ $t('form.VAllocation.searchCriteria.negotiatedRate') }} -->
      <!-- <span style="color: #f34b4b"> * </span> -->
    </template>

    <el-popover
      v-model="visible"
      width="550"
      placement="top"
    >
      <!-- <el-card style="padding: 5px 10px 5px 10px;"> -->
      <el-form
        :inline="true"
        label-position="top"
        class="form-base"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <business-partner-field
              :metadata="metadata"
              :read-only="true"
            />
          </el-col>

          <el-col :span="12">
            <organization-field
              :read-only="true"
            />
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <currency-field
              :read-only="true"
            />
          </el-col>

          <el-col :span="12">
            <el-form-item
              :label="$t('form.VAllocation.searchCriteria.date')"
            >
              <el-date-picker
                v-model="dateMetadate"
                :disabled="true"
                type="date"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <conversion-type-field
              :read-only="true"
            />
          </el-col>

          <el-col :span="12">
            <el-form-item
              :label="$t('form.VAllocation.searchCriteria.negotiatedRate')"
            >
              <el-input-number
                v-model="negotiatedRate"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <p style="margin: 0;text-align: right">
        <el-button
          type="danger"
          class="button-base-icon"
          icon="el-icon-close"
          @click="close"
        />
        <el-button
          type="primary"
          class="button-base-icon"
          icon="el-icon-check"
          :loading="isLoading"
          :disabled="isDisabledProcess"
          @click="sendConversionRate"
        />
      </p>
      <!-- </el-card> -->
      <el-button slot="reference">
        <b>
          {{ $t('form.VAllocation.searchCriteria.negotiatedRate') }}
          <span v-if="!isEmptyValue(displayRate)">
            {{ ': ' }}
          </span>
        </b>
        <span v-if="!isEmptyValue(displayRate)">
          {{ displayRate }}
        </span>
      </el-button>
    </el-popover>
  </el-form-item>
</template>

<script>
import { computed, defineComponent, ref } from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import EmptyOptionSelect from '@/components/ADempiere/FieldDefinition/FieldSelect/emptyOptionSelect.vue'
import CurrencyField from '@/components/ADempiere/FormDefinition/VAllocation/SearchCriteria/currencyField.vue'
import OrganizationField from '@/components/ADempiere/FormDefinition/VAllocation/SearchCriteria/organizationField.vue'
import ConversionTypeField from '@/components/ADempiere/FormDefinition/VAllocation/SearchCriteria/conversionTypeField.vue'
import BusinessPartnerField from '@/components/ADempiere/FormDefinition/VAllocation/SearchCriteria/businessPartnerField.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

// API Request Methods
import { requestListConversionTypes } from '@/api/ADempiere/form/VAllocation.ts'

export default defineComponent({
  name: 'NegotiatedRateField',

  components: {
    CurrencyField,
    EmptyOptionSelect,
    OrganizationField,
    ConversionTypeField,
    BusinessPartnerField
  },

  props: {
    metadata: {
      type: Object,
      default: () => {
        return {}
      }
    },
    dateMetadate: {
      type: [String, Date],
      default: ''
    }
  },

  setup(props) {
    const visible = ref(false)
    // const isLoading = ref(false)
    const negotiatedRate = ref(0)

    const isLoading = computed(() => {
      return store.getters.getIsLoadingNegotiatedRate
    })

    const organizationId = computed(() => {
      const { organizationId } = store.getters.getSearchFilter
      return organizationId
    })

    const businessPartnerId = computed(() => {
      const { businessPartnerId } = store.getters.getSearchFilter
      return businessPartnerId
    })

    const currencyId = computed(() => {
      const { currencyId } = store.getters.getSearchFilter
      return currencyId
    })

    const conversionTypeId = computed(() => {
      const { conversionTypeId } = store.getters.getSearchFilter
      return conversionTypeId
    })

    const isDisabledProcess = computed(() => {
      return isEmptyValue(organizationId.value) || isEmptyValue(businessPartnerId.value) || isEmptyValue(currencyId.value) || isEmptyValue(props.dateMetadate) || isEmptyValue(conversionTypeId.value)
    })

    const currentNegotiatedRate = computed(() => {
      return store.getters.getCurrentNegotiatedRate
    })

    const displayRate = computed(() => {
      if (isEmptyValue(currentNegotiatedRate.value)) return ''
      return currentNegotiatedRate.value.multiply_rate
    })

    function sendConversionRate() {
      // isLoading.value = true
      store.dispatch('createConversionRate', {
        businessPartnerId: businessPartnerId.value,
        conversionTypeId: conversionTypeId.value,
        negotiatedRate: negotiatedRate.value.toString(),
        organizationId: organizationId.value,
        currencyToId: currencyId.value,
        date: props.dateMetadate
      })
        .then(response => {
          const { conversion_type } = response
          requestListConversionTypes({})
            .then(listConversionTypes => {
              const { records } = listConversionTypes
              const formatedList = records.map(conversionType => {
                const { id, uuid, name, is_default } = conversionType
                return {
                  id,
                  uuid,
                  label: name,
                  is_default
                }
              })
              store.commit('updateAttributeCriteriaVallocation', {
                attribute: 'listConversionTypes',
                criteria: 'searchCriteria',
                value: formatedList
              })
              store.commit('updateAttributeCriteriaVallocation', {
                attribute: 'conversionTypeId',
                criteria: 'searchCriteria',
                value: conversion_type.id
              })
            })
            .finally(() => {
              close()
            })
        })
    }

    function close() {
      visible.value = false
      negotiatedRate.value = 0
    }

    negotiatedRate.value = 0

    return {
      // Ref
      visible,
      negotiatedRate,
      // Computeds
      isLoading,
      currencyId,
      displayRate,
      organizationId,
      conversionTypeId,
      businessPartnerId,
      isDisabledProcess,
      currentNegotiatedRate,
      // Methods
      close,
      sendConversionRate
    }
  }
})
</script>
