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
  <el-form-item>
    <template slot="label">
      <!-- <i
        style="font-size: 14px;"
        class="el-icon-data-analysis"
      /> -->
      {{ $t('report.printFormats') }}
    </template>

    <el-select
      v-model="printFormatValue"
      :disabled="isLoadingReport"
      :loading="isLoadingReport"
      style="display: contents;"
      size="mini"
      @change="generateReport()"
    >
      <empty-option-select
        :current-value="printFormatValue"
        :is-allows-zero="false"
      />
      <el-option
        v-for="(item, key) in printFormatsList"
        :key="key"
        :label="item.name"
        :value="item.id"
      />
    </el-select>
  </el-form-item>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import EmptyOptionSelect from '@/components/ADempiere/FieldDefinition/FieldSelect/emptyOptionSelect.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

export default defineComponent({
  name: 'PrintFormatField',

  components: {
    EmptyOptionSelect
  },

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

    const printFormatValue = computed({
      set(newValue) {
        store.commit('setReportGeneratedPrintFormatId', {
          containerUuid: props.containerUuid,
          printFormatId: newValue
        })
      },
      get() {
        return storedReportGenerated.value.printFormatId
      }
    })

    const printFormatsList = computed(() => {
      const optionsList = store.getters.getPrintFormatsList(props.containerUuid)
      if (!isEmptyValue(optionsList)) {
        return optionsList
      }
      return []
    })

    return {
      printFormatValue,
      // Computeds
      printFormatsList
    }
  }
})
</script>

<style lang="scss">
.el-form-item {
  margin-bottom: 5px;

  .el-form-item__label {
    padding: 0 !important;
  }
}
</style>
