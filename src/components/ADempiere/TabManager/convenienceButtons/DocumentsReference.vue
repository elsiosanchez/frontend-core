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
      style="margin-left: 5px;padding-top: 1px;padding-right: 5px;padding-bottom: 8px;padding-left: 5px;"
      @click="openPanel"
    >
      <svg-icon
        style="font-size: 21px;"
        icon-class="document-relations"
      />
    </el-button>

    <el-dialog
      :visible.sync="documentRelationsShow"
      :before-close="openPanel"
    >
      <span
        slot="title"
      >
        <p style="text-align: center;">
          <b>
            {{ isLoading + $t('window.containerInfo.referenceRecords') + '( ' + tabAttributes.name + ' )' }}
          </b>
        </p>
      </span>
      <reference-records
        :container-uuid="tabAttributes.containerUuid"
        :table-name="tabAttributes.table_name"
        :container-manager="containerManager"
        :record-uuid="currentRecordUuid"
        :record-id="currentRecordId"
        :is-loading="isLoading"
        :references-list="referencesList"
        style="height: 100%;"
      />
    </el-dialog>
  </span>
</template>

<script>
import {
  defineComponent,
  computed,
  ref
} from '@vue/composition-api'

import store from '@/store'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

// Components and Mixins
import ReferenceRecords from '@/components/ADempiere/PanelInfo/Component/ReferenceRecords/index.vue'

export default defineComponent({
  name: 'DocumentsReference',

  components: {
    ReferenceRecords
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
      store.dispatch('getReferencesFromServer', {
        tabId: props.tabAttributes.internal_id,
        recordId: currentRecordId.value
      })
        .then(referenceResponse => {
          referencesList.value = referenceResponse
        })
        .finally(() => {
          isLoading.value = false
        })
    }

    return {
      // Ref
      documentRelationsShow,
      isLoading,
      // Computed
      currentRecordUuid,
      currentRecordId,
      referencesList,
      // Methods
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
