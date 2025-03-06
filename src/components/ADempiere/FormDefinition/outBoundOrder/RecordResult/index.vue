<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Ricardo Fenomeno ricardofenomeno13@gmail.com https://github.com/ricargame
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
  <div style="display: contents; height: 100% !important">
    <div style="height: 90% !important;">
      <el-collapse v-model="activeNames">
        <el-collapse-item name="header">
          <template slot="title">
            <b>{{ $t('form.outBoundOrder.header.title') }}</b>
          </template>

          <div style="height: 45%; margin-bottom: 5px; border: solid 1px lightgrey; border-radius: 10px; padding: 10px;">
            <table-header />
          </div>
        </el-collapse-item>
      </el-collapse>

      <div
        :height="lineHeigth"
        style="margin-bottom: 5px; border: solid 1px lightgrey; border-radius: 10px; padding: 10px;"
      >
        <p style="text-align: left;font-size: 12px;margin: 0px 0px 7px 0px;">
          <b> {{ $t('form.outBoundOrder.lines.title') }} </b>
        </p>
        <el-card
          shadow="never"
          :body-style="{ padding: '5px' }"
        >
          <table-line
            :is-expand-header="!isEmptyValue(activeNames)"
          />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

// Components and Mixins
import TableHeader from './tableHeader.vue'
import TableLine from './tableLines.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'RecordResult',

  components: {
    TableHeader,
    TableLine
  },

  setup() {
    const activeNames = ref(['header'])

    const lineHeigth = computed(() => {
      if (isEmptyValue(activeNames.value)) {
        return '90%'
      }
      return '46%'
    })

    return {
      activeNames,
      lineHeigth
    }
  }
})
</script>
