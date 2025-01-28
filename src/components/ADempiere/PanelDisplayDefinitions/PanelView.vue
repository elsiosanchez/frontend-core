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
  <el-card class="box-card-display-definition">
    <div slot="header" class="clearfix">
      <p style="text-align: center;margin-top: 7px;margin-bottom: 0px;">
        <b style="font-size: larger;">
          {{ title }}
        </b>
        <br>
        <span style="text-align: center;margin: 0px;font-size: 12px;">
          {{ description }}
        </span>
      </p>
    </div>
    <div>
      <el-empty v-if="isEmptyValue(fields)" :description="$t('component.displayDefinition.fieldEmpty')" />
      <el-descriptions v-else class="margin-top" :column="2" direction="horizontal">
        <el-descriptions-item
          v-for="field in fields"
          :key="field.sequence"
        >
          <template slot="label">
            <b> {{ field.name }} </b>
          </template>
          <span v-if="!field.is_show_components">
            {{ displayValue(currentRecord.fields[field.column_name]) }}
            <el-button
              v-show="field.is_update_record && !field.is_show_components"
              style="padding: 0px;"
              icon="el-icon-edit"
              type="text"
              @click="ShowFieldComponent(field)"
            />
          </span>
          <span v-else>
            <FieldsDisplayDefinitions
              :field="field"
              :current-record="currentRecord"
              :current-display-definition="currentDisplyDefinitions"
              :display-value="displayValue(currentRecord.fields[field.column_name])"
              :update-field="updateFieldRecord"
            >
              <template v-slot:button>
                <el-button
                  style="padding: 0px;color: red;font-size: medium;font-weight: 900;"
                  icon="el-icon-close"
                  type="text"
                  @click="hiddenFieldComponent(field)"
                />
              </template>
            </FieldsDisplayDefinitions>
          </span>
        </el-descriptions-item>
      </el-descriptions>
      <slot name="footer-buttons" />
    </div>
  </el-card>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

import store from '@/store'

// Component
import FieldsDisplayDefinitions from '@/components/ADempiere/FieldsDisplayDefinitions'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'PanelDisplayDefinitions',

  components: {
    FieldsDisplayDefinitions
  },

  props: {
    parentUuid: {
      type: [String, Number],
      default: undefined
    },
    containerUuid: {
      type: [String, Number],
      required: false
    },
    containerManager: {
      type: Object,
      required: true
    },
    currentDisplyDefinitions: {
      type: Object,
      required: true
    },
    currentRecord: {
      type: Object,
      required: false
    }
  },

  setup(props) {
    // Ref
    const showButton = ref(false)
    // Computed
    const title = computed(() => {
      return props.currentRecord.title || ''
    })

    const description = computed(() => {
      return props.currentRecord.description || ''
    })

    const displayDefinitionMetadata = computed(() => {
      return store.getters.getDisplayTabDefinition({ id: props.currentDisplyDefinitions.id, recordId: props.currentRecord.id })
    })

    const fields = computed(() => {
      if (
        !isEmptyValue(displayDefinitionMetadata.value) &&
        !isEmptyValue(displayDefinitionMetadata.value.fields)
      ) {
        const fields = displayDefinitionMetadata.value.fields
        return fields
      }
      return []
    })

    function displayValue(field) {
      if (isEmptyValue(field)) return
      const { value, display_value } = field
      if (!isEmptyValue(display_value)) return display_value
      return value
    }

    function ShowFieldComponent(field) {
      field.is_show_components = true
    }

    function hiddenFieldComponent(field) {
      field.is_show_components = false
    }

    function updateFieldRecord(value, field) {
      props.currentRecord.fields[field.column_name].value = value
      hiddenFieldComponent(field)
    }

    return {
      // Ref
      showButton,
      // Computeds
      title,
      fields,
      displayDefinitionMetadata,
      description,
      // Methods
      displayValue,
      updateFieldRecord,
      ShowFieldComponent,
      hiddenFieldComponent
    }
  }
})
</script>

<style lang="scss">
.box-card-display-definition {
  width: 100%;
  height: 100%;
  overflow: auto;
  .el-card__header {
    padding: 0px;
  }
}
</style>
