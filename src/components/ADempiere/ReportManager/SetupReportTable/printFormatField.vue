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
  <el-form-item
    :label="$t('report.printFormats')"
  >
    <el-select
      v-model="printFormatValue"
      :disabled="isLoadingReport"
      :loading="isLoadingReport"
      style="display: contents;"
      size="mini"
      @change="runReport()"
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
import { defineComponent, computed, watch } from '@vue/composition-api'

import router from '@/router'
import store from '@/store'
import lang from '@/lang'

// Components and Mixins
import EmptyOptionSelect from '@/components/ADempiere/FieldDefinition/FieldSelect/emptyOptionSelect.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showNotification } from '@/utils/ADempiere/notification'

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
    reportOutput: {
      type: Object,
      required: false
    },
    isLoadingReport: {
      type: Boolean,
      default: false
    }
  },

  setup(props, { root }) {
    const storedReportGenerated = computed(() => {
      return store.getters.getReportGenerated(props.containerUuid)
    })

    const printFormatValue = computed({
      set(newValue) {
        updatePrintFormat(newValue)
      },
      get() {
        if (!isEmptyValue(storedReportGenerated.value)) {
          return storedReportGenerated.value.printFormatId
        }
        return 0
      }
    })

    const printFormatsList = computed(() => {
      const optionsList = store.getters.getPrintFormatsList(props.containerUuid)
      if (!isEmptyValue(optionsList)) {
        return optionsList
      }
      return []
    })

    const defaultParams = computed(() => {
      return props.reportOutput
    })

    const findTagViwer = computed(() => {
      return store.getters.visitedViews.find(tag => {
        return tag.instanceUuid === root.$route.params.instanceUuid
      })
    })

    function updatePrintFormat(value) {
      store.commit('setReportGenerated', {
        containerUuid: props.containerUuid,
        printFormatId: value,
        reportViewId: defaultParams.value.report_view_id
      })
    }

    function runReport() {
      const reportDefinition = store.getters.getStoredReport(props.containerUuid)
      const reportOutputParams = store.getters.getReportParameters({
        containerUuid: props.containerUuid,
        fieldsList: reportDefinition.fieldsList
      })
      const { name, description } = store.getters.getReportOutput(root.$route.params.reportId)
      showNotification({
        title: lang.t('notifications.processing'),
        message: name,
        summary: description,
        type: 'info'
      })
      let url = 'buildReport'
      if (reportDefinition.is_jasper_report) {
        url = 'runReport'
      }
      store.dispatch(url, {
        containerUuid: props.containerUuid || root.$route.params.processUuid,
        isSummary: true,
        parametersList: reportOutputParams,
        printFormatId: printFormatValue.value,
        reportId: reportDefinition.internal_id,
        instanceUuid: defaultParams.value.instance_id,
        reportViewId: defaultParams.value.report_view_id,
        pageSize: props.reportOutput.pageSize,
        pageToken: props.reportOutput.pageToken,
        isChangePanel: true
      })
        .then(response => {
          store.dispatch('tagsView/delCachedView', findTagViwer.value).then(() => {
            const { fullPath } = findTagViwer.value
            this.$nextTick(() => {
              router.replace({
                path: '/redirect' + fullPath
              })
            })
          })
        })
      store.commit('setShowPanelConfig', {
        containerUuid: props.containerUuid,
        value: false
      })
    }

    function defaultReport(report) {
      const { report_view_id, print_format_id, reportType } = report
      printFormatValue.value = print_format_id
      store.commit('setReportGenerated', {
        containerUuid: props.containerUuid,
        reportViewId: report_view_id,
        printFormatId: print_format_id,
        reportType
      })
    }

    watch(printFormatValue, (newValue) => {
      updatePrintFormat(newValue)
    })
    updatePrintFormat(printFormatValue.value)

    defaultReport(defaultParams.value)

    return {
      printFormatValue,
      // Computeds
      printFormatsList,
      defaultParams,
      // Methods
      runReport,
      updatePrintFormat,
      defaultReport
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
