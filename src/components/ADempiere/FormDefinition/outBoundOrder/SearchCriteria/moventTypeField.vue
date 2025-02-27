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
  <el-form-item
    style="width: 100%;"
  >
    <template slot="label">
      {{ $t('form.outBoundOrder.searchCriteria.moventType') }}
      <el-switch
        v-model="value"
        :inactive-text="$t('form.outBoundOrder.searchCriteria.order')"
        :active-text="$t('form.outBoundOrder.searchCriteria.distributionOrder')"
        style="display: flex; justify-content: center; height: 30px;"
      />
    </template>
  </el-form-item>
</template>

<script>
import store from '@/store'
import { defineComponent, computed } from '@vue/composition-api'

// Components and Mixins
import EmptyOptionSelect from '@/components/ADempiere/FieldDefinition/FieldSelect/emptyOptionSelect.vue'

export default defineComponent({
  name: 'OrganizationField',

  components: {
    EmptyOptionSelect
  },
  setup() {
    const value = computed({
      // getter
      get() {
        const { moventTypeId } = store.getters.getSearchFilterGenerateOrder
        return moventTypeId
      },
      // setter
      set(newValue) {
        store.commit('updateAttributeCriteriaGenerateOrder', {
          attribute: 'moventTypeId',
          value: newValue
        })
        store.commit('updateAttributeCriteriaGenerateOrder', {
          attribute: 'documentTypeId',
          value: ''
        })
      }
    })

    return {
      value
    }
  }
})
</script>
