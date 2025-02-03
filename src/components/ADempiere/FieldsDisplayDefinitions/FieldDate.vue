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
      style="padding-right: 10px;width: 200px;"
      @change="saveField(value, fieldMetadata)"
    />
    <span v-if="!isNewRecord">
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
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

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
      type: [String, Date, Boolean],
      required: false
    },
    updateAttribute: {
      type: Function,
      required: false
    },
    isNewRecord: {
      type: Boolean,
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

    function saveField(value, field) {
      if (props.isNewRecord) {
        const dateParse = {
          type: 'date',
          value: convertirFechaSend(value)
        }
        props.updateAttribute(dateParse, props.fieldMetadata)
        return
      }
    }

    function updateField(value, field) {
      if (props.isNewRecord) {
        props.updateAttribute(convertirFechaSend(value), props.fieldMetadata)
        return
      }
      isLoading.value = true
      store.dispatch('updateField', {
        id: props.currentRecord.id,
        attributes: {
          [field.column_name]: {
            type: 'date',
            value: convertirFechaSend(value)
          }
        },
        displayDefinitionId: props.currentDisplayDefinition.id
      })
        .catch(() => {
          isLoading.value = false
        })
        .finally(() => {
          props.updateAttribute(value, props.fieldMetadata)
          isLoading.value = false
        })
    }

    function convertirFecha(fecha) {
      if (isEmptyValue(fecha) || typeof fecha !== 'string') return
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
      if (isEmptyValue(fecha)) return
      // Crear un objeto Date a partir de la cadena de fecha
      const fechaObj = new Date(fecha)

      // Obtener el año, mes y día
      const anio = fechaObj.getUTCFullYear() // Obtener el año en UTC
      const mes = String(fechaObj.getUTCMonth() + 1).padStart(2, '0') // Mes en UTC (0-indexado)
      const dia = String(fechaObj.getUTCDate()).padStart(2, '0') // Día en UTC

      // Obtener la hora, minutos, segundos y milisegundos
      const horas = String(fechaObj.getUTCHours()).padStart(2, '0')
      const minutos = String(fechaObj.getUTCMinutes()).padStart(2, '0')
      const segundos = String(fechaObj.getUTCSeconds()).padStart(2, '0')
      const milisegundos = String(fechaObj.getUTCMilliseconds()).padStart(3, '0')

      // Formatear la fecha en el formato YYYY-MM-DDTHH:mm:ss.sssZ
      const fechaFormateada = `${anio}-${mes}-${dia}T${horas}:${minutos}:${segundos}.${milisegundos}Z`

      return fechaFormateada
    }

    return {
      // Ref
      value,
      isLoading,
      // Computed
      pickerOptionsDate,
      // Methods
      updateField,
      saveField
    }
  }
})
</script>
