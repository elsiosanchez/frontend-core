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
  <span class="title-record-container">
    <el-popover
      v-if="shouldShowPopover"
      placement="top-start"
      trigger="hover"
    >
      <el-row>
        <el-col :span="24" class="popover-content">
          <el-button
            type="text"
            class="copy-button"
            icon="el-icon-document-copy"
            @click="copyContent"
          />
          {{ recordTitle }}
        </el-col>
      </el-row>

      <template #reference>
        <div style="display: inline-flex; align-items: center; gap: 4px;">
          <el-button
            v-if="recordTitle"
            type="text"
            class="copy-button"
            icon="el-icon-document-copy"
            @click="copyContent"
          />
          <span
            class="truncated-text"
            style="display: inline-block;"
          >
            {{ recordTitle }}
          </span>
        </div>
      </template>
    </el-popover>

    <template v-else>
      <div style="display: inline-flex; align-items: center; gap: 4px;">
        <el-button
          v-if="recordTitle"
          type="text"
          class="copy-button"
          icon="el-icon-document-copy"
          @click="copyContent"
        />
        {{ recordTitle }}
      </div>
    </template>
  </span>
</template>

<script>
import store from '@/store'
import { defineComponent, computed } from '@vue/composition-api'

// Constants
import { DISPLAY_COLUMN_PREFIX } from '@/utils/ADempiere/dictionaryUtils'

// Utils and helper methods
import { copyToClipboard } from '@/utils/ADempiere/coreUtils.js'
import { isEmptyValue } from '@/utils/ADempiere'

export default defineComponent({
  name: 'TitleRecord',

  props: {
    truncateLength: {
      type: Number,
      default: 30
    },
    containerUuid: {
      type: [String, Number],
      required: true
    },
    parentUuid: {
      type: String,
      required: true
    }
  },

  setup(props) {
    const currentRecord = computed(() => {
      return store.getters.getTabCurrentRow({
        containerUuid: props.containerUuid
      })
    })

    const tableName = computed(() => {
      return store.getters.getStoredTab(
        props.parentUuid,
        props.containerUuid
      ).table_name
    })

    const isParent = computed(() => {
      return (store.getters.getStoredTab(
        props.parentUuid,
        props.containerUuid
      )).isParentTab
    })

    const recordTitle = computed(() => {
      if (!isEmptyValue(currentRecord.value) && !isEmptyValue(tableName.value)) {
        const title = currentRecord.value[DISPLAY_COLUMN_PREFIX + tableName.value + '_ID']
        if (!isEmptyValue(title) && isParent.value) {
          return title.toString()
        }
        return ''
      }
      return ''
    })

    const shouldShowPopover = computed(() => {
      return recordTitle.value.length >= props.truncateLength
    })

    function copyContent() {
      copyToClipboard({
        text: recordTitle.value,
        isShowMessage: true
      })
    }

    return {
      // Computeds
      shouldShowPopover,
      recordTitle,
      // Methods
      copyContent
    }
  }
})
</script>

<style scoped>
.title-record-container {
  float: left;
}

.popover-content {
  word-break: normal;
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-button {
  padding: 0;
  margin-left: -4px;
}

.truncated-text {
  display: inline-block;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}
</style>
