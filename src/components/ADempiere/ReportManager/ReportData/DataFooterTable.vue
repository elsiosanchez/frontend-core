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
          :container-uuid="containerUuid"
          :is-loading-report="isLoadingReport"
          :generate-report="containerManager.generateReport"
        />
      </el-col>
      <el-col :span="4">
        <report-views-field
          :container-uuid="reportOutput.containerUuid"
          :is-loading-report="isLoadingReport"
          :generate-report="containerManager.generateReport"
        />
      </el-col>
      <el-col :span="3">
        <el-form-item
          style="margin-top: 20px; margin-left: 10%;"
        >
          <report-summary
            :container-uuid="containerUuid"
            :is-loading-report="isLoadingReport"
            :generate-report="containerManager.generateReport"
          />
        </el-form-item>
      </el-col>
      <el-col :span="3">
        <el-form-item
          style=" margin-top: 18px; margin-left: 10%;"
        >
          <refresh-button
            :container-uuid="containerUuid"
            :is-loading-report="isLoadingReport"
            :generate-report="containerManager.generateReport"
          />
        </el-form-item>
      </el-col>
      <el-col :span="3">
        <el-form-item
          style="margin-top: 20px; margin-left: 3%;"
        >
          <download-button
            :container-uuid="containerUuid"
            :is-loading-report="isLoadingReport"
          />
        </el-form-item>
      </el-col>

      <el-col :span="7" style="margin-top: 25px;">
        <custom-pagination
          :total-records="recordData.record_count"
          :page-size="currentPageSize"
          :page-number="currentPageNumber"
          :handle-change-page-size="handleChangePageSize"
          :handle-change-page-number="handleChangePageNumber"
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
import DownloadButton from '@/components/ADempiere/ReportManager/SetupReportTable/downloadButton.vue'
import PrintFormatField from '@/components/ADempiere/ReportManager/SetupReportTable/printFormatField.vue'
import RefreshButton from '@/components/ADempiere/ReportManager/SetupReportTable/refreshButton.vue'
import ReportSummary from '@/components/ADempiere/ReportManager/SetupReportTable/reportSummary.vue'
import ReportViewsField from '@/components/ADempiere/ReportManager/SetupReportTable/reportViewsField.vue'

export default defineComponent({
  name: 'DataFooter',

  components: {
    CustomPagination,
    DownloadButton,
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
    const storedReportGenerated = computed(() => {
      return store.getters.getReportGenerated(props.containerUuid)
    })

    const recordData = computed(() => {
      return store.getters.getReportOutput(props.instanceUuid)
    })

    const currentPageSize = computed(() => {
      return storedReportGenerated.value.pageSize
    })

    const isLoadingReport = computed(() => {
      return store.getters.getReportIsLoading
    })

    const currentPageNumber = computed(() => {
      return storedReportGenerated.value.pageNumber
    })

    // Methods
    function handleChangePageSize(pageSize) {
      store.commit('setReportGeneratedPageSize', {
        containerUuid: props.containerUuid,
        pageSize
      })
      props.containerManager.generateReport()
    }

    function handleChangePageNumber(pageNumber) {
      store.commit('setReportGeneratedPageNumber', {
        containerUuid: props.containerUuid,
        pageNumber
      })
      props.containerManager.generateReport()
    }

    return {
      // Components
      recordData,
      isLoadingReport,
      currentPageSize,
      currentPageNumber,
      // Methods
      handleChangePageNumber,
      handleChangePageSize
    }
  }
})
</script>
