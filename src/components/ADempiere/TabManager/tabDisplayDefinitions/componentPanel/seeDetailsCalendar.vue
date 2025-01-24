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
  <span class="menu-action-definitions">
    <p><strong><i class="el-icon-info" /> {{ $t('component.attachment.description') }}:  </strong>{{ currentResource.extendedProps.description }}</p>
    <p><strong><i class="el-icon-date" /> {{ $t('component.date.startDate') }}:  </strong>{{ translateDate({ value: currentResource.start, format:'long'}) }}</p>
    <p><strong><i class="el-icon-date" /> {{ $t('component.date.endDate') }}:  </strong>{{ translateDate({ value: currentResource.end, format:'long'}) }}</p>
    <span slot="footer" class="dialog-footer" style="float: right;">
      <el-button @click="closeDetails">{{ $t('component.date.close') }}</el-button>
      <slot name="footer" />
    </span>
  </span>
</template>

<script>
import {
  defineComponent
  // computed
} from '@vue/composition-api'
// Global Methods
// import language from '@/lang'
// import store from '@/store'
// Utils and Helper Methods
// import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { translateDate } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'SeeDetailsCalendar',

  props: {
    currentResource: {
      type: Object,
      required: true
    },
    isPanelRight: {
      type: Boolean,
      default: false
    },
    closeDetails: {
      type: Function,
      default: (recordPrevious) => {
        console.info('implement method Close Details ', recordPrevious)
      }
    },
    openPanelInfo: {
      type: Function,
      default: (recordPrevious) => {
        console.info('implement method Open Panel Info ', recordPrevious)
      }
    }
  },

  setup(props) {
    return {
      translateDate
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
</style>
