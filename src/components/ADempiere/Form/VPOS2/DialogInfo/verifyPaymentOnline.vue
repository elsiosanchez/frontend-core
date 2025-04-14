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
  <el-row>
    <p style="text-align: center;font-size: 35px;font-weight: 900;">
      <i class="el-icon-loading" />
    </p>
    <el-row :gutter="10">
      <el-col
        v-for="(payment, key) in listPayments"
        :key="key"
        :span="12"
        style="margin: 10px 0px;"
      >
        <card-payments
          :payment="payment"
          :readonly="true"
        />
      </el-col>
    </el-row>
    <el-col
      :span="24"
      style="margin-top: 0px;"
      class="border-info"
    >
      <p class="line-info">
        <b
          style="float: left"
        >
          {{ $t('form.pos.collect.orderTotal') }} {{ '(' + currentOrder.document_no + ')' }}:
        </b>
        <b style="float: right">
          {{ displayAmount(currentOrder.grand_total) }}
        </b>
      </p>
      <p class="line-info">
        <b
          style="float: left"
        >
          {{ $t('form.pos.collect.convertedAmount') }}:
        </b>
        <b style="float: right">
          {{ formatPrice({ value: currentOrder.grand_total_converted, currency: displayCurrency.iso_code}) }}
        </b>
      </p>
    </el-col>
    <el-dialog
      :visible.sync="isShowCancele"
      :modal="false"
    >
      <p
        slot="title"
        class="dialog-label-info-cancele"
      >
        <b>
          {{ $t('form.pos.collect.onlinePayment.cancelPayment.title') }}
        </b>
      </p>
      <el-result
        icon="error"
        :title="$t('form.pos.collect.onlinePayment.cancelPayment.description')"
        class="result-cancelet-payment"
      >
        <template slot="extra" style="width: 100% !important;">
          <card-payments
            v-if="!isEmptyValue(currentPaymentVerifications)"
            :payment="currentPaymentVerifications"
            :readonly="true"
          />
        </template>
      </el-result>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="danger"
          icon="el-icon-close"
          class="button-base-icon"
          @click="isShowCancele = false"
        />
        <el-button
          type="primary"
          icon="el-icon-check"
          class="button-base-icon"
          :loading="isLoadingDone"
          :disabled="isDisabledDone"
          @click="isShowCancele = false"
        />
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
import {
  defineComponent,
  computed
} from '@vue/composition-api'

import store from '@/store'
// Utils and Helper Methods
import { formatPrice } from '@/utils/ADempiere/formatValue/numberFormat'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import CardPayments from '@/components/ADempiere/Form/VPOS2/Collection/Payments/CardPayments.vue'

export default defineComponent({
  name: 'InfoCollection',
  components: {
    CardPayments
  },
  setup() {
    const currentOrder = computed(() => {
      return store.getters.getCurrentOrder
    })

    const isShowCancele = computed({
      get() {
        return store.getters.getAttributePaymentVerification({
          attribute: 'isShowCancele'
        })
      },
      // setter
      set(value) {
        store.commit('setAttributePaymentVerification', {
          attribute: 'isShowCancele',
          value
        })
      }
    })

    const listPayments = computed(() => {
      return store.getters.getListPayments
    })

    const currentPaymentVerifications = computed(() => {
      const paymentVerifications = listPayments.value.filter(payment => !payment.is_processing && !payment.is_processed && payment.tender_type_code === 'D')
      paymentVerifications.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
      return paymentVerifications.length > 0 ? paymentVerifications[0] : {}
    })

    const displayCurrency = computed(() => {
      const currency = store.getters.getVPOS.display_currency
      if (currency) return currency
      return {
        iso_code: ''
      }
    })

    const dayRate = computed(() => {
      const rate = store.getters.getRate({ date: currentOrder.value.date_ordered })
      if (isEmptyValue(rate.multiply_rate)) return displayAmount(0.00)
      const {
        multiply_rate,
        divide_rate,
        currency_to
      } = rate
      if (multiply_rate.value > divide_rate.value) return formatPrice({ value: multiply_rate, currency: currency_to.iso_code })
      return formatPrice({ value: divide_rate, currency: currency_to.iso_code })
    })

    function displayAmount(amount) {
      const { price_list } = currentOrder.value
      if (isEmptyValue(price_list)) return amount
      return formatPrice({ value: amount, currency: price_list.currency.iso_code })
    }

    return {
      dayRate,
      currentOrder,
      listPayments,
      isShowCancele,
      displayCurrency,
      currentPaymentVerifications,
      formatPrice,
      displayAmount
    }
  }
})
</script>

<style lang="scss">
.border-info {
  border: 1px solid rgb(54, 163, 247);
  border-radius: 5px;
  margin: 0px;
  padding: 0px 5px;
}
.line-info {
  width: 100%;
  display: flow-root;
  margin: 10px 0px;
}
.dialog-label-info-cancele {
  text-align: center;
  font-size: x-large;
  margin: 0px;
}
.result-cancelet-payment {
  .el-result__extra {
    width: 100% !important;
  }
}
</style>
