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
  <el-card
    shadow="never"
    :body-style="{ padding: '0px' }"
  >
    <p class="context-gifd-card">
      <el-result
        :sub-title="contentText"
        style="padding: 0px !important;"
      >
        <template
          slot="icon"
        >
          <span v-if="isEmptyValue(currentGiftCard)">
            <el-image
              src="https://www.svgviewer.dev/static-svgs/374573/scan-qr.svg"
              fit="contain"
              class="result-image"
            />
            <p>
              {{ $t('form.pos.optionsPoinSales.salesOrder.giftCardPlaceholder') }}
            </p>
            <el-input
              ref="giftCardSearchCode"
              v-model="code"
              :autofocus="true"
              :clearable="true"
              :disabled="isLoading"
              class="code-input"
              :placeholder="$t('form.pos.optionsPoinSales.salesOrder.giftCardSearchCode')"
              @input="searchGiftCard"
            >
              <svg-icon
                v-if="!isLoading"
                slot="suffix"
                icon-class="qr"
                class="result-input"
              />
              <i
                v-else
                slot="suffix"
                class="el-icon-loading"
                style="font-size: 20px;padding-top: 10px;"
              />
            </el-input>
          </span>
          <el-card
            v-else
            shadow="never"
            :body-style="{ padding: '10px', width: '100% !important' }"
          >
            <el-empty v-if="isEmptyValue(currentGiftCard.gift_card_lines)" :image-size="800" :description="$t('form.pos.optionsPoinSales.salesOrder.giftCardwithoutLines')" />
            <el-row v-else :gutter="20">
              <el-card
                shadow="never"
                :body-style="{ padding: '10px 0px', width: '100% !important' }"
              >
                <p style="text-align: center;font-size: 19px;margin: 0px;"><b> Productos </b></p>
                <br>
                <el-col
                  v-for="(line, key) in currentGiftCard.gift_card_lines"
                  :key="key"
                  :span="spanSize(currentGiftCard.gift_card_lines)"
                >
                  <el-descriptions
                    class="margin-top"
                    :border="true"
                    :column="1"
                  >
                    <el-descriptions-item
                      label-class-name="label-table-gift-card"
                      :content-style="{'text-align': 'center'}"
                    >
                      <template slot="label">
                        <i class="el-icon-box" />
                        {{ $t('form.productInfo.product') }}
                      </template>
                      {{ line.product.name }}
                    </el-descriptions-item>
                    <el-descriptions-item
                      label-class-name="label-table-gift-card"
                      content-class-name="content-table-number-gift-card"
                    >
                      <template slot="label">
                        <svg-icon
                          icon-class="inventory"
                        />
                        {{ $t('pointOfSales.keyLayout.quantity') }}
                      </template>
                      {{ formatQuantity({ value: line.quantity_entered }) }}
                    </el-descriptions-item>
                    <el-descriptions-item
                      label-class-name="label-table-gift-card"
                      content-class-name="content-table-number-gift-card"
                    >
                      <template slot="label">
                        <svg-icon
                          icon-class="payments"
                        />
                        {{ $t('form.pos.collect.amount') }}
                      </template>
                      {{ formatPrice({ value: line.amount, currency: currentGiftCard.currency.iso_code}) }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-col>
              </el-card>
            </el-row>
            <br>
            <el-card
              v-if="!isEmptyValue(currentGiftCard)"
              shadow="never"
              :body-style="{ padding: '10px', width: '100% !important' }"
            >
              <el-descriptions
                class="margin-top"
                title="Tarjeta de Regalo"
                :border="true"
                :column="1"
              >
                <el-descriptions-item
                  label-class-name="label-table-gift-card"
                  :content-style="{'text-align': 'center'}"
                >
                  <template slot="label">
                    <i class="el-icon-s-order" />
                    {{ $t('form.pos.optionsPoinSales.salesOrder.documentNo') }}
                  </template>
                  {{ currentGiftCard.document_no }}
                </el-descriptions-item>
                <el-descriptions-item
                  label-class-name="label-table-gift-card"
                  :content-style="{'text-align': 'center'}"
                >
                  <template slot="label">
                    <svg-icon
                      icon-class="b-partner"
                    />
                    {{ $t('form.pos.optionsPoinSales.salesOrder.businessPartner') }}
                  </template>
                  {{ currentGiftCard.business_partner.name }}
                </el-descriptions-item>
                <el-descriptions-item
                  label-class-name="label-table-gift-card"
                  content-class-name="content-table-number-gift-card"
                >
                  <template slot="label">
                    <svg-icon
                      icon-class="inventory"
                    />
                    {{ $t('form.pos.order.numberLines') }}
                  </template>
                  {{ formatQuantity({ value: currentGiftCard.gift_card_lines.length }) }}
                </el-descriptions-item>
                <el-descriptions-item
                  label-class-name="label-table-gift-card"
                  content-class-name="content-table-number-gift-card"
                >
                  <template slot="label">
                    <svg-icon
                      icon-class="payments"
                    />
                    {{ $t('form.pos.collect.amount') }}
                  </template>
                  {{ formatPrice({ value: currentGiftCard.amount, currency: currentGiftCard.currency.iso_code}) }}
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-card>
        </template>
      </el-result>
    </p>
  </el-card>
</template>

<script>
import {
  defineComponent,
  computed,
  // watch,
  ref
} from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'

// Utils and Helper Methods
import { formatPrice, formatQuantity } from '@/utils/ADempiere/formatValue/numberFormat'
import CardPayments from '@/components/ADempiere/Form/VPOS2/Collection/Payments/CardPayments.vue'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { showMessage } from '@/utils/ADempiere/notification'

export default defineComponent({
  name: 'InfoCollection',

  components: {
    CardPayments
  },

  setup() {
    // Ref
    const code = ref('')
    const isLoading = ref(false)
    const timeOut = ref(() => {})
    const giftCardSearchCode = ref(null)
    // const currentGiftCard = ref({})

    const currentOrder = computed(() => {
      return store.getters.getCurrentOrder
    })

    const currentGiftCard = computed(() => {
      return store.getters.getGiftCardSearch
    })

    const contentText = computed(() => {
      if (isEmptyValue(currentGiftCard.value)) return ''
      // return lang.t('form.pos.optionsPoinSales.salesOrder.giftCardPlaceholder')
      return ''
    })

    // Methods

    function searchGiftCard(value) {
      if (isEmptyValue(value)) return

      clearTimeout(timeOut.value)
      timeOut.value = setTimeout(() => {
        isLoading.value = true
        store.dispatch('findGiftCard', value)
          .finally(() => {
            code.value = ''
            isLoading.value = false
          })
      }, 1000)
    }

    function addPayment() {
      const { amount, currency, business_partner, id } = currentGiftCard.value
      if (isEmptyValue(currency) || currency.id <= 0) {
        showMessage({
          message: lang.t('form.pointOfSales.collection.currencyMandatory'),
          type: 'warning'
        })
        return
      }
      store.dispatch('refundReference', {
        amount,
        source_amount: amount,
        tender_type_code: 'G',
        gift_card_id: id,
        currency_id: currency.id,
        customer_id: business_partner.id,
        sales_representative_id: currentOrder.value.sales_representative.id,
        is_refund: false
      })
        .then(() => {
          const paymentMethod = store.getters.getListPaymentMethods[0]
          store.commit('setPaymentMethod', paymentMethod)
          store.commit('setShowedModalDialogVPOS', {
            isShowed: false
          })
        })
    }

    function spanSize(lines) {
      if (lines.length > 1) return 12
      return 24
    }

    setTimeout(() => {
      // store.commit('setCurrentGiftCard', {})
      giftCardSearchCode.value.focus()
    }, 500)

    store.commit('setCurrentGiftCard', {})

    return {
      // Ref
      code,
      isLoading,
      contentText,
      currentGiftCard,
      giftCardSearchCode,
      // Methods
      searchGiftCard,
      formatQuantity,
      formatPrice,
      addPayment,
      spanSize
    }
  }
})
</script>

<style lang="scss">
.context-gifd-card {
  text-align: center;
  margin: 0px;
  .el-result {
    padding: 0px !important;
    width: 100% !important;
    .el-result__icon {
      width: 80% !important;
    }
  }
}
.label-table-gift-card {
  text-align: center !important;
}
.content-table-number-gift-card {
  text-align: right !important;
}
.result-gifd-card {
  padding: 0px !important;
}
.result-input {
  font-size: 25px;
  padding-top: 5px;
}
.code-input {
  width: 450px;
}
.result-image {
  width: 250px;
  height: 250px
}
</style>
