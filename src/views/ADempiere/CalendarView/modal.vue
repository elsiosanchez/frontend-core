<template>
  <div>
    <el-dialog
      :visible.sync="showModal"
      width="500px"
      :before-close="closeModal"
    >
      <template #title>
        <span>{{ selection.title }}</span>
      </template>
      <div>
        <p><strong><i class="el-icon-date" /> Fecha de Inicio:  </strong>{{ translateDate({ value: selection.start, format:'long'}) }}</p>
        <p><strong><i class="el-icon-date" /> Fecha de Cierre:  </strong>{{ translateDate({ value: selection.end, format:'long'}) }}</p>
        <p><strong><i class="el-icon-info" /> Descripcion:  </strong>{{ selection.description }}</p>
        <p><strong><i class="el-icon-info" /> Value:  </strong>{{ selection.value }}</p>
      </div>
      <template #footer>
        <el-button @click="closeModal">Cerrar</el-button>
        <el-button v-if="!isPanel" @click="showPanel(selection.value )">Detalles</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import store from '@/store'
import {
  defineComponent,
  computed
} from '@vue/composition-api'
import { translateDate } from '@/utils/ADempiere/formatValue/dateFormat'
import { isEmptyValue, setRecordPath } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'ModalCalendar',
  props: {
    isPanel: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    const showModal = computed(() => {
      return store.getters.getShowModal
    })
    const selection = computed(() => {
      return store.getters.getSelectedDate
    })
    function closeModal() {
      store.commit('setShowModal', false)
    }
    const showContainerInfo = computed(() => {
      return store.getters.getShowLogs
    })
    function showPanel(id) {
      if (!isEmptyValue(id) && typeof id !== 'function') {
        setRecordPath({
          recordId: id
        })
      }
      closeModal()
      store.commit('setShowLogs', !showContainerInfo.value)
    }

    return {
      showContainerInfo,
      showModal,
      selection,
      closeModal,
      translateDate,
      showPanel
    }
  }
})
</script>
