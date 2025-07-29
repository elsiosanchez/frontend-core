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
    <el-form-item>
      <template slot="label">
        {{ $t('form.WTrialBalance.budget') }}
      </template>

      <el-select
        v-model="budget"
        :placeholder="$t('form.WTrialBalance.budget')"
        style="width: 100%;"
        clearable
        filterable
        @visible-change="showListBudgets"
      >
        <empty-option-select
          :current-value="budget"
          :is-allows-zero="false"
          :disabled="false"
        />

        <el-option
          v-for="item in budgetOptions"
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
  computed
} from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import EmptyOptionSelect from '@/components/ADempiere/FieldDefinition/FieldSelect/emptyOptionSelect.vue'

// API Request Methods
import { listBudgets } from '@/api/ADempiere/form/TrialBalanceDrillable.js'

export default defineComponent({
  name: 'BudgetField',

  components: {
    EmptyOptionSelect
  },

  setup() {
    const budgetOptions = ref([])

    const budget = computed({
      get() {
        return store.getters.getBudget
      },
      set(value) {
        store.commit('setBudget', value)
      }
    })

    function showListBudgets(show, search = '') {
      if (!show) {
        return
      }
      listBudgets({
        searchValue: search
      })
        .then(response => {
          const { records } = response
          budgetOptions.value = records
        })
    }

    return {
      budget,
      budgetOptions,
      showListBudgets
    }
  }
})
</script>
