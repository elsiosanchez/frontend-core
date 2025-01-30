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
  <el-card class="box-card-display-definition" :body-style="{ padding: '0px' }">
    <div slot="header" class="clearfix">
      <p style="text-align: center;margin-top: 0px;margin-bottom: 5px;background: #e8f4ffa8;">
        <b style="font-size: larger;">
          {{ currentDisplyDefinitions.name }}
        </b>
      </p>
    </div>
    <div class="text item">
      <el-empty v-if="isEmptyValue(fields)" :description="$t('component.displayDefinition.fieldEmpty')" />
      <el-descriptions v-else class="margin-top" :column="2" direction="horizontal">
        <template
          v-for="field in fields"
        >
          <el-descriptions-item
            v-if="isDisplayField(field)"
            :key="field.sequence"
          >
            <template slot="label">
              <b>
                <span
                  v-show="field.is_mandatory"
                  style="color: red;"
                >
                  *
                </span>
                {{ field.name }}
              </b>
            </template>
            <FieldsDisplayDefinitions
              :field="field"
              :current-record="currentRecord"
              :current-display-definition="currentDisplyDefinitions"
              :update-field="updateFieldRecord"
              :is-new-record="true"
            />
          </el-descriptions-item>
        </template>
      </el-descriptions>
      <el-button
        type="primary"
        class="button-base-icon"
        icon="el-icon-check"
        style="float: right; margin-left: 10px;"
        :loading="isLoading"
        :disabled="containerManagerFieldDefinition.validateMandatoryFieldsEmpty({
          fieldList: fields,
          attributes
        }) || isLoading"
        @click="actionsSave()"
      />
      <slot name="footer-buttons" />
    </div>
  </el-card>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'
import store from '@/store'
// import language from '@/lang'
// Component
import FieldsDisplayDefinitions from '@/components/ADempiere/FieldsDisplayDefinitions'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { containerManagerFieldDefinition } from '@/utils/ADempiere/displayDefinition'

export default defineComponent({
  name: 'PanelDisplayDefinitionsNew',

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
    },
    buttonClosePanel: {
      type: Function,
      required: false
    }
  },

  setup(props) {
    // Ref
    const attributes = ref({})
    const isLoading = ref(false)

    // Computed
    const displayDefinitionMetadata = computed(() => {
      return store.getters.getDisplayTabDefinition({
        id: props.currentDisplyDefinitions.id
      })
    })

    const additionalAttributes = computed(() => {
      if (isEmptyValue(store.getters.getCurrentTabPanelDefinition)) {
        return {}
      }
      return store.getters.getCurrentTabPanelDefinition.additionalAttributes || {}
    })

    const isLoadingDisplayDefinitions = computed(() => {
      if (
        !isEmptyValue(displayDefinitionMetadata.value) &&
        !isEmptyValue(displayDefinitionMetadata.value.isLoading)
      ) {
        return displayDefinitionMetadata.value.isLoading
      }
      return false
    })

    const fields = computed(() => {
      if (
        !isEmptyValue(displayDefinitionMetadata.value) &&
        !isEmptyValue(displayDefinitionMetadata.value.fields)
      ) {
        return displayDefinitionMetadata.value.fields
      }
      return []
    })

    // Constants
    const { currentTab } = store.getters.getContainerInfo

    // Methods
    function displayValue(field) {
      if (isEmptyValue(field)) {
        return
      }
      const { value, display_value } = field
      if (!isEmptyValue(display_value)) {
        return display_value
      }
      return value
    }

    function updateFieldRecord(value, field) {
      attributes.value = {
        ...attributes.value,
        [field.column_name]: value
      }
    }

    function isDisplayField(field) {
      return containerManagerFieldDefinition.isDisplayedField({
        ...field,
        isNewRecord: true
      })
    }

    function validateMandatory() {
      return containerManagerFieldDefinition.validateMandatoryFieldsEmpty({
        fieldList: fields.value,
        attributes: attributes.value
      })
    }

    async function actionsSave() {
      isLoading.value = true
      try {
        containerManagerFieldDefinition.createNewRecord({
          displayDefinitionId: props.currentDisplyDefinitions.id,
          attributes: {
            ...additionalAttributes.value,
            ...attributes.value
          },
          currentTab
        })
        isLoading.value = false
      } catch (error) {
        isLoading.value = false
      }
    }

    return {
      // Ref
      attributes,
      isLoading,
      // computeds
      isLoadingDisplayDefinitions,
      displayDefinitionMetadata,
      fields,
      additionalAttributes,
      // methods
      actionsSave,
      displayValue,
      isDisplayField,
      validateMandatory,
      updateFieldRecord,
      containerManagerFieldDefinition
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
  .el-card__body {
    padding: 0px;
  }
}
</style>
