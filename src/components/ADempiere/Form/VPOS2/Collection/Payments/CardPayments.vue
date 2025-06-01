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
  <el-card shadow="never" :body-style="{ padding: '5px', borderRadius:' 10px' }">
    <el-row v-if="!isEmptyValue(payment)" :class="statusPayment(payment)">
      <el-col :span="7">
        <el-image
          :src="imageCard(payment)"
          fit="contain"
          style="width: 85px; height: 90px"
        />
      </el-col>
      <el-col
        :span="17"
        style="display: grid;"
      >
        <p style="margin: 5px 0px;">
          <el-button
            v-if="isDelete(payment, !readonly)"
            type="text"
            icon="el-icon-close"
            style="float: right;color: red;padding: 0px;font-size: 18px;"
            :disabled="isLoading"
            :loading="isLoading"
            @click="remove(payment)"
          />
          <el-button
            v-if="payment.is_online && showDetails"
            type="text"
            style="float: right;padding: 0px;font-size: 18px;"
            @click="seeDetail(payment)"
          >
            <svg-icon
              icon-class="status-payment"
            />
          </el-button>
        </p>
        <p style="margin: 1px 0px;">
          <b>
            <span style="float: left;">
              {{ labelPaymentMethods(payment) }}
            </span>
            <span style="font-size: 14px;float: right;padding-right: 5px;">
              {{ payment.document_no }}
            </span>
          </b>
        </p>
        <p style="margin: 1px 0px;font-size: 14px;">
          {{ formatDate(payment.payment_date) }}
        </p>
        <p style="margin: 1px 0px;font-size: 16px;text-align: end;padding-right: 5px;">
          <b>
            {{ formatPrice({ value: payment.amount, currency: displayCurrency({ isConver: true, currencyConvert: payment.currency }) }) }}
          </b>
          <br>
          <b>
            {{ formatPrice({ value: payment.converted_amount, currency: displayCurrency({ currencyConvert: payment.currency }) }) }}
          </b>
        </p>
      </el-col>
    </el-row>
    <!-- Cancel Payment Online -->
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
          {{ $t('form.pos.collect.onlinePayment.cancelPayment.deletePayment') }}
        </b>
      </p>
      <span v-if="!isLoadingCancele">
        <el-result
          icon="error"
          :title="getInfoOnline.message"
          class="result-cancelet-payment"
        />
      </span>
      <el-result v-else class="result-cancelet-info">
        <template slot="icon">
          <i class="el-icon-loading" style="font-size: 45px;font-weight: 900;" />
        </template>
      </el-result>
      <span v-if="!isLoadingCancele" slot="footer" class="dialog-footer">
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
          v-if="getInfoOnline.status === 'W'"
          type="warning"
          class="button-base-icon"
          @click="cancelPayment(payment)"
        >
          <svg-icon
            icon-class="warning"
          />
          <b style="font-size: 18px !important">
            {{ $t('form.pos.collect.onlinePayment.cancelPayment.title') }}
          </b>
        </el-button>
        <el-button
          v-else-if="getInfoOnline.status === 'R' || getInfoOnline.status === 'E'"
          type="danger"
          class="button-base-icon"
          @click="cancelPayment(payment)"
        >
          <svg-icon
            icon-class="delete"
          />
          <b style="font-size: 18px !important">
            {{ $t('form.pos.collect.onlinePayment.cancelPayment.deletePayment') }}
          </b>
        </el-button>
        <el-button
          v-else-if="getInfoOnline.status === 'A'"
          type="danger"
          class="button-base-icon"
          @click="cancelPayment(payment)"
        >
          <svg-icon
            icon-class="delete"
          />
          <b style="font-size: 18px !important">
            {{ $t('form.pos.collect.onlinePayment.cancelPayment.voidTransaction') }}
          </b>
        </el-button>
      </span>
    </el-dialog>
    <!-- Info Payment Online -->
    <el-dialog
      :visible.sync="infoPayment.show"
      width="60%"
      :modal="false"
    >
      <verify-payment-online />
      <span slot="footer" class="dialog-footer">
        <el-button
          type="info"
          class="button-base-icon"
          @click="infoPayment.show = false"
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
          v-if="getInfoOnline.status === 'W'"
          type="warning"
          class="button-base-icon"
          :loading="infoPayment.loading"
          @click="cancelPayment(payment)"
        >
          <svg-icon
            icon-class="warning"
          />
          <b style="font-size: 18px !important">
            {{ $t('form.pos.collect.onlinePayment.cancelPayment.title') }}
          </b>
        </el-button>
        <el-button
          v-else-if="getInfoOnline.status === 'R' || getInfoOnline.status === 'E'"
          type="danger"
          class="button-base-icon"
          @click="cancelPayment(payment)"
        >
          <svg-icon
            icon-class="delete"
          />
          <b style="font-size: 18px !important">
            {{ $t('form.pos.collect.onlinePayment.cancelPayment.deletePayment') }}
          </b>
        </el-button>
        <el-button
          v-if="getInfoOnline.status === 'R' || getInfoOnline.status === 'E'"
          type="primary"
          class="button-base-icon"
          :loading="infoPayment.loading"
          @click="returnSend(payment)"
        >
          <svg-icon
            icon-class="return-send"
          />
          <b style="font-size: 18px !important">
            {{ $t('form.pos.collect.onlinePayment.cancelPayment.sendAgain') }}
          </b>
        </el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import {
  defineComponent,
  computed,
  ref
} from '@vue/composition-api'

import store from '@/store'
import verifyPaymentOnline from '@/components/ADempiere/Form/VPOS2/DialogInfo/verifyPaymentOnline.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { formatDate } from '@/utils/ADempiere/valueFormat.js'
import { formatPrice } from '@/utils/ADempiere/formatValue/numberFormat'

