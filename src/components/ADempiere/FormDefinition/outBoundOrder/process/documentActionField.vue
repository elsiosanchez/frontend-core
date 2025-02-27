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
      <span style="color: #f34b4b"> * </span>
      {{ $t('form.outBoundOrder.searchCriteria.panel.documentAction') }}
    </template>
    <el-select
      v-model="currentDocumentActionValue"
      clearable
      style="width: 100%;"
      filterable
      :default-first-option="true"
      remote
    >
      <empty-option-select
        :current-value="currentDocumentActionValue"
      />
      <!-- <el-option
        v-for="item in optionsList"
        :key="item.uuid"
        :label="item.label"
        :value="item.id"
      /> -->
    </el-select>
  </el-form-item>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'

// Components and Mixins
import EmptyOptionSelect from '@/components/ADempiere/FieldDefinition/FieldSelect/emptyOptionSelect.vue'

export default defineComponent({
  name: 'DocumentActionField',

  components: {
    EmptyOptionSelect
  },

  setup() {
    const currentDocumentActionValue = ref('')
    return {
      currentDocumentActionValue
    }
  }
})
</script>
