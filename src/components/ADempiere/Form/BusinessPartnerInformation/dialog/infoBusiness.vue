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
  <el-row :gutter="20">
    <el-col :span="18">
      <el-descriptions :column="3" :label-style="{'fornt-weight': 'bold'}">
        <el-descriptions-item :label="$t('form.businessPartnerInformation.value')">
          {{ row.value }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('form.businessPartnerInformation.name')">
          {{ row.name }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('form.businessPartnerInformation.group')">
          {{ row.business_partner_group }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('form.businessPartnerInformation.openBalance')">
          <span :class="{ 'number-negative': row.open_balance_amount < 0 }">
            {{ row.openBalanceAmountFormated }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('form.businessPartnerInformation.creditAvailable')">
          <span :class="{ 'number-negative': row.credit_available_amount < 0 }">
            {{ row.creditAvailableAmountFormated }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('form.businessPartnerInformation.creditUsed')">
          <span :class="{ 'number-negative': row.credit_used_amount < 0 }">
            {{ row.creditUsedAmountFormated }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('form.businessPartnerInformation.revenue')">
          <span :class="{ 'number-negative': row.revenue_amount < 0 }">
            {{ row.revenueAmountFormated }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('form.businessPartnerInformation.revenue')">
          <span :class="{ 'number-negative': row.revenue_amount < 0 }">
            {{ row.revenueAmountFormated }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('form.businessPartnerInformation.customer')">
          {{ row.isCustomerFormated }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('form.businessPartnerInformation.vendor')">
          {{ row.isVendorFormated }}
        </el-descriptions-item>
      </el-descriptions>
    </el-col>

    <el-col :span="4">
      <el-image
        style="width: 80px; height: 80px;margin: 0 auto 0; display: flex; justify-content:center; align-items:center; background: #f5f7fa"
        :src="url"
        :preview-src-list="srcList"
        fit="cover"
        class="image-conten"
      >
        <div slot="error" class="image-slot">
          <i class="el-icon-picture-outline" />
        </div>
      </el-image>
    </el-col>
  </el-row>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import store from '@/store'

export default defineComponent({
  name: 'InfoBusiness',

  setup() {
    const row = computed(() => {
      return store.getters.getRowSelect
    })

    return {
      row,
      url: '',
      srcList: [
        ''
      ]
    }
  }
})
</script>
