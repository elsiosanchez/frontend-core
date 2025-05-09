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
      ref="fieldDate"
      v-model="value"
      unlink-panels
      :type="typePicker"
      :format="formatView"
      :picker-options="pickerOptionsDate"
      size="mini"
      :placeholder="fieldMetadata.description"
      style="padding-right: 10px;width: 100%;"
      @change="saveFieldValue(value, fieldMetadata)"
    />
    <span v-if="!isNewRecord" style="display: flex;">
      <slot name="button-exit" />
      <el-button
        v-show="value !== displayValue && !isLoading"
        style="padding: 0px;color: green;font-size: medium;font-weight: 900;"
        icon="el-icon-check"
        type="text"
        @click="updateFieldValue(value, fieldMetadata)"
      />
      <i v-if="isLoading" class="el-icon-loading" />
    </span>
  </span>
</template>

<script>
import {
  defineComponent,
  computed,
  ref,
  onMounted
} from '@vue/composition-api'

// import lang from '@/lang'
import store from '@/store'

// Constants
import {
  SHORCUTS_DATE
} from '@/utils/ADempiere/componentUtils'

// Utils and Helper Methods
import { getContext } from '@/utils/ADempiere/contextUtils'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { DATE_PLUS_TIME } from '@/utils/ADempiere/references'
import { containerManagerFieldDefinition } from '@/utils/ADempiere/displayDefinition'

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
    updateField: {
      type: Function,
      required: false
    },
    isNewRecord: {
      type: Boolean,
      required: false
    },
    additionalAttributes: {
      type: Object,
      required: false
    },
    isPanelRight: {
      type: Boolean,
      default: false
    },
    persistenceData: {
      type: Function,
      required: false
    },
    isValueBachtEntry: {
      type: [Boolean, Number, String, Object],
      required: false
    }
  },

  setup(props) {
    const value = ref('')
    const isLoading = ref(false)
    const fieldDate = ref(undefined)
    value.value = convertStringDate(props.displayValue)

    const { currentTab } = store.getters.getContainerInfo
    const { containerUuid, parentUuid } = currentTab
    const { column_name } = props.fieldMetadata

    const contextValue = computed(() => {
      return getContext({
        parentUuid,
        containerUuid,
        columnName: column_name
      })
    })

    if (props.isNewRecord) {
      loadDefaultValueFromServer()
    }

    // Computed
    const pickerOptionsDate = computed(() => {
      return {
        shortcuts: SHORCUTS_DATE
      }
    })
    const formatView = computed(() => {
      let format = ''
      const currentLanguageDefinition = store.getters['getCurrentLanguageDefinition']
      if (isEmptyValue(format)) {
        format = 'yyyy-MM-dd'
        if (!isEmptyValue(currentLanguageDefinition)) {
          const { datePattern } = currentLanguageDefinition
          if (!isEmptyValue(datePattern)) {
            format = datePattern
          }
        }
      }
      let formattedFormat = format
        .replace(/[Y]/gi, 'y')
        .replace(/[m]/gi, 'M')
        .replace(/[D]/gi, 'd')
      if (props.fieldMetadata.display_type === DATE_PLUS_TIME.id) {
        if (!isEmptyValue(currentLanguageDefinition)) {
          const { time_pattern } = currentLanguageDefinition
          if (!isEmptyValue(time_pattern)) {
            formattedFormat = formattedFormat + ' ' + time_pattern
            return formattedFormat
              .replace(/[z]/gi, '')
          }
        }
        formattedFormat = formattedFormat + ' hh:mm:ss A'
      }
      return formattedFormat
    })

    const typePicker = computed(() => {
      let picker = 'date'
      if (props.fieldMetadata.display_type === DATE_PLUS_TIME.id) {
        picker += 'time'
      }
      return picker
    })

    // Methods

    function saveFieldValue(value, field) {
      if (props.isNewRecord) {
        const dateParse = {
          type: 'date',
          value: dateToSend(value)
        }
        if (props.fieldMetadata.is_allow_copy && props.fieldMetadata.is_quick_entry) dataBachtEntry(dateParse)
        props.updateField(dateParse, props.fieldMetadata)
        return
      }
    }

    function updateFieldValue(value, field) {
      if (props.isNewRecord) {
        props.updateField(dateToSend(value), props.fieldMetadata)
        if (props.fieldMetadata.is_allow_copy || props.fieldMetadata.is_quick_entry) dataBachtEntry(value)
        return
      }
      isLoading.value = true
      containerManagerFieldDefinition.updateField({
        recordId: props.currentRecord.id,
        displyDefinitions: props.currentDisplayDefinition,
        currentTab,
        isPanelRight: props.isPanelRight,
        attributes: {
          [field.column_name]: {
            type: 'date',
            value: dateToSend(value)
          }
        }
      })
        .finally(() => {
          isLoading.value = false
          props.updateField(value, field)
        })
    }

    function convertStringDate(fecha) {
      if (isEmptyValue(fecha) || typeof fecha !== 'string') {
        return
      }
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

    function dateToSend(fecha) {
      if (isEmptyValue(fecha)) {
        return
      }
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

    /**
     * Get server default value
     */
    function loadDefaultValueFromServer() {
      const { column_name } = props.fieldMetadata
      if (!isEmptyValue(props.additionalAttributes[column_name])) {
        value.value = props.additionalAttributes[column_name].value
        saveFieldValue(props.additionalAttributes[column_name].value)
      }
    }

    function dataBachtEntry(value) {
      props.persistenceData(value, props.fieldMetadata)
    }
    console.log(props.isValueBachtEntry, { fieldMetadata: props.fieldMetadata })
    if (
      props.isNewRecord &&
      (props.fieldMetadata.is_allow_copy || props.fieldMetadata.is_quick_entry) &&
      !isEmptyValue(props.isValueBachtEntry) &&
      !isEmptyValue(props.isValueBachtEntry.value)
    ) {
      console.log(props.isValueBachtEntry.value, { fieldMetadata: props.fieldMetadata })
      value.value = props.isValueBachtEntry.value
    }
    onMounted(() => {
      if (props.fieldMetadata.sequence === 10) {
        fieldDate.value.focus()
      }
    })
    return {
      // Ref
      value,
      isLoading,
      fieldDate,
      // Computed
      contextValue,
      formatView,
      typePicker,
      pickerOptionsDate,
      // Methods
      updateFieldValue,
      saveFieldValue
    }
  }
})
</script>
