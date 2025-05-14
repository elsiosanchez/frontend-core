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
  <div style="display: flex; align-items: center;">
    <el-checkbox
      v-model="isSummaryValue"
      :disabled="isLoadingReport"
      :loading="isLoadingReport"
      border
      size="medium"
    >
      <b>
        {{ $t('report.reportEnginer.summary') }}
      </b>
    </el-checkbox>
  </div>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import store from '@/store'

export default defineComponent({
  name: 'ReportSummary',

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
    const storedReportGenerated = computed(() => {
      return store.getters.getReportGenerated(props.containerUuid)
    })

    const isSummaryValue = computed({
      set(newValue) {
        store.commit('setReportGeneratedIsSummary', {
          containerUuid: props.containerUuid,
          isSummary: newValue
        })
        // TODO: Deprecated remove complete support
        store.commit('setIsSummary', newValue)
      },
      get() {
        return storedReportGenerated.value.isSummary
      }
    })

    return {
      isSummaryValue
    }
  }
})
</script>
