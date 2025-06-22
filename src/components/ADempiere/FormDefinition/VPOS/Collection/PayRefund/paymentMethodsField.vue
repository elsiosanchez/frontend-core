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
  >
    <el-select
      v-model="currentPaymentMethod"
      style="width: 100% !important;"
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
import { computed, defineComponent, onMounted, watch } from '@vue/composition-api'

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

  setup(props) {
    const typeOptions = computed(() => {
      return store.getters.getRefundAttributeField({
        attribute: 'typeOptions'
      })
    })

    const listPaymentMethods = computed(() => {
      const records = store.getters.getListPaymentMethods || []
      if (typeOptions.value === '2') {
        // To pay after
        return records.filter(paymentMethodItem => {
          return paymentMethodItem.is_allowed_to_refund_open
        })
      }
      return records.filter(paymentMethodItem => {
        return paymentMethodItem.is_allowed_to_refund
      })
    })

    const currentPaymentMethod = computed({
      get() {
        const paymentMethod = store.getters.getRefundAttributeField({
          attribute: 'paymentMethod'
        })
        if (paymentMethod) {
          return paymentMethod.id
        }
        return ''
      },
      // setter
      set(newPaymentMethodId) {
        let paymentMethod = {}
        if (newPaymentMethodId) {
          paymentMethod = listPaymentMethods.value.find(paymentMethodItem => {
            return paymentMethodItem.id === newPaymentMethodId
          })
        }
        store.commit('setRefundAttributeField', {
          attribute: 'paymentMethod',
          value: paymentMethod
        })
      }
    })

    watch(typeOptions, (newValue, oldValue) => {
      const records = listPaymentMethods.value

      store.commit('setRefundAttributeField', {
        attribute: 'paymentMethod',
        value: isEmptyValue(records) ? {} : records.at()
      })
    })

    onMounted(() => {
      if (isEmptyValue(listPaymentMethods.value)) {
        store.dispatch('availablePaymentMethods')
      }
    })

    return {
      currentPaymentMethod,
      listPaymentMethods,
      typeOptions
    }
  }
})
</script>
