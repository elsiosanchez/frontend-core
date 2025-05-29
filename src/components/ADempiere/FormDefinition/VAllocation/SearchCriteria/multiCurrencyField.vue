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
      {{ $t('form.VAllocation.searchCriteria.option.multiCurrency') }}
    </template>

    <el-switch
      v-model="isMultiCurrency"
      active-color="#13ce66"
      inactive-color="#ff4949"
    />
  </el-form-item>
</template>

<script>
import { computed, defineComponent } from '@vue/composition-api'

import store from '@/store'

export default defineComponent({
  name: 'multiCurrencyField',

  setup() {
    const isMultiCurrency = computed({
      // getter
      get() {
        const { isMultiCurrency } = store.getters.getSearchFilter
        return isMultiCurrency
      },
      // setter
      set(value) {
        store.commit('updateAttributeCriteriaVallocation', {
          attribute: 'isMultiCurrency',
          criteria: 'searchCriteria',
          value: value
        })
      }
    })

    return {
      // Computeds
      isMultiCurrency
    }
  }
})
</script>
