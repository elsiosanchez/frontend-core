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
  <span>
    <el-date-picker
      v-model="value"
      type="date"
      unlink-panels
      :picker-options="pickerOptionsDate"
      size="mini"
      :placeholder="fieldMetadata.description"
      style="padding-right: 10px;"
    />
    <slot name="button-exit" />
    <el-button
      v-show="value !== displayValue && !isLoading"
      style="padding: 0px;color: green;font-size: medium;font-weight: 900;"
      icon="el-icon-check"
      type="text"
      @click="updateField(value, fieldMetadata)"
    />
    <i v-if="isLoading" class="el-icon-loading" />
  </span>
</template>

<script>
import {
  defineComponent,
  computed,
  ref
} from '@vue/composition-api'

// import lang from '@/lang'
import store from '@/store'

// Constants
import {
  SHORCUTS_DATE
} from '@/utils/ADempiere/componentUtils'

// Utils and Helper Methods
// import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'FieldDate',

  props: {
    fieldMetadata: {
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
    }
  },

  setup(props) {
    const value = ref('')
    const isLoading = ref(false)
    value.value = convertirFecha(props.displayValue)

    // Computed
    const pickerOptionsDate = computed(() => {
      return {
        shortcuts: SHORCUTS_DATE
      }
    })

    // Methods

    function updateField(value, field) {
      isLoading.value = true
      store.dispatch('updateField', {
        id: props.currentRecord.id,
        attributes: {
          [field.column_name]: convertirFechaSend(value)
        },
        displayDefinitionId: props.currentDisplayDefinition.id
      })
        .catch(() => {
          isLoading.value = false
        })
        .finally(() => {
          props.updateAttribute(value, props.fieldMetadata)
          store.dispatch('listDisplayDefinitionFieldsMetadata', {
            id: props.currentDisplayDefinition.id
          })
          isLoading.value = false
        })
    }

    function convertirFecha(fecha) {
      // Dividir la fecha en partes
      const partes = fecha.split('/')

      // Asegurarse de que la fecha tiene el formato correcto
      if (partes.length !== 3) {
        throw new Error('Formato de fecha incorrecto. Debe ser DD/MM/YYYY')
      }

      // Reorganizar las partes
      const dia = partes[0]
      const mes = partes[1]
      const anio = partes[2]

      // Crear la nueva fecha en el formato YYYY/MM/DD
      const nuevaFecha = `${anio}/${mes}/${dia}`

      return nuevaFecha
    }

    function convertirFechaSend(fecha) {
      // Crear un objeto Date a partir de la cadena de fecha
      const fechaObj = new Date(fecha)

      // Obtener el día, mes y año
      const dia = String(fechaObj.getDate()).padStart(2, '0') // Asegurarse de que el día tenga 2 dígitos
      const mes = String(fechaObj.getMonth() + 1).padStart(2, '0') // Los meses son 0-indexados
      const anio = fechaObj.getFullYear()

      // Formatear la fecha en el formato DD/MM/YYYY
      const fechaFormateada = `${dia}-${mes}-${anio}`

      return fechaFormateada
    }

    return {
      // Ref
      value,
      isLoading,
      // Computed
      pickerOptionsDate,
      // Methods
      updateField
    }
  }
})
</script>
