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
  <div v-if="!isEmptyValue(storedReportOutput)" key="report-viewer-loaded" style="min-height: inherit;">
    <el-row type="flex" style="min-height: inherit;">
      <el-col :span="24">
        <div class="content">
          <title-and-help
            style="margin: 0 !important;"
            :name="name"
            :help="help"
          />
          <report-panel
            :instance-uuid="storedReportOutput.instanceUuid"
            :container-manager="containerManager"
            :report-output="storedReportOutput"
            :container-uuid="containerUuid"
          />
        </div>
      </el-col>
    </el-row>

    <modal-dialog
      :container-manager="containerManager"
      :container-uuid="containerUuid"
      :report-output="storedReportOutput"
    />

    <!--
    <el-drawer
      :visible.sync="isShowPanelConfig"
      :with-header="true"
      :before-close="handleClose"
      :show-close="true"
      class="drawer-custom"
      :title="$t('report.reportSettings')"
      :size="isMobile ? '100%' : '75%'"
    >
      <options-report-viewer
        :container-uuid="storedReportOutput.containerUuid"
        :container-manager="containerManager"
        :report-output="storedReportOutput"
        :is-show-title="false"
        :is-loading-report="isLoadingReport"
      />
    </el-drawer>
    <el-button
      v-if="!isShowPanelConfig"
      type="primary"
      icon="el-icon-arrow-left"
      circle
      style="
        top: 50%;
        right: 0%;
        position: absolute;
      "
      @click="handleOpen()"
    />
    -->
  </div>

  <loading-view
    v-else
    key="report-viewer-loading"
  />
</template>

<script>
import { defineComponent, computed, ref, onMounted } from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'

// Components and Mixins
import ActionMenu from '@/components/ADempiere/ActionMenu/index.vue'
import LoadingView from '@/components/ADempiere/LoadingView/index.vue'
import ModalDialog from '@/components/ADempiere/ModalDialog/index.vue'
import OptionsReportViewer from '@/components/ADempiere/ReportManager/SetupReport/optionsReportViewer.vue'
import ReportPanel from '@/components/ADempiere/ReportManager/reportPanel.vue'
import TitleAndHelp from '@/components/ADempiere/TitleAndHelp/index.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { containerManager } from '@/utils/ADempiere/dictionary/report'

export default defineComponent({
  name: 'ReportPrintFormatEngine',

  components: {
    ActionMenu,
    LoadingView,
    ModalDialog,
    OptionsReportViewer,
    ReportPanel,
    TitleAndHelp
  },

  setup(props, { root }) {
    const { tableName, printFormatId, printFormatUuid } = root.$route.params

    const isLoading = ref(false)
    const drawer = ref(false)

    const containerUuid = computed(() => {
      return tableName.toString()
    })

    const storedReportOutput = computed(() => {
      return store.getters.getReportOutput(printFormatUuid)
    })

    const name = computed(() => {
      if (!isEmptyValue(storedReportOutput.value) && !isEmptyValue(storedReportOutput.value.name)) {
        return storedReportOutput.value.name
      }
      return ''
    })

    const help = computed(() => {
      if (!isEmptyValue(storedReportOutput.value)) {
        return storedReportOutput.value.name
      }
      return ''
    })

    const link = computed(() => {
      return storedReportOutput.value.link
    })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const isShowPanelConfig = computed(() => {
      return store.getters.getShowPanelConfig({
        containerUuid: props.containerUuid
      })
    })

    const isLoadingReport = computed(() => {
      return store.getters.getReportIsLoading
    })

    function displayReport(reportOutput) {
      if (!reportOutput.isError) {
        isLoading.value = true
      }

      // update name in tag view
      store.dispatch('tagsView/updateVisitedView', {
        ...root.$route,
        title: `${lang.t('route.reportViewer')}: ${reportOutput.name}`
      })
    }

    function handleClose() {
      showPanelConfigReport(false)
    }

    function handleOpen() {
      showPanelConfigReport(!isShowPanelConfig.value)
    }

    function showPanelConfigReport(value) {
      store.commit('setShowPanelConfig', {
        containerUuid: props.containerUuid,
        value
      })
    }

    onMounted(() => {
      displayReport(storedReportOutput.value)
    })

    // store.dispatch('findListMailTemplates')

    return {
      containerUuid,
      printFormatId,
      printFormatUuid,
      isLoading,
      // actionsManager,
      drawer,
      isShowPanelConfig,
      // Computeds
      name,
      help,
      link,
      isMobile,
      storedReportOutput,
      containerManager,
      isLoadingReport,
      // Methods
      handleOpen,
      handleClose,
      showPanelConfigReport
    }
  }
})
</script>

<style lang="scss" scoped>
	.content {
    width: 100%;
    height: 100%;
    top: 0%;
  }
  .el-table__body-wrapper {
    position: relative;
    height: 100%;
    overflow-y: 'auto';
  }
</style>
