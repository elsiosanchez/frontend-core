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
      <svg-icon
        icon-class="more-vertical"
      />
    </span>
    <el-dropdown-menu slot="dropdown">
      <!-- <el-dropdown-item command="new" icon="el-icon-plus">
        {{ $t('component.displayDefinition.cardNew') }}
      </el-dropdown-item> -->
      <el-dropdown-item command="view" icon="el-icon-news">
        {{ $t('component.displayDefinition.cardView') }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import {
  defineComponent
  // computed
} from '@vue/composition-api'

// Utils and Helper Methods

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
