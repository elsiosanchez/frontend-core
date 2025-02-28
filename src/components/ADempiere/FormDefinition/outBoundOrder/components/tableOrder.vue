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
      ref="listOrderTable"
      v-loading="isLoading"
      class="list-order-table"
      sise="mini"
      height="30vh"
      :data="records"
      border
      style="width: 100%"
      :element-loading-text="$t('notifications.loading')"
      element-loading-background="rgba(255, 255, 255, 0.8)"
      @select="selectionOrder"
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
        prop="date_ordered"
        :label="$t('form.outBoundOrder.order.dateOrdered')"
        align="left"
        width="150"
      >
        <span slot-scope="scope">
          {{ formatDate({ value: scope.row.date_ordered }) }}
        </span>
      </el-table-column>
      <el-table-column
        prop="date_promised"
        :label="$t('form.outBoundOrder.order.datePromised')"
        align="left"
        width="150"
      >
        <span slot-scope="scope">
          {{ formatDate({ value: scope.row.date_promised }) }}
        </span>
      </el-table-column>
      <el-table-column
        prop="region"
        :label="$t('form.outBoundOrder.order.region')"
        align="left"
        width="110"
      />
      <el-table-column
        prop="city"
        :label="$t('form.outBoundOrder.order.city')"
        align="left"
        width="110"
      />
      <el-table-column
        prop="sales_representative"
        :label="$t('form.outBoundOrder.searchCriteria.salesRepresentative')"
        align="left"
        width="200"
      />
      <el-table-column
        prop="business_partner"
        :label="$t('form.outBoundOrder.order.businessPartner')"
        align="left"
        width="160"
      />
      <el-table-column
        prop="location"
        :label="$t('form.outBoundOrder.order.location')"
        align="left"
        width="110"
      />
      <el-table-column
        prop="address1"
        :label="$t('form.outBoundOrder.order.address1')"
        align="left"
        width="110"
      />
      <el-table-column
        prop="address2"
        :label="$t('form.outBoundOrder.order.address2')"
        align="left"
        width="110"
      />
      <!-- <el-table-column
        prop="address3"
        :label="$t('form.outBoundOrder.order.address3')"
        align="left"
        width="110"
      />
      <el-table-column
        prop="address4"
        :label="$t('form.outBoundOrder.order.address4')"
        align="left"
        width="110"
      /> -->
      <el-table-column
        prop="weight"
        :label="$t('form.outBoundOrder.order.weight')"
        align="right"
        width="100"
      />
      <el-table-column
        prop="volume"
        :label="$t('form.outBoundOrder.order.volume')"
        align="right"
        width="100"
      />
    </el-table>
  </div>
</template>

<script>
import store from '@/store'
import { defineComponent, computed } from '@vue/composition-api'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'TableOrder',
  setup() {
    const isLoading = computed(() => {
      return store.getters.getIsLoadingListDocument
    })
    const records = computed(() => {
      return store.getters.getListDocument
    })
    function selectionOrder(selection) {
      const { organizationId, moventTypeId, warehouseId } = store.getters.getSearchFilterGenerateOrder
      let moventType = 'C_Order'
      if (moventTypeId) {
        moventType = 'DD_Order'
      }
      if (!isEmptyValue(selection)) {
        const recordsId = selection.map(data => data.id)
        store.dispatch('searchListDocumentLine', {
          organizationId,
          moventTypeId: moventType,
          warehouseId,
          recordsId: recordsId
        })
      } else {
        store.dispatch('searchListDocumentLine', {
          organizationId,
          moventTypeId: moventType,
          warehouseId,
          recordsId: -1
        })
        store.commit('setRecordsSelection', [])
      }
    }
    return {
      isLoading,
      records,
      //
      selectionOrder,
      //
      formatDate
    }
  }
})
</script>

<style>
.list-order-table  th.el-table__cell.is-leaf, .el-table td.el-table__cell {
  padding: 0px !important
}
</style>
