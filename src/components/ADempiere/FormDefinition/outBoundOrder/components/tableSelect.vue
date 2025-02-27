<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
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
  <div>
    <el-table
      ref="listSelectTable"
      v-loading="isLoading"
      class="list-select-table"
      sise="mini"
      height="30vh"
      border
      style="width: 100%; height: 85%"
      :element-loading-text="$t('notifications.loading')"
      element-loading-background="rgba(255, 255, 255, 0.8)"
    >
      <el-table-column type="selection" />
      <el-table-column
        prop="warehouse"
        :label="$t('form.outBoundOrder.searchCriteria.warehouse')"
        align="left"
        width="110"
      />
      <el-table-column
        prop="document_no"
        :label="$t('form.outBoundOrder.order.documentNo')"
        align="right"
        width="160"
      />
      <el-table-column
        prop="product"
        :label="$t('form.outBoundOrder.select.product')"
        align="left"
        width="150"
      />
      <el-table-column
        prop="uom"
        :label="$t('form.outBoundOrder.select.uom')"
        align="left"
        width="70"
      />
      <el-table-column
        prop="handQuantity"
        :label="$t('form.outBoundOrder.select.handQuantity')"
        align="right"
        width="160"
      />
      <el-table-column
        prop="quantity"
        :label="$t('form.outBoundOrder.select.quantity')"
        align="right"
        width="110"
      />
      <el-table-column
        prop="weight"
        :label="$t('form.outBoundOrder.order.weight')"
        align="right"
        width="110"
      />
      <el-table-column
        prop="weight"
        :label="$t('form.outBoundOrder.order.volume')"
        align="right"
        width="110"
      />
      <el-table-column
        prop="weight"
        :label="$t('form.outBoundOrder.select.loadSequence')"
        align="right"
        width="160"
      />
      <el-table-column
        prop="weight"
        :label="$t('form.outBoundOrder.select.orderedQuantity')"
        align="right"
        width="160"
      />
      <el-table-column
        prop="weight"
        :label="$t('form.outBoundOrder.select.reservedQuantity')"
        align="right"
        width="160"
      />
      <el-table-column
        prop="weight"
        :label="$t('form.outBoundOrder.select.quantityInvoiced')"
        align="right"
        width="160"
      />
      <el-table-column
        prop="weight"
        :label="$t('form.outBoundOrder.select.deliveredQuantity')"
        align="right"
        width="160"
      />
      <el-table-column
        prop="weight"
        :label="$t('form.outBoundOrder.select.qtyTransit')"
        align="right"
        width="160"
      />
      <el-table-column
        prop="weight"
        :label="$t('form.outBoundOrder.select.deliveryRule')"
        align="right"
        width="160"
      />
    </el-table>
  </div>
</template>

<script>
import store from '@/store'
import { defineComponent, computed } from '@vue/composition-api'
// Utils and Helper Methods
// import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'TableOrder',
  setup() {
    const isLoading = computed(() => {
      return store.getters.getIsLoadingListDocumentLine
    })
    const records = computed(() => {
      return store.getters.getListDocumentLine
    })
    return {
      isLoading,
      records,
      //
      formatDate
    }
  }
})
</script>

<style>
.list-select-table  th.el-table__cell.is-leaf, .el-table td.el-table__cell {
  padding: 0px !important
}
</style>
