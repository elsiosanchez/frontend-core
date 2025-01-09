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
      @row-dblclick="openInfo"
    >
      <index-column
        :page-number="pageNumber"
        :page-size="pageSize"
        width="40"
      />

      <el-table-column
        prop="value"
        :label="$t('form.businessPartnerInformation.value')"
        header-align="center"
        min-width="100"
      />
      <el-table-column
        prop="name"
        :label="$t('form.businessPartnerInformation.name')"
        header-align="center"
        min-width="300"
      />
      <el-table-column
        prop="business_partner_group"
        :label="$t('form.businessPartnerInformation.group')"
        header-align="center"
        min-width="150"
      />

      <el-table-column
        prop="open_balance_amount"
        :label="$t('form.businessPartnerInformation.openBalance')"
        header-align="center"
        min-width="135"
      >
        <span slot-scope="scope" :class="{ 'cell-align-right': true, 'number-negative': scope.row.open_balance_amount < 0 }">
          {{ scope.row.openBalanceAmountFormated }}
        </span>
      </el-table-column>

      <el-table-column
        prop="credit_available_amount"
        :label="$t('form.businessPartnerInformation.creditAvailable')"
        header-align="center"
        min-width="135"
      >
        <span slot-scope="scope" :class="{ 'cell-align-right': true, 'number-negative': scope.row.credit_available_amount < 0 }">
          {{ scope.row.creditAvailableAmountFormated }}
        </span>
      </el-table-column>

      <el-table-column
        prop="credit_used_amount"
        :label="$t('form.businessPartnerInformation.creditUsed')"
        header-align="center"
        min-width="135"
      >
        <span slot-scope="scope" :class="{ 'cell-align-right': true, 'number-negative': scope.row.credit_used_amount < 0 }">
          {{ scope.row.creditUsedAmountFormated }}
        </span>
      </el-table-column>

      <el-table-column
        prop="revenue_amount"
        :label="$t('form.businessPartnerInformation.revenue')"
        header-align="center"
        min-width="135"
      >
        <span slot-scope="scope" :class="{ 'cell-align-right': true, 'number-negative': scope.row.revenue_amount < 0 }">
          {{ scope.row.revenueAmountFormated }}
        </span>
      </el-table-column>

    </el-table>
  </div>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import IndexColumn from '@/components/ADempiere/DataTable/Components/IndexColumn.vue'

export default defineComponent({
  name: 'TableBusinessInfo',

  components: {
    IndexColumn
  },

  setup() {
    const businessInfo = computed(() => {
      return store.getters.getBusinessPartners
    })

    const pageSize = computed(() => {
      return store.getters.getPageSizeBusiness
    })
    const pageNumber = computed(() => {
      return store.getters.getPageNumberBusiness
    })

    const isLoading = computed(() => {
      return store.getters.getIsLoadingBusinness
    })

    const tableHeight = computed(() => {
      // TODO: Add calc with query criteria expand/collapse
      return 'calc(100vh - 410px)'
    })

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
      businessInfo,
      tableHeight,
      pageNumber,
      pageSize,
      // Methods
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
