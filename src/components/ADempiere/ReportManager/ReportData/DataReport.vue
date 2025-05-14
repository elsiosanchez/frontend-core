<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/ElsioSanchez
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
  <div @click="!showPopover">
    <el-card class="container-report-engine">
      <data-table
        :container-uuid="containerUuid"
        :instance-uuid="instanceUuid"
        :report-output="reportOutput"
        :container-manager="containerManagerReportViwer"
      />

      <div>
        <data-footer
          :container-uuid="containerUuid"
          :instance-uuid="instanceUuid"
          :report-output="reportOutput"
          :container-manager="containerManagerReportViwer"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  defineComponent,
  computed,
  ref
} from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import DataFooter from '@/components/ADempiere/ReportManager/ReportData/DataFooter.vue'
import DataTable from '@/components/ADempiere/ReportManager/ReportData/DataTable.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

export default defineComponent({
  name: 'DataReport',

  components: {
    DataFooter,
    DataTable
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
    // Ref
    const showPopover = ref(false)

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

    function handleRowClick(row) {
      if (row.children && row.children.length > 0) {
        // tableReportEngine.value.toggleRowExpansion(row)
        showPopover.value = false
      }
    }

    return {
      // Refs
      showPopover,
      // Components
      storedPanelReport,
      containerManagerReportViwer,
      // Methods
      handleRowClick
    }
  }
})
</script>

<style lang="scss">
.table-report-engine {
  .el-icon-arrow-right {
    display: none;
  }
  .success-row .el-icon-arrow-right{
    display: block !important;
  }
  .el-table__indent{
    padding-left: 0 !important;
  }
}
.container-report-engine .el-card__body {
  padding-left: 20px !important;
  padding-right: 20px !important;
  padding-top: 20px !important;
  padding-bottom: 5px !important;
}
:root {
  --level-offset: 20px;
}

.el-table__row--level-[n] {
  transform: translateX(calc(var(--level-offset) * var(--level, 1)));
}
.expanded {
  border-left: 3px solid #ddd;
  height: 50%;
  position: absolute;
  left: 0;
  top: 0;
  border-bottom: 5px solid transparent;
  border-top: 5px solid #ddd;
  width: 0;
  height: 0;
  position: absolute;
  left: -5px;
}

.arrow-right {
  position: absolute;
  bottom: -6px;
  left: 100%;
  margin-left: 5px;
  width: 5px;
  height: 5px;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 8px solid #ddd;
  content: '';
}
.last-child-row {
    border-bottom: 1px solid #afaeae !important;
}
.el-table .success-row {
  font-weight: 700;
  background: #ecf5ff;
}
.el-table .children-row .cell .el-dropdown {
  color: #000
}
.reportInfo .el-popover {
  width: 850px !important;
}
.reportInfo .el-popover .el-descriptions-item__container .el-descriptions-item__content{
  display: flex;
  justify-content: flex-end;
  margin-right:20px;
}
.el-table th.el-table__cell > .cell{
  padding-left: 5px !important;
  padding-right: 5px !important;
}
</style>
