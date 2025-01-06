<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
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
      v-loading="isLoading"
      :data="businessInfo"
      class="business-info-tabla"
      highlight-current-row
      :height="tableHeight"
      :border="true"
      fit
      style="width: 100%; font-size: 12px"
      :cell-style="styleCell"
      @row-dblclick="openInfo"
    >
      <el-table-column
        v-for="(header, key) in headerList"
        :key="key"
        :align="header.align"
        :min-width="header.width"
        :label="header.label"
        :prop="header.columnName"
        header-align="center"
      />
    </el-table>
  </div>
</template>

<script>
import store from '@/store'

import { defineComponent, computed } from '@vue/composition-api'

// Utils
import { formatQuantity } from '@/utils/ADempiere/formatValue/numberFormat'
import headerList from './headerList.ts'
export default defineComponent({
  name: 'TableBusinessInfo',
  setup() {
    const businessInfo = computed(() => {
      return store.getters.getBusinessPartners.map(list => {
        return {
          ...list,
          open_balance_amount: formatQuantity({ value: Number(list.open_balance_amount) }),
          credit_available_amount: formatQuantity({ value: Number(list.credit_available_amount) }),
          credit_used_amount: formatQuantity({ value: Number(list.credit_used_amount) }),
          revenue_amount: formatQuantity({ value: Number(list.revenue_amount) })
        }
      })
    })
    const isLoading = computed(() => {
      return store.getters.getIsLoadingBusinness
    })
    const tableHeight = computed(() => {
      return 'calc(100vh - 410px)'
    })
    function styleCell({ row }) {
      const creditAvailableAmount = parseFloat(row.credit_available_amount)
      if (creditAvailableAmount < 0) {
        return { color: 'red' }
      }
    }
    function openInfo(row) {
      store.commit('showDialogBusiness', true)
      store.commit('setTabOptionsBusiness', 'location')
      store.commit('setRowSelect', row)
      store.dispatch('requestLocation', {
        id: row.id
      })
    }
    return {
      // Ref
      isLoading,
      headerList,
      businessInfo,
      tableHeight,
      // Methods
      styleCell,
      openInfo
    }
  }
})
</script>

<style>
.el-table th.el-table__cell.is-leaf, .el-table td.el-table__cell {
  padding: 0px !important;
}

</style>
