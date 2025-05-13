<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Ricardo Fenomeno ricardofenomeno13@gmail.com https://github.com/ricargame
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
      v-model="showChildren"
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
import { defineComponent, watch, computed } from '@vue/composition-api'

import store from '@/store'

export default defineComponent({
  name: 'ReportSummary',

  props: {
    isLoadingReport: {
      type: Boolean,
      default: false
    }
  },

  setup() {
    // const showChildren = ref()
    const showChildren = computed({
      get() {
        return store.getters.getIsSummary
      },
      set(value) {
        store.commit('setIsSummary', value)
      }
    })

    watch(
      () => store.getters.getIsSummary,
      (newValue) => {
        showChildren.value = newValue
      }
    )

    return {
      showChildren
    }
  }
})
</script>
