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
  <div style="align-items: center;">
    <el-button
      :disabled="isLoadingReport"
      :loading="isLoadingReport"
      type="success"
      size="mini"
      icon="el-icon-refresh-right"
      style="font-size:16px"
      @click="runReport"
    >
      {{ $t('report.reportEnginer.refreshRecord') }}
    </el-button>
  </div>
</template>

<script>
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'RefreshButton',

  props: {
    containerUuid: {
      type: [String, Number],
      required: true
    },
    generateReport: {
      type: Function,
      default: () => {
        console.info('Implement method Change to `generateReport`.')
      }
    },
    isLoadingReport: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    function runReport() {
      props.generateReport()
    }

    return {
      runReport
    }
  }
})
</script>

