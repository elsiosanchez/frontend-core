<template>
  <div>
    <!-- <el-dialog
      :visible.sync="showModal"
      width="500px"
      :before-close="closeModal"
    >
      <template #title>
        <span>{{ selection.title }}</span>
      </template>
      <div>
        <p><strong><i class="el-icon-info" /> {{ $t('component.attachment.description') }}:  </strong>{{ selection.description }}</p>
        <p><strong><i class="el-icon-date" /> {{ $t('component.date.startDate') }}:  </strong>{{ translateDate({ value: selection.start, format:'long'}) }}</p>
        <p><strong><i class="el-icon-date" /> {{ $t('component.date.endDate') }}:  </strong>{{ translateDate({ value: selection.end, format:'long'}) }}</p>
      </div>
      <template #footer>
        <el-button @click="closeModal">Cerrar</el-button>
        <el-button v-if="!isPanel" @click="showPanel(selection.value )">{{ $t('component.date.seeDetails') }}</el-button>
      </template>
    </el-dialog> -->
    <el-dialog
      :title="selection.title"
      :visible.sync="showModal"
      :before-close="closeModal"
      custom-class="details-resource"
    >
      <p><strong><i class="el-icon-info" /> {{ $t('component.attachment.description') }}:  </strong>{{ selection.description }}</p>
      <p><strong><i class="el-icon-date" /> {{ $t('component.date.startDate') }}:  </strong>{{ translateDate({ value: selection.start, format:'long'}) }}</p>
      <p><strong><i class="el-icon-date" /> {{ $t('component.date.endDate') }}:  </strong>{{ translateDate({ value: selection.end, format:'long'}) }}</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeModal">{{ $t('component.date.close') }}</el-button>
        <el-button @click="showPanel(selection.value)">{{ $t('component.date.seeDetails') }}</el-button>
      </span>
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

<style lang='scss'>
.details-resource {
  padding: 5px;
  .el-dialog__header {
    padding: 20px;
    padding-bottom: 10px;
    background: #dae6f38c;
    text-align: center;
  }
}
</style>
