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
      class="field-number"
      style="margin-right: 5px; width: 200px;"
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
  // computed
  ref
} from '@vue/composition-api'

// import lang from '@/lang'
import store from '@/store'

// Utils and Helper Methods
// import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

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
    }
  },

  setup(props) {
    const value = ref(null)
    const isLoading = ref(false)
    value.value = props.displayValue || null

    // Methods
    function saveFieldValue(value, field) {
      if (props.isNewRecord) {
        props.updateField(value, props.fieldMetadata)
        return
      }
    }

    function updateFieldValue(value, field) {
      isLoading.value = true
      store.dispatch('updateField', {
        id: props.currentRecord.id,
        isResource: props.currentDisplayDefinition.is_resource,
        attributes: {
          [field.column_name]: value
        },
        displayDefinitionId: props.currentDisplayDefinition.id
      })
        .then(response => {
          props.updateField(response, field)
        })
        .finally(() => {
          isLoading.value = false
        })
    }

    return {
      // Ref
      value,
      isLoading,
      // Methods
      updateFieldValue,
      saveFieldValue
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
