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
    required
  >
    <template slot="label">
      {{ $t('form.outBoundOrder.process.car') }}
    </template>

    <el-select
      v-model="value"
      clearable
      style="width: 100%;"
      filterable
      :default-first-option="true"
      remote
      :disabled="isEmptyValue(shipper)"
      :remote-method="remoteSearchCurrencies"
      @visible-change="loadRecords"
    >
      <empty-option-select
        :current-value="value"
        :is-allows-zero="false"
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
  requestListVehicles
} from '@/api/ADempiere/form/outBoundOrder.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'VehiclesField',

  components: {
    EmptyOptionSelect
  },

  setup() {
    const value = computed({
      // getter
      get() {
        const { vehiclesId } = store.getters.getSearchFilterGenerateOrder
        return vehiclesId
      },
      // setter
      set(newValue) {
        store.commit('updateAttributeCriteriaGenerateOrder', {
          attribute: 'vehiclesId',
          value: newValue
        })
      }
    })

    const shipper = computed(() => {
      const { shipperId } = store.getters.getSearchFilterGenerateOrder
      if (isEmptyValue(shipperId) || shipperId <= 0) {
        return -1
      }
      return shipperId
    })

    const optionsList = computed({
      get() {
        const { listVehicles } = store.getters.getSearchFilterGenerateOrder
        if (!isEmptyValue(listVehicles)) {
          return listVehicles
        }
        return []
      },
      set(newValue) {
        store.commit('updateAttributeCriteriaGenerateOrder', {
          attribute: 'listVehicles',
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
      requestListVehicles({
        searchValue,
        shipper_id: shipper.value
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
      shipper,
      // Methods
      loadRecords,
      remoteSearchCurrencies
    }
  }
})
</script>
