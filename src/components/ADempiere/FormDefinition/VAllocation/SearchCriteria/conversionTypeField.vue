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
  <el-form-item
    style="width: 100%;"
    :required="true"
  >
    <template slot="label">
      {{ $t('form.VAllocation.searchCriteria.conversionType') }}
      <!-- <span style="color: #f34b4b"> * </span> -->
    </template>

    <el-select
      v-model="currentConversionTypeValue"
      clearable
      style="width: 100%;"
      filterable
      :default-first-option="true"
      remote
      :remote-method="remoteSearchConversionTypes"
      @visible-change="loadConversionTypes"
    >
      <empty-option-select
        :current-value="currentConversionTypeValue"
        :is-allows-zero="true"
        :disabled="true"
      />

      <el-option
        v-for="item in optionsConversionTypes"
        :key="item.id"
        :label="item.label"
        :value="item.id"
      />
    </el-select>
  </el-form-item>
</template>

<script>
import { computed, defineComponent, onMounted } from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import EmptyOptionSelect from '@/components/ADempiere/FieldDefinition/FieldSelect/emptyOptionSelect.vue'

// API Request Methods
import {
  requestListConversionTypes
} from '@/api/ADempiere/form/VAllocation.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'ConversionTypeField',

  components: {
    EmptyOptionSelect
  },

  setup() {
    const sessionConversionTypeId = computed(() => {
      return store.getters.getSessionContextConversionTypeId
    })

    const currentConversionTypeValue = computed({
      // getter
      get() {
        const { conversionTypeId } = store.getters.getSearchFilter
        return conversionTypeId
      },
      // setter
      set(id) {
        // store.commit('setConversionType', id)
        store.commit('updateAttributeCriteriaVallocation', {
          attribute: 'conversionTypeId',
          criteria: 'searchCriteria',
          value: id
        })
      }
    })

    const optionsConversionTypes = computed({
      // getter
      get() {
        const { listConversionTypes } = store.getters.getSearchFilter
        return listConversionTypes
      },
      // setter
      set(list) {
        store.commit('updateAttributeCriteriaVallocation', {
          attribute: 'listConversionTypes',
          criteria: 'searchCriteria',
          value: list
        })
        // store.commit('setBusinessPartner', id)
      }
    })

    function loadConversionTypes(isFind, searchValue) {
      if (!isFind) {
        return
      }
      requestListConversionTypes({
        searchValue
      })
        .then(response => {
          const { records } = response
          const formatedList = records.map(conversionType => {
            const { id, uuid, name, is_default } = conversionType
            return {
              id,
              uuid,
              label: name,
              is_default
            }
          })
          optionsConversionTypes.value = formatedList
        })
    }

    function remoteSearchConversionTypes(searchValue) {
      // if (!isEmptyValue(searchValue) && searchValue.length > 1) {
      //   const result = optionsConversionTypes.value.filter((textValue) => {
      //     const search = searchValue.toLowerCase()
      //     return textValue.label.toLowerCase().includes(search)
      //   })
      //   if (isEmptyValue(result)) {
      //     loadConversionTypes(true, searchValue)
      //   }
      // }
      loadConversionTypes(true, searchValue)
    }

    onMounted(() => {
      loadConversionTypes(true, '')

      const currentValue = currentConversionTypeValue.value
      if (isEmptyValue(currentValue) || currentValue <= 0) {
        currentConversionTypeValue.value = sessionConversionTypeId.value
      }
    })

    return {
      // Computeds
      sessionConversionTypeId,
      currentConversionTypeValue,
      optionsConversionTypes,
      // Methods
      loadConversionTypes,
      remoteSearchConversionTypes
    }
  }
})
</script>
