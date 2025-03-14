<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
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
  <el-card
    v-if="isLoading"
    shadow="never"
  >
    <!-- <el-row v-if="!isEmptyValue(localFields)">
      <el-col
        v-for="(group, keyGroup) in localFields"
        :key="keyGroup"
        :span="24"
      >
        <fieldset style="padding: 0.35em 0.75em 0.625em;border-radius: 6px;border: 1px solid #1890ff7a;">
          <legend>{{ group.title }}</legend>
          <el-form
            label-position="top"
            label-width="100px"
            size="small"
            class="field-component-display-definition"
          >
            <span
              v-for="field in group.fields"
              :key="field.sequence"
            >
              <el-col :span="sizeSpan(group.fields)">
                <el-form-item
                  :label="field.name"
                  :required="field.isMandatory"
                  style="padding: 0px !important;"
                  class="label-field-title-display-definition"
                >
                  <fields-display-definitions
                    ref="fieldsDisplay"
                    :field="field"
                    :current-record="currentCustomer"
                    :display-value="currentRecord[field.column_name]"
                    :current-display-definition="currentDisplyDefinitions"
                    :update-field="updateFieldRecord"
                    :persistence-data="persistenceBachtEntry"
                    :additional-attributes="{}"
                    :is-new-record="true"
                    :is-panel-right="false"
                  />
                </el-form-item>
              </el-col>
            </span>
          </el-form>
        </fieldset>
      </el-col>
    </el-row> -->
    <!-- <customer-data-edit
      :customer="currentCustomer"
    /> -->
    <panel
      :all-customer-addresses="currentCustomer.addresses"
      :customer="currentCustomer"
    />
    <el-row :gutter="24">
      <el-col :span="24">
        <samp style="float: right; padding-right: 10px;">
          <el-button
            type="danger"
            class="button-base-icon"
            icon="el-icon-close"
            @click="close()"
          />
          <el-button
            type="primary"
            class="button-base-icon"
            icon="el-icon-check"
            @click="updateBP()"
          />
        </samp>
      </el-col>
    </el-row>
  </el-card>

  <loading-view
    v-else
    key="panel-loading"
    style="min-height: 250px !important;"
  />
</template>

<script>
import {
  defineComponent,
  computed,
  // watch,
  ref
} from '@vue/composition-api'

import store from '@/store'
import language from '@/lang'

// Components and Mixins
import CustomerDataEdit from './CustomerDataEdit.vue'
import Panel from './Panel.vue'
import LoadingView from '@/components/ADempiere/LoadingView/index.vue'
import FieldsDisplayDefinitions from '@/components/ADempiere/FieldsDisplayDefinitions'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'UpdateCustomer',
  components: {
    FieldsDisplayDefinitions,
    CustomerDataEdit,
    LoadingView,
    Panel
  },
  setup() {
    const localFields = ref([])
    const attributes = ref({})
    // Computed
    const recordId = computed(() => {
      return store.getters.getBusinessPartnerId
    })

    const currentDisplyDefinitions = computed(() => {
      return store.getters.getDisplayDefinition
    })
    const currentCustomer = computed(() => {
      return store.getters.getBusinessPartnerDefinition({ recordId: recordId.value })
    })

    const isLoading = computed(() => {
      return store.getters.getBusinessPartnerDefinitionLoading({ recordId: recordId.value })
    })

    const currentRecord = computed(() => {
      return {
        title: currentCustomer.name,
        fields: [
          {
            Name: { value: currentCustomer.name },
            Value: { value: currentCustomer.value }
          }
        ]
      }
    })

    function close() {
      store.commit('setShowBusinessPartner', false)
    }

    const fields = computed(() => {
      let fieldList
      if (
        !isEmptyValue(store.getters.getDisplayDefinition) &&
        !isEmptyValue(store.getters.getDisplayDefinition.field_definitions)
      ) {
        fieldList = store.getters.getDisplayDefinition.field_definitions
      }

      if (
        !isEmptyValue(fieldList)
      ) {
        return fieldList.filter(field => field.is_displayed && field.is_insert_record)
      }
      return []
    })

    localFields.value = groupAndSortFields(fields.value)

    function groupAndSortFields(fields) {
      const grouped = fields.reduce((acc, field) => {
        const groupKey = field.field_group ? field.field_group.name : language.t('field.noGroup')
        if (!acc[groupKey]) {
          acc[groupKey] = []
        }
        acc[groupKey].push(field)
        return acc
      }, {})

      Object.keys(grouped).forEach(group => {
        grouped[group].sort((a, b) => a.sequence - b.sequence)
      })

      const result = Object.keys(grouped)
        .filter(group => group !== language.t('field.noGroup'))
        .map(group => ({
          title: group,
          fields: grouped[group]
        }))

      if (grouped[language.t('field.noGroup')]) {
        result.push({
          title: language.t('field.noGroup'),
          fields: grouped[language.t('field.noGroup')]
        })
      }

      return result
    }

    function updateBP() {
      const fields = store.getters.getFieldsBusinessPartner
      store.dispatch('updateBPartner', {
        ...currentCustomer.value,
        ...fields,
        recordId: recordId.value,
        // additionalAttributes: attributes.value,
        displayDefinitionId: currentCustomer.value.displayDefinitionId
      })
    }

    function sizeSpan(quantityFields) {
      if (quantityFields.length <= 1) {
        return 24
      } else if (quantityFields.length <= 2) {
        return 12
      } else if (quantityFields.length <= 3) {
        return 8
      } else if (quantityFields.length >= 4) {
        return 6
      }
    }

    function updateFieldRecord(value, field) {
      attributes.value = {
        ...attributes.value,
        [field.column_name]: value
      }
    }

    return {
      localFields,
      // Computed
      currentDisplyDefinitions,
      currentRecord,
      fields,
      currentCustomer,
      isLoading,
      recordId,
      close,
      updateBP,
      sizeSpan,
      updateFieldRecord
    }
  }
})
</script>
