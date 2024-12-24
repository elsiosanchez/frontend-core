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
    :label="$t('form.VAllocation.footer.charge')"
    label-width="120px"
    style="margin: 0px;padding: 0px;"
  >
    <el-select
      v-model="charges"
      style="width: 100%;"
      filterable
      clearable
      :filter-method="remoteSearchCharges"
      @visible-change="findCharges"
    >
      <empty-option-select
        :current-value="charges"
        :is-allows-zero="false"
      />

      <el-option
        v-for="item in optionsCharges"
        :key="item.id"
        :label="item.label"
        :value="item.id"
      />
    </el-select>
  </el-form-item>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

import store from '@/store'

// API Request Methods
import {
  requestListCharges
} from '@/api/ADempiere/form/VAllocation.ts'

// Components and Mixins
import EmptyOptionSelect from '@/components/ADempiere/FieldDefinition/FieldSelect/emptyOptionSelect.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'ChargeField',

  components: {
    EmptyOptionSelect
  },

  setup() {
    const optionsCharges = ref([])

    const charges = computed({
      // getter
      get() {
        const { chargeId } = store.getters.getProcess
        // return date
        return chargeId
      },
      // setter
      set(value) {
        store.commit('setProcess', {
          attribute: 'chargeId',
          value
        })
      }
    })

    function findFilter(queryString) {
      return (query) => {
        const search = queryString.toLowerCase()
        return query.label.toLowerCase().includes(search)
      }
    }

    function remoteSearchCharges(query) {
      if (!isEmptyValue(query) && query.length > 2) {
        const result = optionsCharges.value.filter(findFilter(query))
        if (isEmptyValue(result)) {
          findCharges(true, query)
        }
      }
    }

    /**
     * Methods
     */
    function findCharges(isFind, searchValue) {
      if (!isFind) {
        return
      }
      requestListCharges({
        searchValue
      })
        .then(response => {
          const { records } = response
          optionsCharges.value = records.map(currency => {
            const { id, uuid, values } = currency
            return {
              id,
              uuid,
              label: values.DisplayColumn
            }
          })
        })
    }

    return {
      optionsCharges,
      charges,
      findCharges,
      remoteSearchCharges
    }
  }
})
</script>
