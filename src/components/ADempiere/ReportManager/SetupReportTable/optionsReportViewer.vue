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
                    :is-loading-report="isLoadingReport"
                    :generate-report="containerManager.generateReport"
                  />
                </el-col>

                <el-col :span="6">
                  <report-views-field
                    :container-uuid="containerUuid"
                    :is-loading-report="isLoadingReport"
                    :generate-report="containerManager.generateReport"
                  />
                </el-col>

                <el-col :span="4">
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

                <el-col :span="4">
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

                <el-col :span="4">
                  <el-form-item
                    style="margin-top: 18px; margin-left: 3%;"
                  >
                    <download-button
                      :container-uuid="containerUuid"
                      :is-loading-report="isLoadingReport"
                      :generate-report="containerManager.generateReport"
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
      <!-- <el-collapse-item v-if="isReportEnginer" name="2" class="parameters-fields">
        <template slot="title">
          <b style="font-size: 18px">
            {{ $t('actionMenu.changeParameters') }}
            <i style="font-size: 18px;" class="el-icon-set-up" />
          </b>
        </template>
        <component
          :is="componentRender"
          :container-uuid="containerUuid"
          :container-manager="containerManagerReportViwer"
          :is-tab-panel="true"
        />
      </el-collapse-item> -->
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
import { defineComponent, ref } from '@vue/composition-api'

import store from '@/store'

// Components adn Mixins
import DownloadButton from './downloadButton.vue'
import PrintFormatField from './printFormatField.vue'
import RefreshButton from './refreshButton.vue'
import ReportSummary from './reportSummary.vue'
import ReportViewsField from './reportViewsField.vue'

export default defineComponent({
  name: 'OptionsReportViewer',

  components: {
    DownloadButton,
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

  setup(props) {
    const activeCollapse = ref(['1', '2'])

    function handleClose() {
      store.commit('setShowPanelConfig', {
        containerUuid: props.containerUuid,
        value: false
      })
      clearParameters()
    }

    function runReport() {
    }

    function clearParameters() {
      // store.dispatch('setReportDefaultValues', {
      //   containerUuid: props.containerUuid
      // })
      store.commit('setReportGenerated', {
        containerUuid: props.containerUuid
      })
    }

    return {
      // Ref
      activeCollapse,
      // Methods
      clearParameters,
      handleClose,
      runReport
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
