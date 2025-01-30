<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A.
  Contributor(s): Elsio Sanchez elsiosanchez@gmail.com https://github.com/elsiosanchez
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
  <el-dropdown
    trigger="click"
    class="options-crud"
    @command="actionOption"
  >
    <span class="el-dropdown-link">
      <svg-icon icon-class="more-vertical" />
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item v-if="isOptionNew" command="new" icon="el-icon-plus">
        {{ $t('component.displayDefinition.cardNew') }}
      </el-dropdown-item>
      <el-dropdown-item v-if="isOptionEdit" command="view" icon="el-icon-news">
        {{ $t('component.displayDefinition.cardView') }}
      </el-dropdown-item>
      <el-popover
        v-model="showPanel"
        tigger="click"
        placement="top"
        width="450"
        :content="title"
        :title="$t('window.confirmDeleteRecord')"
      >
        <el-dropdown-item
          v-if="isOptionDelete"
          slot="reference"
          icon="el-icon-delete"
          :disabled="isDisableDelete"
          @click="showPanel = true"
        >
          {{ $t('actionMenu.deleteRecord') }}
        </el-dropdown-item>
        {{ title }}
        <div style="text-align: right; margin: 0; margin-top: 5px;">
          <el-button
            type="danger"
            class="button-base-icon"
            icon="el-icon-close"
            @click="showPanel = false"
          />
          <el-button
            type="primary"
            class="button-base-icon"
            icon="el-icon-check"
            @click="removerRecord()"
          />
        </div>
      </el-popover>
    </el-dropdown-menu>
  </el-dropdown>
</template>
<script>
import store from '@/store'

import {
  defineComponent,
  computed,
  ref
} from '@vue/composition-api'
// import store from '@/store'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'OptionsPanel',

  props: {
    currentResource: {
      type: Object,
      required: false
    },
    isPanelRight: {
      type: Boolean,
      default: false
    },
    actionOption: {
      type: Function,
      default: (recordPrevious) => {
        console.info('implement method Open Action New', recordPrevious)
      }
    },
    isOptionNew: {
      type: Boolean,
      default: false
    },
    isOptionEdit: {
      type: Boolean,
      default: false
    },
    isOptionDelete: {
      type: Boolean,
      default: false
    },
    displayDefinition: {
      type: Object,
      required: false
    }
  },
  setup(props) {
    const showPanel = ref(false)
    const title = ref(props.currentResource ? props.currentResource.title : '')
    const isDisableDelete = computed(() => {
      if (!isEmptyValue(props.currentResource)) {
        return props.currentResource.is_read_only
      }
      return false
    })
    function removerRecord() {
      showPanel.value = false
      store.dispatch('removerRecord', {
        recordId: props.currentResource.id,
        displayDefinitionId: props.displayDefinition.id
      })
    }
    return {
      isDisableDelete,
      showPanel,
      title,
      removerRecord
    }
  }
})
</script>

<style lang="scss" scoped>
.details-resource {
  padding: 5px;
  .el-dialog__header {
    padding: 20px;
    padding-bottom: 10px;
    background: #dae6f38c;
    text-align: center;
  }
}
.options-crud {
  cursor: pointer;
  z-index: 9;
}
</style>
