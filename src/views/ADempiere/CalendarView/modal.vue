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

export default defineComponent({
  name: 'ModalCalendar',
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
    return {
      showModal,
      selection,
      closeModal,
      translateDate
    }
  }
})
</script>
