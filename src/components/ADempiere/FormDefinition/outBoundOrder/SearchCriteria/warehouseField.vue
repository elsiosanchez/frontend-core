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
      <span style="color: #f34b4b"> * </span>
      {{ $t('form.outBoundOrder.searchCriteria.warehouse') }}
    </template>
    <el-select
      v-model="value"
      clearable
      style="width: 100%;"
      filterable
      :default-first-option="true"
      remote
      :remote-method="remoteSearchCurrencies"
      :disabled="isEmptyValue(organization)"
      @visible-change="loadRecords"
    >
      <empty-option-select
        :current-value="value"
      />
      <el-option
        v-for="item in optionsList"
        :key="item.uuid"
        :label="item.label"
        :value="item.id"
      />
    </el-select>
  </el-form-item>
</template>

<script>
import store from '@/store'
import { defineComponent, computed, onMounted } from '@vue/composition-api'

// Components and Mixins
import EmptyOptionSelect from '@/components/ADempiere/FieldDefinition/FieldSelect/emptyOptionSelect.vue'
// API Request Methods
import {
  requestListWarehouses
} from '@/api/ADempiere/form/outBoundOrder.ts'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
export default defineComponent({
  name: 'OrganizationField',

  components: {
    EmptyOptionSelect
  },

  setup() {
    const sessionWarehouseId = computed(() => {
      const { id } = store.getters['user/getWarehouse']
      if (!isEmptyValue(id) && id > 0) {
        return id
      }
    })
    const value = computed({
      // getter
      get() {
        const { warehouseId } = store.getters.getSearchFilterGenerateOrder
        return warehouseId
      },
      // setter
      set(newValue) {
        store.commit('updateAttributeCriteriaGenerateOrder', {
          attribute: 'warehouseId',
          value: newValue
        })
      }
    })
    const organization = computed(() => {
      const { organizationId } = store.getters.getSearchFilterGenerateOrder
      if (isEmptyValue(organizationId)) return
      return organizationId
    })
    const optionsList = computed({
      get() {
        const { listWarehouse } = store.getters.getSearchFilterGenerateOrder
        if (!isEmptyValue(listWarehouse)) {
          if (listWarehouse.some(item => item.label === undefined)) {
            const listFormData = listWarehouse.map(item => {
              return {
                id: item.id,
                label: item.values.DisplayColumn,
                uuid: item.values.UUID
              }
            })
            return listFormData
          }
        }
        return listWarehouse
      },
      set(newValue) {
        store.commit('updateAttributeCriteriaGenerateOrder', {
          attribute: 'listWarehouse',
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
      requestListWarehouses({
        searchValue,
        organization_id: organization.value
      })
        .then(response => {
          const { records } = response
          optionsList.value = records
        })
    }
    onMounted(() => {
      loadRecords(true, '')
      if (!isEmptyValue(sessionWarehouseId.value)) {
        value.value = sessionWarehouseId.value
      }
    })
    return {
      // Computeds
      value,
      optionsList,
      organization,
      // Methods
      loadRecords,
      remoteSearchCurrencies
    }
  }
})
</script>
