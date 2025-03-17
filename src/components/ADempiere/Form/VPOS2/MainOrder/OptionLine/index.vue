<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
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
  <p style="margin: 0px;text-align: center;">
    <info-line
      :info-line="line"
      :is-processed="validateProcess"
      style="padding: 0px 5px;"
    />
    <edit-line
      :edit-line="line"
      :is-processed="validateProcess"
      style="padding: 0px 5px;"
    />
    <el-button
      v-if="!isEmptyValue(line)"
      type="text"
      style="margin-left: 2px;font-size: 12px;padding: 0px 5px;color: #ff4949;"
      :disabled="line.isLoading || validateProcess"
      @click="deleteLine()"
    >
      <i v-if="!line.isLoading" class="el-icon-delete" />
      <i v-else class="el-icon-loading" />
    </el-button>
  </p>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
// Components and Mixins
import infoLine from '@/components/ADempiere/Form/VPOS2/MainOrder/OptionLine/infoLine'
import editLine from '@/components/ADempiere/Form/VPOS2/MainOrder/OptionLine/editLine/index.vue'

export default defineComponent({
  name: 'OptionLine',
  components: {
    infoLine,
    editLine
  },
  props: {
    line: {
      type: Object,
      default: () => {}
    }
  },
  setup(props) {
    const currentOrder = computed(() => {
      return store.getters.getCurrentOrder
    })

    const validateProcess = computed(() => {
      const { is_processed, is_processing } = currentOrder.value
      return is_processed || is_processing
    })

    function deleteLine() {
      props.line.isLoading = true
      store.dispatch('deleteCurrentLine', {
        lineId: props.line.id
      })
    }
    return {
      currentOrder,
      validateProcess,
      deleteLine
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
