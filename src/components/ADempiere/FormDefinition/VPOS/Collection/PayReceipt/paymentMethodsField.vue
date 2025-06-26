<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A.
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
  <el-form-item
    :label="$t('pointOfSales.collection.field.paymentMethods')"
    class="form-item-criteria"
    style="margin: 0px;width: 100%;"
    required
  >
    <el-select
      v-model="currentPaymentMethod"
      @change="handleChange"
    >
      <el-option
        v-for="item in listPaymentMethods"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      />
    </el-select>
  </el-form-item>
</template>

<script>
import { computed, defineComponent, onMounted } from '@vue/composition-api'

import store from '@/store'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'PaymentMethodsField',

  props: {
    handleChange: {
      type: Function,
      default: (changeValue) => {
        console.info('Triggers when input value changes (value: string | number)', changeValue)
      }
    }
  },

  setup() {
    const listPaymentMethods = computed(() => {
      return store.getters.getListPaymentMethods
    })

    const currentPaymentMethod = computed({
      get() {
        return store.getters.getPaymentMethod.id
      },
      // setter
      set(newPaymentMethodId) {
        let paymentMethod = {}
        if (newPaymentMethodId) {
          paymentMethod = listPaymentMethods.value.find(paymentMethodItem => {
            return paymentMethodItem.id === newPaymentMethodId
          })
        }
        store.commit('setPaymentMethod', paymentMethod)
      }
    })

    onMounted(() => {
      // TODO: Add support to load with POS ID
      if (isEmptyValue(listPaymentMethods.value)) {
        store.dispatch('availablePaymentMethods')
      }
    })

    return {
      currentPaymentMethod,
      listPaymentMethods
    }
  }
})
</script>
