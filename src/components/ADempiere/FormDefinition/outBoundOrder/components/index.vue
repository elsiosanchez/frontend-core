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
      <el-collapse>
        <el-collapse-item :title="$t('form.outBoundOrder.order.title')">
          <div style="height: 45%; margin-bottom: 5px; border: solid 1px lightgrey; border-radius: 10px; padding: 10px;">
            <p style="text-align: left;font-size: 12px;margin: 0px 0px 7px 0px;">
              <b> {{ $t('form.outBoundOrder.order.title') }} </b>
            </p>
            <el-card
              shadow="never"
              :body-style="{ padding: '5px' }"
            >
              <table-order />
            </el-card>
          </div>
        </el-collapse-item>
      </el-collapse>
      <div style="height: 45%; margin-bottom: 5px; border: solid 1px lightgrey; border-radius: 10px; padding: 10px;">
        <p style="text-align: left;font-size: 12px;margin: 0px 0px 7px 0px;">
          <b> {{ $t('form.outBoundOrder.select.title') }} </b>
        </p>
        <el-card
          shadow="never"
          :body-style="{ padding: '5px' }"
        >
          <table-select />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from '@vue/composition-api'
import TableOrder from './tableOrder.vue'
import TableSelect from './tableSelect.vue'
export default defineComponent({
  name: 'Component',
  components: {
    TableOrder,
    TableSelect
  }
})
</script>
