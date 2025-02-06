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
    <el-input
      v-model="value"
      :placeholder="fieldMetadata.description"
      size="mini"
      :rows="4"
      :type="typeTextBox"
      style="padding-right: 10px;width: 200px;"
      @input="saveFieldValue(value, fieldMetadata)"
    />
    <span v-if="!isNewRecord">
      <slot name="button-exit" />
      <el-button
        v-show="value !== displayValue && !isLoading"
        style="padding: 0px;color: green;font-size: medium;font-weight: 900;"
        icon="el-icon-check"
        type="text"
        @click="updateFieldValue(value, fieldMetadata)"
      />
      <i v-if="isLoading" class="el-icon-loading" />
    </span>
  </span>
</template>

<script>
import {
  defineComponent,
  computed,
  ref
} from '@vue/composition-api'

// import lang from '@/lang'
import store from '@/store'

// Constants
import { TEXT } from '@/utils/ADempiere/references'

// Utils and Helper Methods
import { getContext } from '@/utils/ADempiere/contextUtils'
import { containerManagerFieldDefinition } from '@/utils/ADempiere/displayDefinition'
import { isEmptyValue } from '@/utils/ADempiere'

export default defineComponent({
  name: 'FieldText',

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
    const value = ref('')
    const isLoading = ref(false)
    value.value = props.displayValue || ''

    const { currentTab } = store.getters.getContainerInfo
    const { containerUuid, parentUuid } = currentTab
    const { column_name } = props.fieldMetadata

    const getContextValue = computed(() => {
      return getContext({
        columnName: column_name,
        containerUuid,
        parentUuid
      })
    })

    if (props.isNewRecord && props.isPanelRight && !isEmptyValue(getContextValue.value)) {
      value.value = getContextValue.value
    }

    const typeTextBox = computed(() => {
      // String, Url, FileName...
      let typeInput = 'text'
      // Display Type 'Text' (14)
      if (props.fieldMetadata.display_type === TEXT.id) {
        typeInput = 'textarea'
      }
      if (props.fieldMetadata.is_encrypted) {
        typeInput = 'password'
      }
      return typeInput
    })

    // Methods
    function saveFieldValue(value, field) {
      if (props.isNewRecord) {
        props.updateField(value, props.fieldMetadata)
        return
      }
    }

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
      // Ref
      value,
      isLoading,
      // Computeds
      typeTextBox,
      getContextValue,
      // Methods
      updateFieldValue,
      saveFieldValue
    }
  }
})
</script>
