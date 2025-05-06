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
  <el-dropdown
    size="small"
    trigger="click"
    class="print-button"
    :disabled="!isShowReference"
    style="margin-left: 8px; padding-right: 9px;"
    @visible-change="searchReference"
    @command="handleCommandActions"
  >
    <el-button
      plain
      type="info"
      size="small"
      style="margin-left: 5px;padding-top: 1px;padding-right: 5px;padding-bottom: 8px;padding-left: 5px;"
    >
      <svg-icon
        style="font-size: 21px;"
        icon-class="document-relations"
      />
    </el-button>

    <el-dropdown-menu slot="dropdown">
      <span v-if="!isLoading">
        <el-dropdown-item
          v-for="(reference, index) in recordReferences.referencesList"
          :key="index"
          :command="reference"
          icon="el-icon-zoom-in"
        >
          {{ reference.display_name }}
        </el-dropdown-item>
      </span>
      <el-dropdown-item v-else icon="el-icon-loading" />
    </el-dropdown-menu>
  </el-dropdown>
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
import { zoomIn } from '@/utils/ADempiere/coreUtils.js'
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

    const isShowReference = computed(() => {
      return !isEmptyValue(props.tabAttributes) && currentRecordId.value > 0
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

    const recordReferences = computed(() => {
      const reference = store.getters.getStoredReferences({
        windowUuid: props.tabAttributes.parentUuid,
        tableName: props.tabAttributes.table_name,
        recordUuid: currentRecordUuid.value
      })
      if (!isEmptyValue(reference) && !isEmptyValue(reference.referencesList)) return reference
      return {
        referencesList: []
      }
    })

    /**
     * Methods
     */

    function loadRefrence() {
      if (!isEmptyValue(recordReferences.value) && !isEmptyValue(recordReferences.value.referencesList)) return
      isLoading.value = true
      store.dispatch('getReferencesFromServer', {
        tableName: props.tabAttributes.table_name,
        containerUuid: props.tabAttributes.containerUuid,
        tabId: props.tabAttributes.internal_id,
        parentUuid: props.tabAttributes.parentUuid,
        recordId: currentRecordId.value,
        recordUuid: currentRecordUuid.value
      })
        .finally(() => {
          isLoading.value = false
        })
    }

    function handleCommandActions(reference) {
      if (reference.window_id <= 0) {
        return
      }

      const tabParent = 0

      const containerIdentifier = 'window_' + reference.window_id
      zoomIn({
        attributeValue: containerIdentifier,
        attributeName: 'containerKey',
        query: {
          tabParent,
          referenceUuid: reference.uuid
        }
      })
    }

    function searchReference() {
      loadRefrence()
    }

    // /**
    //  * Watch - watch works directly on a ref
    //  * @param newValue - New Assessed Property value
    //  * @param oldValue - Old Assessed Property value
    //  */
    // watch(currentRecordId, (newValue, oldValue) => {
    //   if (!isEmptyValue(newValue) && newValue !== oldValue) {
    //     loadRefrence()
    //   }
    // })

    return {
      // Ref
      documentRelationsShow,
      isLoading,
      // Computed
      currentRecordUuid,
      recordReferences,
      currentRecordId,
      isShowReference,
      referencesList,
      // Methods
      handleCommandActions,
      searchReference,
      loadRefrence
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
