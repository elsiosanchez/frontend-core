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
  <div style="display: contents; height: 100% !important;">
    <div style="height: 100% !important">
      <el-card>
        <el-form
          :inline="true"
          label-position="top"
          class="form-base form-min-label"
        >
          <el-row :gutter="24">
            <el-col :span="6">
              <document-date-field />
            </el-col>
            <el-col :span="6">
              <ship-date-field />
            </el-col>
            <el-col :span="6">
              <document-action-field />
            </el-col>
            <el-col :span="6">
              <locator-field />
            </el-col>
            <el-col :span="6">
              <target-document-type-field />
            </el-col>
            <el-col :span="6">
              <delivery-rule-field />
            </el-col>
            <el-col :span="6">
              <delivery-via-field />
            </el-col>
            <el-col :span="6">
              <shipper-field />
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import {
  defineComponent
} from '@vue/composition-api'

// Components and Mixins
import DocumentDateField from './documentDateField.vue'
import ShipDateField from './shipDateField.vue'
import DocumentActionField from './documentActionField.vue'
import LocatorField from './locatorField.vue'
import TargetDocumentTypeField from '@/components/ADempiere/FormDefinition/outBoundOrder/process/targetDocumentTypeField.vue'
import DeliveryRuleField from '@/components/ADempiere/FormDefinition/outBoundOrder/process/deliveryRuleField.vue'
import ShipperField from '@/components/ADempiere/FormDefinition/outBoundOrder/process/shipperField.vue'
import DeliveryViaField from '@/components/ADempiere/FormDefinition/outBoundOrder/process/deliveryViaField.vue'

export default defineComponent({
  name: 'Process',

  components: {
    DocumentActionField,
    DocumentDateField,
    ShipDateField,
    LocatorField,
    ShipperField,
    TargetDocumentTypeField,
    DeliveryRuleField,
    DeliveryViaField
  }
})
</script>
