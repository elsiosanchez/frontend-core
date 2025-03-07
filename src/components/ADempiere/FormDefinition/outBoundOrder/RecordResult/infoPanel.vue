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
        :label="$t('form.outBoundOrder.productInfo.product')"
        align="left"
        min-width="200"
      >
        <template slot-scope="scope">
          <p
            style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;line-height: 14px;font-size: 14px;margin: 0px;"
          >
            <el-popover
              placement="top-start"
              trigger="hover"
              width="300"
            >
              {{ scope.row.product }}
              <p
                slot="reference"
                type="text"
                style="color: #606266;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;line-height: 14px;font-size: 14px;margin: 0px;"
              >
                {{ scope.row.product }}
              </p>
            </el-popover>
          </p>
        </template>
      </el-table-column>

      <el-table-column
        prop="uom"
        :label="$t('form.outBoundOrder.productInfo.uom')"
        align="left"
        width="80"
      />
      <el-table-column
        prop="warehouse"
        :label="$t('form.outBoundOrder.productInfo.warehouse')"
        align="left"
        width="150"
      />
      <el-table-column
        prop="on_hand_quantity"
        :label="$t('form.outBoundOrder.productInfo.onHandQuantity')"
        align="left"
        width="160"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.on_hand_quantity < 0 }">
            {{ formatQuantity({ value: scope.row.on_hand_quantity }) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="quantity_in_transit"
        :label="$t('form.outBoundOrder.productInfo.quantityInTransit')"
        align="left"
        width="160"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.quantity_in_transit < 0 }">
            {{ formatQuantity({ value: scope.row.quantity_in_transit }) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="quantity"
        :label="$t('form.outBoundOrder.productInfo.quantity')"
        align="left"
        width="160"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.quantity < 0 }">
            {{ formatQuantity({ value: scope.row.quantity }) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="pickedQuantity"
        :label="$t('form.outBoundOrder.productInfo.pickedQuantity')"
        align="left"
        width="160"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.quantity_in_transit < 0 }">
            {{ formatQuantity({ value: scope.row.pickedQuantity }) }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
import store from '@/store'
import { defineComponent, computed } from '@vue/composition-api'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { formatQuantity } from '@/utils/ADempiere/formatValue/numberFormat'

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
          pickedQuantity: pickedQty
        }
      })
      return resultado
    })

    return {
      records,
      //
      formatQuantity
    }
  }
})
</script>
