<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
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
  <el-card class="box-card">
    <div v-if="isShowTitle" slot="header" class="clearfix">
      <b>
        {{ $t('report.reportSettings') }}
      </b>
    </div>

    <el-collapse v-model="activeCollapse">
      <el-collapse-item name="1" class="preference-fields">
        <template slot="title">
          <b style="font-size: 18px">
            {{ $t('report.preference') }}
            <i style="font-size: 18px;" class="el-icon-s-operation" />
          </b>
        </template>

        <el-card class="box-card preference-card">
          <div class="text item">
            <el-form
              label-position="top"
              label-width="10px"
              size="mini"
              @submit.native.prevent="notSubmitForm"
            >
              <el-row class="report-view-setup-preferences-fields" :gutter="12">
                <el-col :span="6">
                  <print-format-field
                    :container-uuid="containerUuid"
                    :report-output="reportOutput"
                    :container-manager="containerManagerReportViwer"
                    :is-loading-report="isLoadingReport"
                  />
                </el-col>

                <el-col :span="6">
                  <report-views-field
                    :container-uuid="containerUuid"
                    :report-output="reportOutput"
                    :container-manager="containerManagerReportViwer"
                    :is-loading-report="isLoadingReport"
                  />
                </el-col>

                <el-col :span="4">
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

                <el-col :span="4">
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

                <el-col :span="4">
                  <el-form-item
                    style="margin-top: 18px; margin-left: 3%;"
                  >
                    <download-buttom
                      :container-uuid="containerUuid"
                      :report-output="reportOutput"
                      :is-loading-report="isLoadingReport"
                    />
                  </el-form-item>
                </el-col>

                <!-- <el-col v-if="!isReportEnginer" :span="24">
                  <el-form-item
                    :label="$t('report.typeReport')"
                    style="display: grid;"
                  >
                    <el-select
                      v-model="reportTypeFormatValue"
                      style="display: contents;"
                    >
                      <el-option
                        v-for="(item, key) in reportTypeFormat.childs"

                        :key="key"
                        :label="item.name"
                        :value="item.type"
                      />
                    </el-select>
                  </el-form-item>
                </el-col> -->

              </el-row>
            </el-form>
          </div>
        </el-card>
      </el-collapse-item>

      <!-- report parameters -->
      <el-collapse-item v-if="isReportEnginer" name="2" class="parameters-fields">
        <template slot="title">
          <b style="font-size: 18px">
            {{ $t('actionMenu.changeParameters') }}
            <i style="font-size: 18px;" class="el-icon-set-up" />
          </b>
        </template>
        <panel-definition
          :container-uuid="containerUuid"
          :container-manager="containerManagerReportViwer"
          :is-tab-panel="true"
        />
      </el-collapse-item>
    </el-collapse>

    <el-row
      style="
        position: absolute;
        bottom: 1%;
        right: 2%;
      "
    >
      <el-col
        v-if="isReportEnginer"
        :span="24"
      >
        <samp class="report-viewer-setup-footer">
          <el-button
            type="info"
            class="button-base-icon"
            plain
            :disabled="isLoadingReport"
            :loading="isLoadingReport"
            @click="clearParameters();"
          >
            <svg-icon icon-class="layers-clear" />
          </el-button>
          <el-button
            type="danger"
            class="button-base-icon"
            icon="el-icon-close"
            :disabled="isLoadingReport"
            :loading="isLoadingReport"
            @click="handleClose()"
          />
          <el-button
            type="primary"
            class="button-base-icon"
            icon="el-icon-check"
            :disabled="isLoadingReport"
            :loading="isLoadingReport"
            @click="runReport()"
          />
        </samp>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
import { defineComponent, computed, ref, watch } from '@vue/composition-api'

import router from '@/router'
import store from '@/store'
import lang from '@/lang'

// Components adn Mixins
import DownloadButtom from './downloadButtom.vue'
import PanelDefinition from '@/components/ADempiere/PanelDefinition/index.vue'
import PrintFormatField from './printFormatField.vue'
import RefreshButton from './refreshButton.vue'
import ReportSummary from './reportSummary.vue'
import ReportViewsField from './reportViewsField.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showNotification } from '@/utils/ADempiere/notification'

