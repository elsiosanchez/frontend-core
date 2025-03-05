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
  <el-card>
    <el-table
      ref="listOrderTable"
      class="list-order-table"
      sise="mini"
      :data="records"
      height="30vh"
      border
      style="width: 100%"
      :element-loading-text="$t('notifications.loading')"
      element-loading-background="rgba(255, 255, 255, 0.8)"
    >
      <el-table-column
        prop="product"
        :label="$t('form.outBoundOrder.select.product')"
        align="left"
        width="200"
      />
      <el-table-column
        prop="uom"
        :label="$t('form.outBoundOrder.select.uom')"
        align="right"
        width="80"
      />
      <el-table-column
        prop="warehouse"
        :label="$t('form.outBoundOrder.searchCriteria.warehouse')"
        align="left"
        width="150"
      />
      <el-table-column
        prop="on_hand_quantity"
        :label="$t('form.outBoundOrder.select.handQuantity')"
        align="right"
        width="160"
      />
      <el-table-column
        prop="quantity_in_transit"
        :label="$t('form.outBoundOrder.select.qtyTransit')"
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
        prop="pickedQty"
        :label="$t('form.outBoundOrder.productInfo.pickedQty')"
        align="right"
        width="200"
      />
    </el-table>
  </el-card>
</template>

<script>
import store from '@/store'
import { defineComponent, computed } from '@vue/composition-api'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
export default defineComponent({
  name: 'InfoPanel',
  setup() {
    const records = computed(() => {
      const record = store.getters.getRecordsSelection
      if (isEmptyValue(record)) return
      const recordsGroup = {}
      record.forEach(r => {
        const product = r.product
        const on_hand_quantity = parseFloat(r.on_hand_quantity)
        const quantity = parseFloat(r.quantity)
        if (recordsGroup[product]) {
          recordsGroup[product].on_hand_quantity += on_hand_quantity
          recordsGroup[product].quantity += quantity
        } else {
          recordsGroup[product] = {
            ...r,
            on_hand_quantity: on_hand_quantity,
            quantity: quantity
          }
        }
      })
      const resultado = Object.values(recordsGroup).map(product => {
        const pickedQty = product.on_hand_quantity - product.quantity
        return {
          ...product,
          pickedQty: pickedQty
        }
      })
      return resultado
    })
    return {
      records
    }
  }
})
</script>
