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
      {{ $t('form.outBoundOrder.searchCriteria.panel.shipDate') }}
    </template>
    <el-date-picker
      v-model="value"
      unlink-panels
      :format="formatView"
    />
  </el-form-item>
</template>

<script>
import store from '@/store'

import { defineComponent, computed } from '@vue/composition-api'

// Components and Mixins
import EmptyOptionSelect from '@/components/ADempiere/FieldDefinition/FieldSelect/emptyOptionSelect.vue'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
export default defineComponent({
  name: 'ShipDateField',

  components: {
    EmptyOptionSelect
  },

  setup() {
    const value = computed({
      // getter
      get() {
        const { shipDate } = store.getters.getSearchFilterGenerateOrder
        return shipDate
      },
      // setter
      set(newValue) {
        store.commit('updateAttributeCriteriaGenerateOrder', {
          attribute: 'shipDate',
          value: newValue
        })
      }
    })
    const formatView = computed(() => {
      let format = ''
      const currentLanguageDefinition = store.getters['getCurrentLanguageDefinition']
      if (isEmptyValue(format)) {
        format = 'yyyy-MM-dd'
        if (!isEmptyValue(currentLanguageDefinition)) {
          const { datePattern } = currentLanguageDefinition
          if (!isEmptyValue(datePattern)) {
            format = datePattern
          }
        }
      }
      const formattedFormat = format
        .replace(/[Y]/gi, 'y')
        .replace(/[m]/gi, 'M')
        .replace(/[D]/gi, 'd')
      return formattedFormat
    })
    return {
      value,
      formatView
    }
  }
})
</script>
