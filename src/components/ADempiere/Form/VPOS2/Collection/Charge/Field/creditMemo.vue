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
    :label="$t('pointOfSales.collection.creditMemo')"
    class="form-item-criteria"
    style="margin: 0px;width: 100%;"
  >
    <el-select
      v-model="creditMemo"
      filterable
      clearable
      @visible-change="findCreditMemo"
    >
      <el-option
        v-for="item in listCustomerCredits"
        :key="item.id"
        :label="item.displayValue"
        :value="item.id"
      />
    </el-select>
  </el-form-item>
</template>

<script>
import { computed, defineComponent, watch } from '@vue/composition-api'

import store from '@/store'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
import { convertToNumber } from '@/utils/ADempiere/formatValue/numberFormat'

export default defineComponent({
  name: 'CreditMemo',

  props: {
    isRefund: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const currentOrder = computed(() => {
      return store.getters.getCurrentOrder
    })

    const listCustomerCredits = computed(() => {
      return store.getters.getAttributeField({
        field: 'customerCredits',
        attribute: 'list'
      })
    })

    const creditMemo = computed({
      get() {
        const currentAccount = store.getters.getAttributeField({
          field: 'customerCredits',
          attribute: 'currentCustomerCredist'
        })
        if (currentAccount) {
          return currentAccount.id
        }
        return ''
      },
      // setter
      set(creditMemo) {
        let currentCredit
        if (!isEmptyValue(creditMemo)) {
          currentCredit = listCustomerCredits.value.find(list => list.id === creditMemo)
        }
        store.commit('setAttributeField', {
          field: 'customerCredits',
          attribute: 'currentCustomerCredist',
          value: currentCredit
        })
      }
    })

    function findCreditMemo(show) {
      if (!show) {
        return
      }
      store.dispatch('listCustomerCreditsMemo')
    }

    function setData(creditMemo) {
      let orderOpenAmount = 0
      if (!isEmptyValue(currentOrder.value)) {
        orderOpenAmount = convertToNumber(
          currentOrder.value.open_amount
        )
      }
      let payableAmount = orderOpenAmount
      if (orderOpenAmount <= creditMemo.openAmountCast) {
        payableAmount = orderOpenAmount
      } else {
        payableAmount = creditMemo.openAmountCast
      }
      store.commit('setPayAmount', payableAmount)

      store.commit('setAttributeField', {
        field: 'field',
        attribute: 'referenceNo',
        value: creditMemo.document_no
      })
      store.commit('setAttributeField', {
        field: 'field',
        attribute: 'description',
        value: creditMemo.description
      })
      store.commit('setAttributeField', {
        field: 'field',
        attribute: 'date',
        value: creditMemo.document_date
      })
      store.commit('setAttributeField', {
        field: 'field',
        attribute: 'creditMemoId',
        value: creditMemo.id
      })
    }

    function clearData(value = undefined) {
      store.commit('setAttributeField', {
        field: 'field',
        attribute: 'referenceNo',
        value
      })
      store.commit('setPayAmount', value)
      store.commit('setAttributeField', {
        field: 'field',
        attribute: 'description',
        value
      })
      store.commit('setAttributeField', {
        field: 'field',
        attribute: 'date',
        value
      })
      store.commit('setAttributeField', {
        field: 'field',
        attribute: 'creditMemoId',
        value
      })
    }

    watch(creditMemo, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        const creditMemo = listCustomerCredits.value.find(list => list.id === newValue)
        if (isEmptyValue(creditMemo)) {
          clearData()
        } else {
          setData(creditMemo)
        }
      }
    })

    return {
      creditMemo,
      listCustomerCredits,
      findCreditMemo,
      setData
    }
  }
})
</script>
