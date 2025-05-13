<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/ElsioSanchez
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
  <el-row :gutter="12">
    <el-col :span="18" style="width: 100%;">
      <el-descriptions :column="3" :label-style="{'font-weight': 'bold'}" class="contentModalReport">
        <el-descriptions-item :label="$t('report.reportEnginer.max')" class="small-text">
          <span :style="{ 'color':isNegativeValue(data.maximum_value.display_value) ? 'red' : ''}">
            {{ data.maximum_value.display_value }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item :label="$t('report.reportEnginer.summation')" class="small-text">
          <span :style="{ 'color': isNegativeValue(data.sum_value.display_value) ? 'red' : ''}">
            {{ data.sum_value.display_value }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item :label="$t('report.reportEnginer.standardDeviation')" class="small-text">
          <span :style="{ 'color': isNegativeValue(data.deviation_value.display_value) ? 'red' : ''}">
            {{ data.deviation_value.display_value }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item :label="$t('report.reportEnginer.average')" class="small-text">
          <span :style="{ 'color': isNegativeValue(data.mean_value.display_value) ? 'red' : ''}">
            {{ data.mean_value.display_value }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item :label="$t('report.reportEnginer.Count')" class="small-text">
          <span :style="{ 'color': isNegativeValue(data.count_value.display_value) ? 'red' : ''}">
            {{ data.count_value.display_value }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item :label="$t('report.reportEnginer.variance')" class="small-text">
          <span :style="{ 'color': isNegativeValue(data.variance_value.display_value) ? 'red' : ''}">
            {{ data.variance_value.display_value }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item :label="$t('report.reportEnginer.min')" class="small-text">
          <span :style="{ 'color': isNegativeValue(data.minimum_value.display_value) ? 'red' : ''}">
            {{ data.minimum_value.display_value }}
          </span>
        </el-descriptions-item>

        <el-descriptions-item class="small-text" />
      </el-descriptions>
    </el-col>
  </el-row>
</template>
<script>

import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'InfoReport',

  props: {
    data: {
      type: Object,
      required: true
    }
  },

  setup() {
    function isNegativeValue(value) {
      const parsedValue = parseFloat(value)
      return !isNaN(parsedValue) && parsedValue < 0
    }

    return {
      isNegativeValue
    }
  }
})
</script>
