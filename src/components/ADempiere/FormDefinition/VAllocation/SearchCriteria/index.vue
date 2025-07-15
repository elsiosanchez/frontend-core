<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
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
  <div style="display: contents;height: 100% !important;">
    <div style="height: 100% !important;">
      <el-card id="panel-top-search-criteria" class="panel-top-search-criteria">
        <div style="width: 50%;">
          <el-card style="padding: 5px 10px 5px 10px;">
            <el-form
              :inline="true"
              label-position="top"
              class="form-base"
            >
              <el-row :gutter="20">
                <el-col :span="12">
                  <business-partner-field
                    :metadata="metadata"
                  />
                </el-col>

                <el-col :span="12">
                  <organization-field />
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <currency-field />
                </el-col>

                <el-col :span="12">
                  <el-form-item
                    :label="$t('form.VAllocation.searchCriteria.date')"
                  >
                    <el-date-picker
                      v-model="currentDate"
                      type="date"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <multi-currency-field />
                </el-col>

                <el-col v-if="isMultiCurrency" :span="12">
                  <conversion-type-field />
                </el-col>
              </el-row>
            </el-form>
          </el-card>
        </div>

        <div style="width: 50%;">
          <el-card style="height: 100%;">
            <div slot="header" class="clearfix" style="text-align: center;">
              <b> {{ $t('form.VAllocation.searchCriteria.transactionType') }} </b>
            </div>
            <div style="padding: 10px !important;">
              <br>
              <br>
              <br>
              <el-form
                :inline="true"
                label-position="top"
                class="demo-form-inline"
                style="text-align: center;"
              >
                <el-form-item>
                  <el-checkbox
                    v-model="receivablesOnly"
                    :label="labelReceivablesOnly"
                    border
                  />
                  <el-checkbox
                    v-model="payablesOnly"
                    :label="labelPayablesOnly"
                    border
                  />
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </div>
      </el-card>

      <p v-show="false" style="text-align: center;">
        <el-radio
          v-model="radioPanel3"
          :border="true"
          :label="$t('form.VAllocation.searchCriteria.option.assignFromOrder')"
        />
        <el-radio
          v-model="radioPanel3"
          :border="true"
          :label="$t('form.VAllocation.searchCriteria.option.fullAmount')"
        />
        <el-radio
          v-model="radioPanel3"
          :border="true"
          :label="$t('form.VAllocation.searchCriteria.option.autoAssign')"
        />

        <el-radio
          v-model="radioPanel2"
          :border="true"
          :label="$t('form.VAllocation.searchCriteria.option.manual')"
        />
        <el-radio
          v-model="radioPanel2"
          :border="true"
          :label="$t('form.VAllocation.searchCriteria.option.closingBalance')"
        />
      </p>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  computed,
  watch,
  ref
} from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import BusinessPartnerField from '@/components/ADempiere/FormDefinition/VAllocation/SearchCriteria/businessPartnerField.vue'
import ConversionTypeField from '@/components/ADempiere/FormDefinition/VAllocation/SearchCriteria/conversionTypeField.vue'
import CurrencyField from '@/components/ADempiere/FormDefinition/VAllocation/SearchCriteria/currencyField.vue'
import multiCurrencyField from '@/components/ADempiere/FormDefinition/VAllocation/SearchCriteria/multiCurrencyField.vue'
import FieldDefinition from '@/components/ADempiere/FieldDefinition/index.vue'
import EmptyOptionSelect from '@/components/ADempiere/FieldDefinition/FieldSelect/emptyOptionSelect.vue'
import OrganizationField from '@/components/ADempiere/FormDefinition/VAllocation/SearchCriteria/organizationField.vue'

// Constants
import {
  ONLY_PAYABLES,
  ONLY_RECEIVABLES,
  RECEIVABLES_AND_PAYABLES
} from '@/utils/ADempiere/dictionary/form/VAllocation'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'SearchCriteria',

  components: {
    BusinessPartnerField,
    ConversionTypeField,
    CurrencyField,
    FieldDefinition,
    EmptyOptionSelect,
    OrganizationField,
    multiCurrencyField
  },

  props: {
    metadata: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  setup() {
    /**
     * Refs
     */
    const radioPanel2 = ref('')
    const radioPanel3 = ref('')

    const receivablesOnly = ref(false)
    const payablesOnly = ref(false)

    const storedTransactionTypes = computed(() => {
      return store.getters.getStoredTransactionTypes
    })

    /**
     * Computed
     */
    const labelReceivablesOnly = computed(() => {
      if (isEmptyValue(storedTransactionTypes.value)) {
        return ''
      }
      return storedTransactionTypes.value[ONLY_RECEIVABLES]
    })

    const labelPayablesOnly = computed(() => {
      if (isEmptyValue(storedTransactionTypes.value)) {
        return ''
      }
      return storedTransactionTypes.value[ONLY_PAYABLES]
    })

    const receivablesPayables = computed(() => {
      if (receivablesOnly.value && payablesOnly.value) {
        return RECEIVABLES_AND_PAYABLES
      }
      if (receivablesOnly.value) {
        return ONLY_RECEIVABLES
      }
      if (payablesOnly.value) {
        return ONLY_PAYABLES
      }
      return ''
    })

    // const businessPartner = computed(() => {
    //   return store.getters.getValueOfFieldOnContainer({
    //     parentUuid: '',
    //     containerUuid: '8e4268c8-fb40-11e8-a479-7a0060f0aa01',
    //     columnName: 'C_BPartner_ID'
    //   })
    // })

    const currentDate = computed({
      // getter
      get() {
        const { date } = store.getters.getSearchFilter
        return date
      },
      // setter
      set(date) {
        store.commit('updateAttributeCriteriaVallocation', {
          attribute: 'date',
          criteria: 'searchCriteria',
          value: date
        })
        // store.commit('setDate', date)
      }
    })

    const currentTypeTransaction = computed({
      // getter
      get() {
        const { transactionType } = store.getters.getSearchFilter
        return transactionType
      },
      // setter
      set(type) {
        store.commit('updateAttributeCriteriaVallocation', {
          attribute: 'transactionType',
          criteria: 'searchCriteria',
          value: type
        })
        // return store.commit('setTransactionType', type)
      }
    })

    const isMultiCurrency = computed(() => {
      const { isMultiCurrency } = store.getters.getSearchFilter
      return isMultiCurrency
    })

    function loadTransactonsTypes() {
      if (!isEmptyValue(storedTransactionTypes.value)) {
        return
      }
      store.dispatch('loadTransactonsTypesFromServer')
    }

    currentDate.value = new Date()

    /**
     * Wacht
     */
    watch(receivablesPayables, (newValue, oldValue) => {
      currentTypeTransaction.value = newValue
    })

    loadTransactonsTypes()

    return {
      storedTransactionTypes,
      // Refs
      receivablesOnly,
      payablesOnly,
      radioPanel2,
      radioPanel3,
      receivablesPayables,
      // List Option
      currentTypeTransaction,
      // Computed
      isMultiCurrency,
      labelReceivablesOnly,
      labelPayablesOnly,
      currentDate
    }
  }
})
</script>

<style lang="scss">
  .from-wf-panel {
    padding-top: 10px;
    padding-left: 20px;
    padding-right: 20px;
  }
  .el-input-number {
    .el-input--medium .el-input__inner {
      text-align: end;
    }
  }
  .panel-top-search-criteria {
    display: flex;
    .el-card__body {
      display: contents;
      padding-top: 0px !important;
      padding-right: 0px !important;
      padding-bottom: 2px !important;
      padding-left: 0px !important;
      height: 100%!important;
    }
  }
</style>
