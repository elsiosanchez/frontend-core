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
  <span>
    <el-switch
      v-model="fieldValue"
      :placeholder="fieldMetadata.description"
      :active-text="$t('components.switchActiveText')"
      :inactive-text="$t('components.switchInactiveText')"
      size="mini"
      @change="saveFieldValue(fieldValue, fieldMetadata)"
    />

    <span v-if="!isNewRecord">
      <slot name="button-exit" />
      <el-button
        v-show="fieldValue !== displayValue && !isLoading"
        style="padding: 0px;color: green;font-size: medium;font-weight: 900;"
        icon="el-icon-check"
        type="text"
        @click="updateFieldValue(fieldValue, fieldMetadata)"
      />
      <i v-if="isLoading" class="el-icon-loading" />
    </span>
  </span>
</template>

<script>
import {
  defineComponent,
  // computed
  ref
} from '@vue/composition-api'

import store from '@/store'

// Utils and Helper Methods
import { convertStringToBoolean } from '@/utils/ADempiere/formatValue/booleanFormat.js'
import { containerManagerFieldDefinition } from '@/utils/ADempiere/displayDefinition'

export default defineComponent({
  name: 'FieldYesNo',

  props: {
    fieldMetadata: {
      type: Object,
      required: true
    },
    currentDisplayDefinition: {
      type: Object,
      required: false
    },
    currentRecord: {
      type: Object,
      required: false
    },
    displayValue: {
      type: [String, Boolean],
      required: false
    },
    updateField: {
      type: Function,
      required: false
    },
    isNewRecord: {
      type: Boolean,
      required: false
    },
    isPanelRight: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    if (props.isNewRecord) {
      saveFieldValue(false)
    }

    const fieldValue = ref(
      convertStringToBoolean(
        props.displayValue
      )
    )
    const isLoading = ref(false)

    // Methods
    function saveFieldValue(value, field) {
      if (props.isNewRecord) {
        props.updateField(value, props.fieldMetadata)
        return
      }
    }
    const { currentTab } = store.getters.getContainerInfo

    function updateFieldValue(value, field) {
      isLoading.value = true
      containerManagerFieldDefinition.updateField({
        recordId: props.currentRecord.id,
        displyDefinitions: props.currentDisplayDefinition,
        currentTab,
        isPanelRight: props.isPanelRight,
        attributes: {
          [field.column_name]: value
        }
      })
        .finally(() => {
          isLoading.value = false
          props.updateField(value, field)
        })
    }

    return {
      fieldValue,
      isLoading,
      saveFieldValue,
      updateFieldValue
    }
  }
})
</script>