export default defineComponent({
  name: 'CardPayments',
  components: {
    verifyPaymentOnline
  },
  props: {
    payment: {
      type: Object,
      default: {}
    },
    readonly: {
      type: Boolean,
      default: false
    },
    deletePayment: {
      type: Function,
      default: (payment) => {}
    },
    isDeletePaymentMethods: {
      type: Boolean,
      default: false
    },
    showDetails: {
      type: Boolean,
      default: true
    }
  },

  setup(props) {
    const isLoading = ref(false)
    const isLoadingCancele = ref(false)
    const infoPayment = ref({
      icon: 'info',
      show: false,
      loading: false,
      message: '',
      status: ''
    })
    const isShowCancele = ref(false)
    const currentOrder = computed(() => {
      return store.getters.getCurrentOrder
    })

    const currentPaymentVerifications = computed(() => {
      return store.getters.getPaymentOnline
    })

    const getInfoOnline = computed(() => {
      return store.getters.getCurrentPayment({ paymentId: currentPaymentVerifications.value.id })
    })

    function displayCurrency({
      isConver = false,
      currencyConvert
    }) {
      if (!isConver) {
        const { price_list } = currentOrder.value
        if (!isEmptyValue(price_list)) return price_list.currency.iso_code
        return ''
      }
      if (isEmptyValue(currencyConvert)) return ''
      return currencyConvert.iso_code
    }

    function remove(payment) {
      if (payment.is_online) {
        isLoadingCancele.value = true
        store.dispatch('infoOnlinePayment', {
          paymentId: payment.id
        })
          .finally(() => {
            isLoadingCancele.value = false
          })
        store.commit('setPaymentOnline', payment)
        isShowCancele.value = true
        return
      }
      if (props.isDeletePaymentMethods) {
        isLoading.value = true
        props.deletePayment(payment)
        setTimeout(() => {
          isLoading.value = false
        }, 1000)
        return payment
      }
      const { id } = payment
      isLoading.value = true
      store.dispatch('removePayment', {
        payment_id: id
      })
        .finally(() => {
          isLoading.value = false
        })
      return payment
    }

    function imageCard(payment) {
      const {
        tender_type_code
      } = payment
      let image
      switch (tender_type_code) {
        case 'D':
          image = 'MobilePayment.jpg'
          break
        case 'P':
          image = 'Mobile.jpg'
          break
        case 'X':
          image = 'Cash.jpg'
          break
        case 'A':
          image = 'ACH.jpg'
          break
        case 'M':
          image = 'GiftCard.jpg'
          break
        case 'Z':
          image = 'Zelle.jpg'
          break
        default:
          image = 'Default.jpg'
          break
      }
      return require('@/image/ADempiere/pos/typePayment/' + image)
    }

    function labelPaymentMethods(payment) {
      const { payment_method } = payment
      if (!isEmptyValue(payment_method)) {
        return payment_method.name
      }
      return ''
    }

    function statusPayment(payments) {
      const {
        response_status,
        is_processing,
        is_processed,
        is_online
      } = payments
      if (is_online) {
        if (isEmptyValue(response_status) || response_status === 'E') return 'card-payment-error'
        if (response_status === 'W') return 'card-payment-warning'
      }
      if (is_processing || is_processed) return 'card-payment-process'
      return 'card-payment-success'
    }

    function isDelete(payment, isReadOnly) {
      if (payment.is_online) {
        if (payment.response_status === 'O') return false
      }
      return isReadOnly
    }

    function cancelPayment(payment) {
      store.dispatch('cancelOnline', {
        payment
      })
        .then(response => {
          if (response.is_error) return
          if (props.isDeletePaymentMethods) {
            isLoading.value = true
            props.deletePayment(payment)
            setTimeout(() => {
              isLoading.value = false
            }, 1000)
            return payment
          }
          const { id } = payment
          isLoading.value = true
          store.dispatch('removePayment', {
            payment_id: id
          })
            .finally(() => {
              isLoading.value = false
            })
          return payment
        })
    }

    function seeDetail(payment) {
      store.commit('setPaymentOnline', payment)
      const { id, response_status, response_message } = payment
      infoPayment.value.show = true
      infoPayment.value.loading = true
      store.commit('setAttributePaymentVerification', {
        attribute: 'isShowCancele',
        value: false
      })
      store.commit('setCurrentPayment', {
        paymentId: id,
        infoPayment: {
          status: response_status,
          message: response_message,
          error: false,
          time: 3
        }
      })
      store.dispatch('infoOnlinePayment', {
        paymentId: id
      })
        .finally(() => {
          infoPayment.value.loading = false
        })
    }

    function returnSend(payment) {
      store.dispatch('verifyPaymentOnline', {
        payment
      })
        .then(() => {
          infoPayment.value.show = false
        })
    }

    return {
      isLoading,
      infoPayment,
      currentOrder,
      isShowCancele,
      getInfoOnline,
      isLoadingCancele,
      remove,
      isDelete,
      seeDetail,
      imageCard,
      returnSend,
      formatDate,
      formatPrice,
      cancelPayment,
      statusPayment,
      displayCurrency,
      labelPaymentMethods
    }
  }
})
</script>

<style lang="scss" scoped>
.card-payment-success {
  border-left: 5px solid #13ce66;
  border-radius: 10px;
}
.card-payment-process {
  border-left: 5px solid #b9c3d6;
  border-radius: 10px;
}
.card-payment-error {
  border-left: 5px solid #ff4949;
  border-radius: 10px;
}

.card-payment-warning {
  border-left: 5px solid #FFB900;
  border-radius: 10px;
}
.dialog-label-info-cancele {
  text-align: center;
  font-size: x-large;
  margin: 0px;
}
</style>