export default defineComponent({
  name: 'OptionsReportViewer',

  components: {
    DownloadButtom,
    PanelDefinition,
    PrintFormatField,
    RefreshButton,
    ReportSummary,
    ReportViewsField
  },

  props: {
    containerUuid: {
      type: [String, Number],
      required: true
    },
    containerManager: {
      type: Object,
      required: true
    },
    isShowTitle: {
      type: Boolean,
      default: true
    },
    isReportEnginer: {
      type: Boolean,
      default: true
    },
    isLoadingReport: {
      type: Boolean,
      default: false
    },
    reportOutput: {
      type: Object,
      required: false
    }
  },

  setup(props, { root }) {
    /**
     * Ref
     * @reportAsViewValue - @params - {String} - (Value the Report Viwer)
     * @reportAsPrintFormatValue - @params - {String} - (Value the Print Format)
     * @reportTypeFormatValue - @params - {String} - (Value the Report Type)
     * @activeCollapse - @params - {Array} - (Nodes activating collapse *Note: Cannot be used if the node is accordion mode*)
     */
    const reportAsViewValue = ref(undefined)
    const reportAsPrintFormatValue = ref(undefined)
    const reportTypeFormatValue = ref('')
    const activeCollapse = ref(['1', '2'])
    const isSummaryReport = ref(true)

    /**
     * Computed
     * @reportAsView - List the options the Report Viwer
     * @reportAsPrintFormat - List the options the Print Format
     * @reportAsView - List the options the Report Type
     * @storedPanelReport - Attribute the Panel Report
     * @defaultParams - Parameters with which the report was executed
     * @isShowSetupReport - is to show the configuration report
     * @containerManagerReportViwer - Container Manager the Report Viwer
     * @componentRender - Import the Panel Definitions component
     */
    // function activeCollapse({ 0: data }) {
    //   store.commit('setActivateCollapse', data)
    // }
    const reportAsView = computed(() => {
      const options = store.getters.getStoredActionsMenu({
        containerUuid: props.containerUuid
      }).find(repoortOptions => repoortOptions.actionName === 'runReportAsView')
      if (isEmptyValue(options)) {
        return {
          childs: []
        }
      }
      return options
    })

    const reportAsPrintFormat = computed(() => {
      const options = store.getters.getStoredActionsMenu({
        containerUuid: props.containerUuid
      }).find(repoortOptions => repoortOptions.actionName === 'runReportAsPrintFormat')
      if (isEmptyValue(options)) {
        return {
          childs: []
        }
      }
      return options
    })

    const tableName = computed(() => {
      const { tableName } = store.getters.getReportOutput(root.$route.params.reportId)
      if (!isEmptyValue(tableName)) {
        return tableName
      }
      const currentPrintFormat = reportAsPrintFormat.value.childs.find(printFormat => {
        return printFormat.id === reportAsPrintFormatValue.value
      })
      if (!isEmptyValue(currentPrintFormat)) {
        return currentPrintFormat.tableName
      }
      return ''
    })

    const reportTypeFormat = computed(() => {
      const options = store.getters.getStoredActionsMenu({
        containerUuid: props.containerUuid
      }).find(repoortOptions => repoortOptions.actionName === 'runReportAs')
      if (isEmptyValue(options)) {
        return {
          childs: []
        }
      }
      return options
    })

    const storedPanelReport = computed(() => {
      return store.getters.getModalDialogManager({
        containerUuid: props.containerUuid
      })
    })

    const defaultParams = computed(() => {
      return props.reportOutput
    })

    const isShowSetupReport = computed(() => {
      return store.getters.getShowPanelConfig({ containerUuid: props.containerUuid })
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

    const findTagViwer = computed(() => {
      return store.getters.visitedViews.find(tag => tag.instanceUuid === root.$route.params.instanceUuid)
    })

    /**
     * Methods
     * @updatePrintFormat - @params {String} - Actualizar en el store el parametro Print Format
     * @updateReportView - @params {String} - Actualizar en el store el parametro Report Viwer
     * @updateReportType - @params {String} - Actualizar en el store el parametro Report Type
     * @handleClose - Close Panel and Clean Value
     * @runReport - Run Report and Close Panel
     * @runReport - @params {Object} - Set in the field the parameters with which the report was run
     */

    function updatePrintFormat(value) {
      store.commit('setReportGenerated', {
        containerUuid: props.containerUuid,
        printFormatId: value,
        reportType: reportTypeFormatValue.value,
        reportViewId: reportAsViewValue.value
      })
    }

    function updateReportView(value) {
      store.commit('setReportGenerated', {
        containerUuid: props.containerUuid,
        printFormatId: reportAsPrintFormatValue.value,
        reportType: reportTypeFormatValue.value,
        reportViewId: value
      })
    }

    function updateReportType(value) {
      store.commit('setReportGenerated', {
        containerUuid: props.containerUuid,
        reportViewId: reportAsViewValue.value,
        printFormatId: reportAsPrintFormatValue.value,
        reportType: value
      })
    }

    function handleClose() {
      store.commit('setShowPanelConfig', {
        containerUuid: props.containerUuid,
        value: false
      })
      reportAsViewValue.value = undefined
      reportAsPrintFormatValue.value = undefined
      reportTypeFormatValue.value = ''
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
      let isChangePanel = true
      if (reportDefinition.is_process_before_launch) {
        isChangePanel = false
      }
      store.dispatch(url, {
        containerUuid: props.containerUuid || root.$route.params.processUuid,
        isSummary: true,
        parametersList: reportOutputParams,
        printFormatId: reportAsPrintFormatValue.value,
        reportId: reportDefinition.internal_id,
        instanceUuid: defaultParams.value.instance_id,
        reportViewId: defaultParams.value.report_view_id,
        pageSize: props.reportOutput.pageSize,
        pageToken: props.reportOutput.pageToken,
        isChangePanel
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
      reportAsViewValue.value = report_view_id
      reportAsPrintFormatValue.value = print_format_id
      reportTypeFormatValue.value = reportType
      store.commit('setReportGenerated', {
        containerUuid: props.containerUuid,
        reportViewId: report_view_id,
        printFormatId: print_format_id,
        reportType
      })
    }

    function clearParameters() {
      store.dispatch('setReportDefaultValues', {
        containerUuid: props.containerUuid
      })
      const { report_view_id, print_format_id, reportType } = defaultParams.value
      reportAsViewValue.value = report_view_id
      reportAsPrintFormatValue.value = print_format_id
      reportTypeFormatValue.value = reportType
    }

    /**
     * Watch
     */

    watch(reportAsViewValue, (newValue) => {
      updateReportView(newValue)
    })

    watch(reportAsPrintFormatValue, (newValue) => {
      updatePrintFormat(newValue)
    })

    watch(reportTypeFormatValue, (newValue) => {
      updateReportType(newValue)
    })

    watch(isShowSetupReport, (newValue) => {
      if (newValue) {
        defaultReport(defaultParams.value)
      }
    })

    watch(isSummaryReport, (newValue) => {
      if (newValue) {
        store.commit('setReportGenerated', {
          containerUuid: props.containerUuid,
          printFormatId: reportAsPrintFormatValue.value,
          reportType: reportTypeFormatValue.value,
          reportViewId: reportAsPrintFormatValue.value,
          isSummary: newValue
        })
      }
    })

    /**
     * Run Methods As soon as I load the panel
     */

    updatePrintFormat(reportTypeFormatValue.value)

    updateReportView(reportAsViewValue.value)

    updateReportType(reportTypeFormatValue.value)

    defaultReport(defaultParams.value)

    return {
      // Ref
      reportAsViewValue,
      reportAsPrintFormatValue,
      reportTypeFormatValue,
      activeCollapse,
      isSummaryReport,
      // Components
      reportAsView,
      reportAsPrintFormat,
      reportTypeFormat,
      tableName,
      storedPanelReport,
      defaultParams,
      isShowSetupReport,
      containerManagerReportViwer,
      findTagViwer,
      // methods
      clearParameters,
      updatePrintFormat,
      updateReportView,
      updateReportType,
      handleClose,
      runReport,
      defaultReport
    }
  }
})
</script>

<style lang="scss">
.preference-fields {
  .el-collapse-item__content {
    padding-bottom: 10px !important;

    .el-card.preference-card {
      .el-card__body {
        padding-top: 10px !important;
        padding-bottom: 10px !important;
      }
    }
  }

  .report-view-setup-preferences-fields {
    .el-form-item {
      margin-bottom: 5px;

      /**
      * Reduce the spacing between the form element and its label
      */
      .el-form-item__label {
        padding-bottom: 0px;
      }
    }
  }
}
</style>
