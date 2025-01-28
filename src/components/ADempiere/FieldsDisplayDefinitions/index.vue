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
  <component
    :is="componentRender"
    :field-metadata="field"
    :current-record="currentRecord"
    :display-value="displayValue"
    :current-display-definition="currentDisplayDefinition"
    :update-attribute="updateField"
  >
    <template v-slot:button-exit>
      <slot name="button" />
    </template>
  </component>
</template>

<script>
import {
  defineComponent,
  computed
  // ref
} from '@vue/composition-api'
// import lang from '@/lang'
// import store from '@/store'
// Utils and Helper Methods
// import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'FieldsDisplayDefinitions',

  props: {
    field: {
      type: Object,
      required: true
    },
    currentDisplayDefinition: {
      type: Object,
      required: false
    },
    currentRecord: {
      type: Object,
      required: false
    },
    displayValue: {
      type: String,
      required: false
    },
    updateField: {
      type: Function,
      required: false
    }
  },

  setup(props) {
    const componentRender = computed(() => {
      let fieldComponent
      switch (props.field.componentPath) {
        case 'FieldText':
          fieldComponent = () => import('@/components/ADempiere/FieldsDisplayDefinitions/FieldText.vue')
          break
        case 'FieldDate':
          fieldComponent = () => import('@/components/ADempiere/FieldsDisplayDefinitions/FieldDate.vue')
          break
      }

      return fieldComponent
    })

    return {
      componentRender
    }
  }
})
</script>
