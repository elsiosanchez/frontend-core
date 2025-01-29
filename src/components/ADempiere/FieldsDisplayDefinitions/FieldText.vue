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
      style="padding-right: 10px;width: 200px;"
      @input="saveField(value, fieldMetadata)"
    />
    <span v-if="!isNewRecord">
      <slot name="button-exit" />
      <el-button
        v-show="value !== displayValue && !isLoading"
        style="padding: 0px;color: green;font-size: medium;font-weight: 900;"
        icon="el-icon-check"
        type="text"
        @click="updateField(value, fieldMetadata)"
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
      type: String,
      required: false
    },
    updateAttribute: {
      type: Function,
      required: false
    },
    isNewRecord: {
      type: Boolean,
      required: false
    }
  },

  setup(props) {
    const value = ref('')
    const isLoading = ref(false)
    value.value = props.displayValue || ''
    // Methods
    function saveField(value, field) {
      if (props.isNewRecord) {
        props.updateAttribute(value, props.fieldMetadata)
        return
      }
    }
    function updateField(value, field) {
      isLoading.value = true
      store.dispatch('updateField', {
        id: props.currentRecord.id,
        attributes: {
          [field.column_name]: value
        },
        displayDefinitionId: props.currentDisplayDefinition.id
      })
        .finally(() => {
          props.updateAttribute(value, props.fieldMetadata)
          store.dispatch('listDisplayDefinitionFieldsMetadata', {
            id: props.currentDisplayDefinition.id
          })
          isLoading.value = false
        })
    }

    return {
      // Ref
      value,
      isLoading,
      // Methods
      updateField,
      saveField
    }
  }
})
</script>
