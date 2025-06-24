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
  <el-form-item>
    <template slot="label">
      {{ $t('form.outBoundOrder.process.charterOrder') }}
    </template>

    <el-switch
      v-model="value"
      :active-text="$t('form.outBoundOrder.process.yes')"
      :inactive-text="$t('form.outBoundOrder.process.no')"
      style="display: flex; justify-content: center; height: 36px;"
    />
  </el-form-item>
</template>

<script>
import store from '@/store'
import { defineComponent, computed } from '@vue/composition-api'

// Components and Mixins
import EmptyOptionSelect from '@/components/ADempiere/FieldDefinition/FieldSelect/emptyOptionSelect.vue'

// Constants

export default defineComponent({
  name: 'CharterOrderField',

  components: {
    EmptyOptionSelect
  },
  setup() {
    const value = computed({
      // getter
      get() {
        const { charterOrder } = store.getters.getSearchFilterGenerateOrder
        return charterOrder
      },
      // setter
      set(newValue) {
        if (newValue) {
          store.commit('updateAttributeCriteriaGenerateOrder', {
            attribute: 'charterOrder',
            value: newValue
          })
        } else {
          store.commit('clearFiltersFreightOrder')
        }
      }
    })

    return {
      value
    }
  }
})
</script>
