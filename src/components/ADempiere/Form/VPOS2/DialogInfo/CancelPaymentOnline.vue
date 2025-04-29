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
    <el-result :title="$t('Cancelar Pago')" class="result-cancelet-info">
      <template slot="icon">
        <i class="el-icon-loading" style="font-size: 45px;font-weight: 900;" />
      </template>
      <template slot="extra">
        <card-payments
          v-if="!isEmptyValue(currentPaymentVerifications)"
          :payment="currentPaymentVerifications"
          :readonly="true"
        />
      </template>
    </el-result>
    <el-result
      icon="error"
      :title="$t('form.pos.collect.onlinePayment.cancelPayment.description')"
      class="result-cancelet-payment"
    />
    <span slot="footer" class="dialog-footer">
      <el-button
        type="info"
        class="button-base-icon"
        @click="isShowCancele = false"
      >
        <svg-icon
          icon-class="exit"
          style="transform: scaleX(-1) !important;"
        />
        <b style="font-size: 18px !important">
          {{ $t('form.pos.collect.onlinePayment.cancelPayment.undo') }}
        </b>
      </el-button>
      <el-button
        type="warning"
        class="button-base-icon"
        @click="cancelPayment"
      >
        <svg-icon
          icon-class="warning"
        />
        <b style="font-size: 18px !important">
          {{ $t('form.pos.collect.onlinePayment.cancelPayment.title') }}
        </b>
      </el-button>
    </span>
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

    const listPaymentMethods = computed(() => {
      return store.getters.getListPaymentMethods
    })

    const listPayments = computed(() => {
      return store.getters.getListPayments
    })

    const currentPaymentVerifications = computed(() => {
      return currentPaymenOnline()
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

    function cancelPayment() {
      store.dispatch('cancelOnline', {
        payment: currentPaymentVerifications.value
      })
        .then(() => {
          store.commit('setShowedModalDialogVPOS', {
            isShowed: false
          })
        })
    }

    function currentPaymenOnline() {
      const onlineTenderTypes = new Set(
        listPaymentMethods.value
          .filter(method => method.is_online)
          .map(method => method.payment_method.tender_type)
      )

      return listPayments.value
        .filter(payment => onlineTenderTypes.has(payment.payment_method.tender_type))
        .pop()
    }

    function InfoOnlinePayment() {
      if (!isEmptyValue(currentPaymentVerifications.value)) {
        store.dispatch('infoOnlinePayment', {
          paymentId: currentPaymentVerifications.value.id
        })
      }
    }

    setTimeout(() => {
      InfoOnlinePayment()
    }, 500)

    return {
      dayRate,
      listPayments,
      currentOrder,
      isShowCancele,
      displayCurrency,
      listPaymentMethods,
      currentPaymentVerifications,
      formatPrice,
      cancelPayment,
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
.result-cancelet-info {
  .el-result__extra {
    width: 60% !important;
  }
}
</style>
