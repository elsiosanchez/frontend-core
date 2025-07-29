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
        {{ $t('form.WTrialBalance.untilPeriod') }}
        <b style="color: #f34b4b"> * </b>
      </template>

      <el-select
        v-model="untilPeriod"
        :placeholder="$t('form.WTrialBalance.untilPeriod')"
        style="width: 100%;"
        clearable
        filterable
        @visible-change="showListPeriods"
      >
        <empty-option-select
          :current-value="untilPeriod"
          :is-allows-zero="false"
          :disabled="true"
        />

        <el-option
          v-for="item in untilPeriodOptions"
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
import { listPeriods } from '@/api/ADempiere/form/TrialBalanceDrillable.js'

export default defineComponent({
  name: 'PeriodField',

  components: {
    EmptyOptionSelect
  },

  setup() {
    const untilPeriodOptions = ref([])

    const untilPeriod = computed({
      get() {
        return store.getters.getPeriod
      },
      set(value) {
        store.commit('setPeriod', value)
      }
    })

    function showListPeriods(show, search = '') {
      if (!show) {
        return
      }
      listPeriods({
        searchValue: search
      })
        .then(response => {
          const { records } = response
          untilPeriodOptions.value = records
        })
    }

    return {
      untilPeriod,
      untilPeriodOptions,
      showListPeriods
    }
  }
})
</script>
