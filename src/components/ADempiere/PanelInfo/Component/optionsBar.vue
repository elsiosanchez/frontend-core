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
  <div style="line-height: 1.2; font-size: 14px; color: #303133; border-bottom: 1px solid #d0d7de; margin-right: 10px; margin-left: 8px; ">
    <span style="line-height: 1.2; font-size: 12px; color: #303133; margin-left: 2px;">
      <svg-icon :icon-class="icon" />
      <span style="font-weight: bold;">
        {{ title }}
      </span>
      <div style="color: rgb(130, 132, 138);">
        {{ description }}
      </div>
    </span>
  </div>
</template>

<script>
import {
  defineComponent
} from '@vue/composition-api'
export default defineComponent({
  name: 'OptionsBar',
  props: {
    title: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: false
    },
    icon: {
      type: String,
      required: false
    }
  }
})
</script>
