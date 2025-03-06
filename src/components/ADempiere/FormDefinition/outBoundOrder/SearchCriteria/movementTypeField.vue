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
      {{ $t('form.outBoundOrder.searchCriteria.movementType') }}
      <el-switch
        v-model="value"
        inactive-color="#13ce66"
        :active-text="$t('form.outBoundOrder.searchCriteria.distributionOrder')"
        :active-value="MOVEMENT_TYPE_DISTRIBUTION_ORDER"
        :inactive-text="$t('form.outBoundOrder.searchCriteria.salesOrder')"
        :inactive-value="MOVEMENT_TYPE_SALES_ORDER"
        style="display: flex; justify-content: center; height: 30px;"
      />
    </template>
  </el-form-item>
</template>

<script>
import store from '@/store'
import { defineComponent, computed } from '@vue/composition-api'

// Components and Mixins
import EmptyOptionSelect from '@/components/ADempiere/FieldDefinition/FieldSelect/emptyOptionSelect.vue'

// Constants
import {
  MOVEMENT_TYPE_DISTRIBUTION_ORDER,
  MOVEMENT_TYPE_SALES_ORDER
} from '@/utils/ADempiere/dictionary/form/WOutBoundOrder'

export default defineComponent({
  name: 'MovementTypeField',

  components: {
    EmptyOptionSelect
  },
  setup() {
    const value = computed({
      // getter
      get() {
        const { movementTypeId } = store.getters.getSearchFilterGenerateOrder
        return movementTypeId
      },
      // setter
      set(newValue) {
        store.commit('updateAttributeCriteriaGenerateOrder', {
          attribute: 'movementTypeId',
          value: newValue
        })
        store.commit('updateAttributeCriteriaGenerateOrder', {
          attribute: 'documentTypeId',
          value: -1
        })
      }
    })

    return {
      value,
      MOVEMENT_TYPE_SALES_ORDER,
      MOVEMENT_TYPE_DISTRIBUTION_ORDER
    }
  }
})
</script>
