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
    <el-input-number
      v-model="value"
      controls-position="right"
      :placeholder="fieldMetadata.description"
      size="mini"
      :precision="precision"
      class="field-number"
      style="margin-right: 5px; width: 200px;"
      @input="saveFieldValue(value, fieldMetadata)"
      @focus="selectContent"
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

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere'
import { getContext } from '@/utils/ADempiere/contextUtils'
import { containerManagerFieldDefinition } from '@/utils/ADempiere/displayDefinition'

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
      type: [String, Number],
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
    },
    persistenceData: {
      type: Function,
      required: false
    },
    isValueBachtEntry: {
      type: [Boolean, Number, String, Object],
      default: false
    }
  },

  setup(props) {
    const value = ref(null)
    const isLoading = ref(false)
    const { fields } = props.currentRecord

    const currentValue = computed(() => {
      if (props.isNewRecord) return 0
      return fields[props.fieldMetadata.column_name].value.value
    })

    const precision = computed(() => {
      // regular expression to find the digits after the decimal point
      if (props.isNewRecord) return 2
      const decimalPart = currentValue.value.match(/\.(\d+)/)
      if (!decimalPart) {
        return 0
      }
      return decimalPart[1].length
    })
    value.value = Number(currentValue.value) || null

    const { currentTab } = store.getters.getContainerInfo
    const { containerUuid, parentUuid } = currentTab
    const { column_name } = props.fieldMetadata

    const contextValue = computed(() => {
      return getContext({
        parentUuid,
        containerUuid,
        columnName: column_name
      })
    })

    if (props.isNewRecord && props.isPanelRight && !isEmptyValue(contextValue.value)) {
      value.value = contextValue.value
    }

    // Methods
    function saveFieldValue(value, field) {
      if (props.isNewRecord) {
        props.updateField(value, props.fieldMetadata)
        if (props.fieldMetadata.is_allow_copy && props.fieldMetadata.is_quick_entry) dataBachtEntry(value)
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
    function selectContent(event) {
      event.target.select()
    }

    function dataBachtEntry(value) {
      props.persistenceData(value, props.fieldMetadata)
    }

    if (
      props.isNewRecord &&
      props.fieldMetadata.is_allow_copy &&
      props.fieldMetadata.is_quick_entry &&
      !isEmptyValue(props.isValueBachtEntry)
    ) {
      value.value = props.isValueBachtEntry
    }

    return {
      // Ref
      value,
      isLoading,
      // Computed
      precision,
      contextValue,
      currentValue,
      // Methods
      updateFieldValue,
      saveFieldValue,
      selectContent
    }
  }
})
</script>

<style scope lang="scss">
.field-number {
  &.el-input-number, &.el-input {
    .el-input__inner {
      text-align-last: end !important;
    }
  }
}
</style>
