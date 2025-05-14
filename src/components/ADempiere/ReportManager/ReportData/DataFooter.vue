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
  <el-form
    label-position="top"
    size="mini"
    @submit.native.prevent="notSubmitForm"
  >
    <el-row :gutter="12">
      <el-col :span="4">
        <print-format-field
          :container-uuid="reportOutput.containerUuid"
          :report-output="reportOutput"
          :container-manager="containerManagerReportViwer"
          :is-loading-report="isLoadingReport"
        />
      </el-col>
      <el-col :span="4">
        <report-views-field
          :container-uuid="reportOutput.containerUuid"
          :report-output="reportOutput"
          :container-manager="containerManagerReportViwer"
          :is-loading-report="isLoadingReport"
        />
      </el-col>
      <el-col :span="3">
        <el-form-item
          style="margin-top: 20px; margin-left: 10%;"
        >
          <report-summary
            :container-uuid="containerUuid"
            :report-output="reportOutput"
            :is-loading-report="isLoadingReport"
          />
        </el-form-item>
      </el-col>
      <el-col :span="3">
        <el-form-item
          style=" margin-top: 18px; margin-left: 10%;"
        >
          <refresh-button
            :container-uuid="containerUuid"
            :report-output="reportOutput"
            :is-loading-report="isLoadingReport"
          />
        </el-form-item>
      </el-col>
      <el-col :span="3">
        <el-form-item
          style="margin-top: 20px; margin-left: 3%;"
        >
          <download-buttom
            :container-uuid="containerUuid"
            :report-output="reportOutput"
            :is-loading-report="isLoadingReport"
          />
        </el-form-item>
      </el-col>

      <el-col :span="7" style="margin-top: 25px;">
        <custom-pagination
          :total-records="recordData.record_count"
          :page-size="currentPageSize"
          :page-number="currentPageNumber"
          :handle-change-page-size="handleChangeSizePage"
          :handle-change-page-number="handleChangePage"
          :is-report="true"
        />
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import CustomPagination from '@/components/ADempiere/DataTable/Components/CustomPagination.vue'
import DownloadButtom from '@/components/ADempiere/ReportManager/SetupReport/downloadButtom.vue'
import PrintFormatField from '@/components/ADempiere/ReportManager/SetupReport/printFormatField.vue'
import RefreshButton from '@/components/ADempiere/ReportManager/SetupReport/refreshButton.vue'
import ReportSummary from '@/components/ADempiere/ReportManager/SetupReport/reportSummary.vue'
import ReportViewsField from '@/components/ADempiere/ReportManager/SetupReport/reportViewsField.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

export default defineComponent({
  name: 'DataFooter',

  components: {
    CustomPagination,
    DownloadButtom,
    PrintFormatField,
    RefreshButton,
    ReportSummary,
    ReportViewsField
  },

  props: {
    containerManager: {
      type: Object,
      default: () => {}
    },
    instanceUuid: {
      type: [String, Number],
      default: 0
    },
    containerUuid: {
      type: [String, Number],
      required: true
    },
    reportOutput: {
      type: Object,
      required: false
    }
  },

  setup(props) {
    // Constants
    const reportDefinition = store.getters.getStoredReport(props.containerUuid)

    // Components
    const storedPanelReport = computed(() => {
      return store.getters.getModalDialogManager({
        containerUuid: props.containerUuid
      })
    })

    const containerManagerReportViwer = computed(() => {
      const modalDialogStored = storedPanelReport.value
      if (!isEmptyValue(modalDialogStored) && !isEmptyValue(modalDialogStored.containerManager)) {
        return {
          ...props.containerManager,
          ...modalDialogStored.containerManager
        }
      }
      return {
        ...props.containerManager
      }
    })

    const recordData = computed(() => {
      return store.getters.getReportOutput(props.instanceUuid)
    })

    const currentPageSize = computed(() => {
      return parseInt(props.reportOutput.pageSize, 10)
    })

    const isLoadingReport = computed(() => {
      return store.getters.getReportIsLoading
    })

    const currentPageNumber = computed(() => {
      return parseInt(props.reportOutput.pageToken, 10)
    })

    // Methods
    function handleChangeSizePage(pageSize) {
      props.containerManager.setPageSize({
        instanceUuid: props.reportOutput.instance_id,
        containerUuid: props.reportOutput.containerUuid,
        pageNumber: currentPageNumber.value,
        pageSize,
        parametersList: reportDefinition,
        reportId: reportDefinition.internal_id,
        printFormatId: props.reportOutput.print_format_id,
        reportViewId: props.reportOutput.report_view_id
      })
    }

    function handleChangePage(pageNumber) {
      props.containerManager.setPageNumber({
        instanceUuid: props.reportOutput.instance_id,
        containerUuid: props.reportOutput.containerUuid,
        pageNumber,
        pageSize: currentPageSize.value,
        parametersList: reportDefinition,
        reportId: reportDefinition.internal_id,
        printFormatId: props.reportOutput.print_format_id,
        reportViewId: props.reportOutput.report_view_id
      })
    }

    return {
      // Components
      recordData,
      isLoadingReport,
      currentPageSize,
      currentPageNumber,
      storedPanelReport,
      containerManagerReportViwer,
      // Methods
      handleChangePage,
      handleChangeSizePage
    }
  }
})
</script>
