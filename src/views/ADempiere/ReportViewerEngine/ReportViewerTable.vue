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

          <report-panel-table
            :instance-uuid="storedReportOutput.instanceUuid"
            :container-manager="containerManagerReportViwer"
            :report-output="storedReportOutput"
            :container-uuid="containerUuid"
          />
        </div>
      </el-col>
    </el-row>

    <!-- <modal-dialog
      :container-manager="containerManagerReportViwer"
      :container-uuid="containerUuid"
      :report-output="storedReportOutput"
    /> -->

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
        :container-uuid="containerUuid"
        :container-manager="containerManagerReportViwer"
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
  </div>

  <loading-view
    v-else
    key="report-viewer-loading"
  />
</template>

<script>
import {
  defineComponent, computed, nextTick, ref, onMounted
} from '@vue/composition-api'

import lang from '@/lang'
import router from '@/router'
import store from '@/store'

// Components and Mixins
import ActionMenu from '@/components/ADempiere/ActionMenu/index.vue'
import LoadingView from '@/components/ADempiere/LoadingView/index.vue'
// import ModalDialog from '@/components/ADempiere/ModalDialog/index.vue'
import OptionsReportViewer from '@/components/ADempiere/ReportManager/SetupReportTable/optionsReportViewer.vue'
import ReportPanelTable from '@/components/ADempiere/ReportManager/reportPanelTable.vue'
import TitleAndHelp from '@/components/ADempiere/TitleAndHelp/index.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { containerManager } from '@/utils/ADempiere/dictionary/report'
import { isHiddenField } from '@/utils/ADempiere/references'

