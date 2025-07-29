<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Ricardo Fenomeno ricardofenomeno13@gmail.com https://github.com/ricargame
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
  <div>
    <el-form-item required>
      <template slot="label">
        {{ $t('form.WTrialBalance.organization') }}
        <!-- <b style="color: #f34b4b"> * </b> -->
      </template>

      <el-select
        v-model="currentOrganizationValue"
        :placeholder="$t('form.WTrialBalance.organization')"
        style="width: 100%;"
        clearable
        filterable
        @visible-change="showListOrganization"
      >
        <empty-option-select
          :current-value="currentOrganizationValue"
          :is-allows-zero="false"
          :disabled="true"
        />

        <el-option
          v-for="item in organizationOptions"
          :key="item.id"
          :label="item.values.DisplayColumn"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  onMounted
} from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import EmptyOptionSelect from '@/components/ADempiere/FieldDefinition/FieldSelect/emptyOptionSelect.vue'

// API Request Methods
import { listOrganizations } from '@/api/ADempiere/form/TrialBalanceDrillable.js'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'OrganizationField',

  components: {
    EmptyOptionSelect
  },

  setup() {
    const organizationOptions = ref([])

    const sessionOrganizationId = computed(() => {
      return store.getters['user/getOrganization'].id
    })

    const currentOrganizationValue = computed({
      get() {
        return store.getters.getOrganization
      },
      set(value) {
        store.commit('setOrganization', value)
      }
    })

    function showListOrganization(show, search = '') {
      if (!show) {
        return
      }
      listOrganizations({
        searchValue: search
      })
        .then(response => {
          const { records } = response
          organizationOptions.value = records
        })
    }

    onMounted(() => {
      showListOrganization(true, '')

      const currentValue = currentOrganizationValue.value
      if (isEmptyValue(currentValue) || currentValue < 0) {
        currentOrganizationValue.value = sessionOrganizationId.value
      }
    })

    return {
      currentOrganizationValue,
      organizationOptions,
      showListOrganization
    }
  }
})
</script>
