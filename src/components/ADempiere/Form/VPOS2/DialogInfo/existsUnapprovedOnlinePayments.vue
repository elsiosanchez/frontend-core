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
    <el-result
      icon="info"
      :title="titleMessage"
      :sub-title="$t('form.pos.optionsPoinSales.salesOrder.isExistOnlinePayments.isChargeApproved')"
    />
  </el-card>
</template>

<script>
import {
  defineComponent,
  computed
  // watch,
  // ref
} from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'

// // Utils and Helper Methods
// import { formatPrice, formatQuantity } from '@/utils/ADempiere/formatValue/numberFormat'
// import CardPayments from '@/components/ADempiere/Form/VPOS2/Collection/Payments/CardPayments.vue'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
// import { showMessage } from '@/utils/ADempiere/notification'

export default defineComponent({
  name: 'existsUnapprovedOnlinePayments',
  setup(props) {
    const currentOrder = computed(() => {
      return store.getters.getCurrentOrder
    })

    const titleMessage = computed(() => {
      if (isEmptyValue(currentOrder.value)) return ''
      if (currentOrder.value.is_rma) return lang.t('form.pos.optionsPoinSales.salesOrder.isExistOnlinePayments.isPaymentApproved')
      return lang.t('form.pos.optionsPoinSales.salesOrder.isExistOnlinePayments.isChargeApproved')
    })
    return {
      currentOrder,
      titleMessage
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
