<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
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
  <el-row :gutter="10">
    <el-form
      ref="import-format-fields"
      label-position="top"
      class="form-base"
      inline
    >
      <el-col
        v-for="(fieldFormat) in formatFieldsList"
        :key="fieldFormat.sequence"
        :span="6"
      >
        <el-form-item
          :label="fieldFormat.name"
          style="margin-bottom: 0px !important;width: 100%;"
        >
          <el-input
            v-if="fieldFormat.data_type === 'S'"
            :value="formatValue(fieldFormat, currentLine)"
            disabled
            style="width: 100%;"
          />

          <el-input-number
            v-else-if="fieldFormat.data_type === 'N'"
            :value="formatValue(fieldFormat, currentLine)"
            controls-position="right"
            disabled
            style="width: 100%;"
            :precision="numberPrecision(fieldFormat)"
          />

          <el-date-picker
            v-else-if="fieldFormat.data_type === 'D'"
            :value="formatValue(fieldFormat, currentLine)"
            type="datetime"
            disabled
            style="width: 100%;"
          />

          <el-input
            v-else-if="fieldFormat.data_type === 'C'"
            :value="formatValue(fieldFormat, currentLine)"
            disabled
            style="width: 100%;"
          />
        </el-form-item>
      </el-col>
    </el-form>
    <br>
    <br>
  </el-row>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import store from '@/store'

// Utils and Helper Methods
import { formatValue } from '@/utils/ADempiere/dictionary/form/VFileImport'

export default defineComponent({
  name: 'ImportFormatFields',

  setup() {
    const formatFieldsList = computed(() => {
      const { format_fields } = store.getters.getStoredImportFormat
      return format_fields
    })

    const currentLine = computed(() => {
      return store.getters.getImportRowLine || {}
    })

    function numberPrecision(field) {
      const value = formatValue(field, currentLine.value)
      if (Number.isInteger(value)) {
        return 0
      }
      return 2
    }

    return {
      // Computed
      currentLine,
      formatFieldsList,
      // Methods
      numberPrecision,
      formatValue
    }
  }
})
</script>
