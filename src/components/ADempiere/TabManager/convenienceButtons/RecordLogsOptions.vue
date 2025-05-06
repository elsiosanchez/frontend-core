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
  <span>
    <el-button
      v-if="!isEmptyValue(tabAttributes) && currentRecordId > 0"
      plain
      type="info"
      size="small"
      @click="openPanel"
    >
      <svg-icon
        icon-class="tree-table"
      />
    </el-button>

    <el-dialog
      :visible.sync="documentRelationsShow"
      :before-close="openPanel"
      width="70%"
    >
      <span
        slot="title"
      >
        <p style="text-align: center;margin: 0px">
          <b>
            {{ $t('window.containerInfo.log.changeHistory') }}
          </b>
        </p>
      </span>
      <el-card shadow="never">
        <record-logs
          :container-uuid="tabAttributes.containerUuid"
          :table-name="tabAttributes.table_name"
          :container-manager="containerManager"
          :record-uuid="currentRecordUuid"
          :record-id="currentRecordId"
          :is-loading="isLoading"
          :logs="listLogs"
          style="height: 100%;"
        />
      </el-card>
    </el-dialog>
  </span>
</template>

<script>
import {
  defineComponent,
  computed,
  watch,
  ref
} from '@vue/composition-api'

import store from '@/store'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

// Components and Mixins
import RecordLogs from '@/components/ADempiere/PanelInfo/Component/RecordLogs'

export default defineComponent({
  name: 'RecordLogsOptions',

  components: {
    RecordLogs
  },

  props: {
    parentUuid: {
      type: [String, Number],
      required: false
    },
    containerManager: {
      type: Object,
      required: true
    },
    tabAttributes: {
      type: Object,
      default: () => ({})
    }
  },

  setup(props, { root }) {
    /**
     * Ref
     */
    const documentRelationsShow = ref(false)
    const isLoading = ref(false)
    const referencesList = ref({})

    /**
     * Const
     */
    /**
     * Computed
     */

    const listLogs = computed(() => {
      return store.getters.getRecordLogs
    })

    const currentRecordUuid = computed(() => {
      if (!isEmptyValue(props.tabAttributes)) {
        return store.getters.getUuidOfContainer(props.tabAttributes.containerUuid)
      }
      return ''
    })

    // Current Record ID
    const currentRecordId = computed(() => {
      if (!isEmptyValue(props.tabAttributes)) {
        return store.getters.getIdOfContainer({
          containerUuid: props.tabAttributes.containerUuid,
          tableName: props.tabAttributes.table_name
        })
      }
      return -1
    })

    /**
     * Methods
     */

    function openPanel() {
      documentRelationsShow.value = !documentRelationsShow.value
      isLoading.value = true
      store.dispatch('listRecordLogs', {
        tableName: props.tabAttributes.table_name,
        recordUuid: currentRecordUuid.value,
        recordId: currentRecordId.value
      })
        .finally(() => {
          isLoading.value = false
        })
    }

    function loadRecordLogs(params) {
      store.dispatch('listRecordLogs', {
        tableName: props.tabAttributes.table_name,
        recordUuid: currentRecordUuid.value,
        recordId: currentRecordId.value
      })
    }

    /**
     * Watch - watch works directly on a ref
     * @param newValue - New Assessed Property value
     * @param oldValue - Old Assessed Property value
     */
    watch(currentRecordId, (newValue, oldValue) => {
      if (!isEmptyValue(newValue) && newValue !== oldValue) {
        loadRecordLogs()
      }
    })

    return {
      // Ref
      documentRelationsShow,
      isLoading,
      // Computed
      currentRecordUuid,
      currentRecordId,
      referencesList,
      listLogs,
      // Methods
      loadRecordLogs,
      openPanel
    }
  }
})
</script>

<style lang="scss">
.print-button {
  &.el-dropdown {
    .el-button {
      padding-top: 3px;
      color: #909399;
      padding-bottom: 3px;
      background: #f4f4f5;
      border-color: #d3d4d6;

      &:hover {
        // as button success without plain
        background: #909399;
        border-color: #909399;
        color: #fff;
      }
    }
  }
}
</style>
