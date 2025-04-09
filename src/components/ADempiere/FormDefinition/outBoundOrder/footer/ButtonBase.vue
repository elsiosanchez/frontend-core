<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/ElsioSanchez
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
  <el-button
    :type="type"
    :size="size"
    :plain="plain"
    :style="styleButton"
    :disabled="disabled"
    :loading="loading"
    class="button-base-icon"
    @click="acttionButton"
  >
    <span v-show="!loading">
      <i v-if="!isEmptyValue(icon)" :class="icon" />
      <svg-icon v-else :icon-class="svg" />
    </span>
  </el-button>
</template>

<script>
// import { isEmptyValue } from '@/utils/ADempiere'

export default {
  name: 'ButtonBase',
  props: {
    type: {
      type: String,
      default: 'default'
    },
    size: {
      type: String,
      default: ''
    },
    plain: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    disabled: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    loading: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    icon: {
      type: String,
      default: ''
    },
    svg: {
      type: String,
      default: ''
    },
    styleButton: {
      type: String,
      default: ''
    },
    acttionButton: {
      type: Function,
      default: () => {
        return console.info('implement Actions Button Method')
      }
    }
  }
}
</script>

<style scoped>
.button-base-icon {
  margin-right: 8px; /* Espaciado entre botones */
}
</style>
