<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Ricardo Fenomeno ricardofenomeno13@gmail.com https://github.com/ricargame
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
  >
    <template slot="label">
      {{ $t('form.outBoundOrder.searchCriteria.deliveryRule') }}
    </template>
    <el-select
      v-model="value"
      clearable
      style="width: 100%;"
      filterable
      :default-first-option="true"
      remote
      :remote-method="remoteSearchCurrencies"
      @visible-change="loadRecords"
    >
      <empty-option-select
        :current-value="value"
      />
      <el-option
        v-for="(item, index) in optionsList"
        :key="index"
        :label="item.label"
        :value="item.id"
      />
    </el-select>
  </el-form-item>
</template>

<script>
import store from '@/store'
import { defineComponent, computed } from '@vue/composition-api'

// Components and Mixins
import EmptyOptionSelect from '@/components/ADempiere/FieldDefinition/FieldSelect/emptyOptionSelect.vue'

// API Request Methods
import {
  requestListDeliveryRules
} from '@/api/ADempiere/form/outBoundOrder.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'DeliveryRuleField',

  components: {
    EmptyOptionSelect
  },

  setup() {
    const value = computed({
      // getter
      get() {
        const { deliveryRuleId } = store.getters.getSearchFilterGenerateOrder
        return deliveryRuleId
      },
      // setter
      set(newValue) {
        store.commit('updateAttributeCriteriaGenerateOrder', {
          attribute: 'deliveryRuleId',
          value: newValue
        })
      }
    })

    const optionsList = computed({
      get() {
        const { listDeliveryRule } = store.getters.getSearchFilterGenerateOrder
        if (!isEmptyValue(listDeliveryRule)) {
          return listDeliveryRule
        }
        return []
      },
      set(newValue) {
        store.commit('updateAttributeCriteriaGenerateOrder', {
          attribute: 'listDeliveryRule',
          value: newValue
        })
      }
    })

    function remoteSearchCurrencies(searchValue) {
      loadRecords(true, searchValue)
    }

    function loadRecords(isFind, searchValue) {
      if (!isFind) {
        return
      }
      requestListDeliveryRules({
        searchValue
      })
        .then(response => {
          const { records } = response
          optionsList.value = records.map(item => {
            return {
              id: item.id,
              label: item.values.DisplayColumn,
              uuid: item.values.UUID
            }
          })
        })
    }

    return {
      // Computeds
      value,
      optionsList,
      // Methods
      loadRecords,
      remoteSearchCurrencies
    }
  }
})
</script>
