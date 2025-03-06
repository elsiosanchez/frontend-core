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
    <div style="height: 100% !important;">
      <el-card>
        <el-form
          :inline="true"
          label-position="top"
          class="form-base form-min-label"
        >
          <el-row :gutter="24">
            <el-col :span="6">
              <organization-field />
            </el-col>
            <el-col :span="6">
              <warehouse-field />
            </el-col>
            <el-col :span="6">
              <sales-region-field />
            </el-col>
            <el-col :span="6">
              <sales-representative-field />
            </el-col>
            <el-col :span="6">
              <movent-type-field />
            </el-col>
            <el-col :span="6">
              <document-type-field />
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
import OrganizationField from '@/components/ADempiere/FormDefinition/outBoundOrder/SearchCriteria/organizationField.vue'
import MoventTypeField from '@/components/ADempiere/FormDefinition/outBoundOrder/SearchCriteria/movementTypeField.vue'
import DocumentTypeField from '@/components/ADempiere/FormDefinition/outBoundOrder/SearchCriteria/documentTypeField.vue'
import WarehouseField from '@/components/ADempiere/FormDefinition/outBoundOrder/SearchCriteria/warehouseField.vue'
import SalesRegionField from '@/components/ADempiere/FormDefinition/outBoundOrder/SearchCriteria/salesRegionField.vue'
import SalesRepresentativeField from '@/components/ADempiere/FormDefinition/outBoundOrder/SearchCriteria/salesRepresentativeField.vue'

export default defineComponent({
  name: 'SearchCriteria',

  components: {
    OrganizationField,
    MoventTypeField,
    DocumentTypeField,
    WarehouseField,
    SalesRegionField,
    SalesRepresentativeField
  }
})

</script>

<style scoped>
.form-base .el-form-item {
  margin-bottom: 0px !important
}
</style>