export default defineComponent({
  name: 'ReportViewerTable',

  components: {
    ActionMenu,
    LoadingView,
    // ModalDialog,
    OptionsReportViewer,
    ReportPanelTable,
    TitleAndHelp
  },

  setup(props, { root }) {
    const { tableName, printFormatId, printFormatUuid } = root.$route.params

    const isLoading = ref(false)
    const drawer = ref(false)

    const containerUuid = computed(() => {
      return tableName.toString()
    })

    const tableFiltersList = computed(() => {
      return store.getters.getSelectionColumnsList({
        tableName: containerUuid.value
      })
    })

    // const storedPanelReport = computed(() => {
    //   return store.getters.getModalDialogManager({
    //     containerUuid: containerUuid.value
    //   })
    // })

    const storedReportOutput = computed(() => {
      return store.getters.getReportOutput(tableName)
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
        containerUuid: containerUuid.value
      })
    })

    const isLoadingReport = computed(() => {
      return store.getters.getReportIsLoading
    })

    const containerManagerReportViwer = computed(() => {
      // const modalDialogStored = storedPanelReport.value
      // if (!isEmptyValue(modalDialogStored) && !isEmptyValue(modalDialogStored.containerManager)) {
      //   return {
      //     ...containerManager,
      //     ...modalDialogStored.containerManager,
      //     generateReport
      //   }
      // }
      return {
        ...containerManager,
        generateReport,

        getFieldsList({ containerUuid }) {
          return store.getters.getSelectionColumnsList({
            tableName: containerUuid
          })
        },
        getFieldsToHidden: ({ parentUuid, containerUuid, fieldsList, showedMethod, isEvaluateDefaultValue, isTable }) => {
          return store.getters.getSelectionColumnsList({
            tableName: containerUuid
          })
        },

        actionPerformed: ({ field, value }) => {
          // without logics
        },

        setDefaultValues: ({ containerUuid }) => {
          store.dispatch('setTableDefaultValues', {
            tableName: containerUuid
          })
        },
        isDisplayedField({ display_type }) {
          // button field not showed
          if (isHiddenField(display_type)) {
            return false
          }

          // verify if field is active
          return true
        },
        isDisplayedDefault: ({ isShowedFromUser }) => {
          return isShowedFromUser
        },
        isReadOnlyField: ({ is_read_only }) => {
          return false
        },
        isMandatoryField: ({ is_mandatory }) => {
          return false
        },

        changeFieldAttribure({
          containerUuid,
          columnName,
          attributeName,
          attributeValue
        }) {
          return store.dispatch('changeTableFieldAttribute', {
            containerUuid,
            columnName,
            attributeName,
            attributeValue
          })
        },
        changeFieldShowedFromUser({ containerUuid, fieldsShowed }) {
          store.dispatch('changeTableFieldShowedFromUser', {
            containerUuid,
            fieldsShowed
          })
        },

        /**
         * @returns Promisse with value and displayedValue
         */
        getDefaultValue({ parentUuid, containerUuid, uuid, id, contextColumnNames, columnName, value }) {
          return store.dispatch('getDefaultValueFromServer', {
            parentUuid,
            containerUuid,
            contextColumnNames,
            id,
            columnId: id,
            uuid,
            columnUuid: uuid,
            //
            columnName,
            value
          })
        },
        getLookupList({ parentUuid, containerUuid, contextColumnNames, id, uuid, searchValue, isAddBlankValue = false, blankValue }) {
          return store.dispatch('getLookupListFromServer', {
            parentUuid,
            containerUuid,
            contextColumnNames,
            columnId: id,
            columnUuid: uuid,
            searchValue,
            // app attributes
            isAddBlankValue,
            blankValue
          })
        },
        getSearchDefinition({ parentUuid, containerUuid, contextColumnNames, tableName, columnName, uuid, id }) {
          return store.dispatch('getSearchFieldsFromServer', {
            parentUuid,
            containerUuid,
            contextColumnNames,
            uuid,
            columnId: id,
            tableName,
            columnName
          })
        },
        getSearchRecordsList({ parentUuid, containerUuid, contextColumnNames, tableName, columnName, id, filters, searchValue, pageNumber, pageSize }) {
          return store.dispatch('getSearchRecordsFromServer', {
            parentUuid,
            containerUuid,
            contextColumnNames,
            columnId: id,
            tableName,
            columnName,
            filters,
            searchValue,
            pageNumber,
            pageSize
          })
        },

        warehouseLocatorSearch({
          containerUuid,
          parentUuid,
          warehouseId,
          contextColumnNames,
          contextAttributesList,
          id,
          searchValue,
          // tableName,
          // columnName,
          pageNumber,
          pageSize
        }) {
          return store.dispatch('listWarehouseLocatorsFromServer', {
            containerUuid,
            parentUuid,
            warehouseId,
            contextColumnNames,
            contextAttributesList,
            columnId: id,
            searchValue,
            // tableName,
            // columnName,
            pageNumber,
            pageSize
          })
        },

        searchFieldZoom({
          id,
          columnName,
          tabTableName,
          valueField
        }) {
          return store.dispatch('getListZoomWindowsRequest', {
            column_id: id,
            column_name: columnName,
            table_name: tabTableName,
            valueField
          })
        }
      }
    })

    function generateReport() {
      const reportGenerated = store.getters.getReportGenerated(containerUuid.value)

      store.dispatch('printViewByTable', {
        tableName: containerUuid.value || root.$route.params.tableName,
        recordId: reportGenerated.recordId,
        // filters: reportOutputParams,
        printFormatId: reportGenerated.printFormatId,
        // instanceUuid: defaultParams.instance_id,
        reportViewId: reportGenerated.reportViewId,
        isSummary: reportGenerated.isSummary,
        pageNumber: reportGenerated.pageNumber,
        pageSize: reportGenerated.pageSize
      })
        .then(response => {
          const findTagViwer = store.getters.visitedViews.find(tag => {
            if (isEmptyValue(root.$route) || isEmptyValue(root.$route.params)) {
              return false
            }
            return tag.instanceUuid === root.$route.params.instanceUuid
          })
          if (!isEmptyValue(findTagViwer)) {
            store.dispatch('tagsView/delCachedView', findTagViwer)
              .then(() => {
                const { fullPath } = findTagViwer
                nextTick(() => {
                  router.replace({
                    path: '/redirect' + fullPath
                  })
                })
              })
          }
        })
      store.commit('setShowPanelConfig', {
        containerUuid: containerUuid.value,
        value: false
      })
    }

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

    function loadTableFilters() {
      if (isEmptyValue(tableName)) {
        return
      }
      if (!isEmptyValue(tableFiltersList.value)) {
        return
      }
      store.dispatch('getSelectionColumnsFromServer', {
        tableName: tableName
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
        containerUuid: containerUuid.value,
        value
      })
    }

    onMounted(() => {
      displayReport(storedReportOutput.value)
      loadTableFilters()
    })

    return {
      containerUuid,
      tableName,
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
      containerManagerReportViwer,
      isLoadingReport,
      // Methods
      handleOpen,
      handleClose
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
