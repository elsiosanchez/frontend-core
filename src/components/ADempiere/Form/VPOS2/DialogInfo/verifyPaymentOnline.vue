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

    <card-payments
      :payment="currentPaymentVerifications"
      :readonly="true"
      :show-details="false"
    />
    <el-result v-if="isError" :title="message" icon="error" class="result-cancelet-info">
      <template slot="extra">
        <!-- <card-payments
          v-if="!isEmptyValue(currentPaymentVerifications)"
          :payment="currentPaymentVerifications"
          :readonly="true"
          :show-details="false"
        /> -->
      </template>
    </el-result>
    <el-result v-else-if="statusPayment === 'A'" :title="message" icon="error" class="result-cancelet-info">
      <template slot="extra">
        <!-- <card-payments
          v-if="!isEmptyValue(currentPaymentVerifications)"
          :payment="currentPaymentVerifications"
          :readonly="true"
          :show-details="false"
        /> -->
      </template>
    </el-result>
    <el-result v-else :title="message" class="result-cancelet-info">
      <template slot="icon">
        <i class="el-icon-loading" style="font-size: 45px;font-weight: 900;" />
      </template>
      <template slot="extra">
        <!-- <card-payments
          v-if="!isEmptyValue(currentPaymentVerifications)"
          :payment="currentPaymentVerifications"
          :readonly="true"
          :show-details="false"
        /> -->
      </template>
    </el-result>
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
      width="60%"
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
    </el-dialog>
    <el-dialog
      :visible.sync="isPanelError"
      :modal="false"
      width="30%"
    >
      <p
        slot="title"
        class="dialog-label-info-cancele"
      >
        <b>
          {{ 'Error' }}
        </b>
      </p>
      <el-result icon="error" :title="message">
        <template slot="extra">
          <el-button type="primary" size="medium" @click="returnToSend()">Volver a Enviar</el-button>
        </template>
      </el-result>
    </el-dialog>
  </el-row>
</template>

<script>
import {
  defineComponent,
  computed,
  watch,
  ref
} from '@vue/composition-api'

import store from '@/store'
import lang from '@/lang'
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
    // Ref
    const isPanelError = ref(false)
    const isPanelSuccess = ref(false)
    // Computed
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

    const getInfoOnline = computed(() => {
      return store.getters.getOnline
    })

    const message = computed(() => {
      if (!isEmptyValue(getInfoOnline.value.message)) return getInfoOnline.value.message
      return lang.t('form.pos.collect.onlinePayment.title')
    })

    const isError = computed(() => {
      return getInfoOnline.value.error
    })

    const statusPayment = computed(() => {
      return getInfoOnline.value.status
    })

    const nextRequestTime = computed(() => {
      if (
        !isEmptyValue(getInfoOnline.value.time) &&
        getInfoOnline.value.time <= 0
      ) {
        return getInfoOnline.value.time * 1000
      }
      return 3000
    })

    // Methods
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
      store.dispatch('infoOnlinePayment', {
        paymentId: currentPaymentVerifications.value.id
      })
        .finally(() => {
          if (getInfoOnline.value.error) return
          loadInfoOnline()
        })
    }

    function loadInfoOnline() {
      setTimeout(() => {
        if (statusPayment.value === 'W') {
          InfoOnlinePayment()
        }
      }, nextRequestTime.value)
    }

    function returnToSend() {
      isPanelError.value = false
      store.dispatch('processOnline', {
        payment: currentPaymentVerifications.value
      })
        .finally(() => {
          setTimeout(() => {
            InfoOnlinePayment()
          }, 4000)
        })
    }

    loadInfoOnline()

    /**
     * Watch - watch works directly on a ref
     * @param newValue - New Assessed Property value
     * @param oldValue - Old Assessed Property value
     */
    watch(isError, (newValue, oldValue) => {
      if (newValue) {
        isPanelError.value = newValue
      }
    })

    return {
      // Ref
      isPanelError,
      isPanelSuccess,
      // Computed
      message,
      isError,
      listPayments,
      currentOrder,
      isShowCancele,
      getInfoOnline,
      nextRequestTime,
      displayCurrency,
      listPaymentMethods,
      statusPayment,
      currentPaymentVerifications,
      // Methods
      formatPrice,
      cancelPayment,
      displayAmount,
      returnToSend
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
