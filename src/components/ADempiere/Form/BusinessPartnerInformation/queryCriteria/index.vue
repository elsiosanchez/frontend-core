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
  <el-form
    label-position="top"
    label-width="10px"
    size="mini"
    class="form-base"
    @submit.native.prevent="notSubmitForm"
  >
    <el-form-item>
      <el-row :gutter="10">
        <el-col :span="6">
          <value-field />
        </el-col>

        <el-col :span="6">
          <contact-field />
        </el-col>

        <el-col :span="6">
          <phone-field />
        </el-col>

        <el-col :span="3">
          <customer-field />
        </el-col>
        <el-col :span="3">
          <vendor-field />
        </el-col>

        <el-col :span="6">
          <name-field />
        </el-col>

        <el-col :span="6">
          <email-field />
        </el-col>

        <el-col :span="6">
          <zip-code-field />
        </el-col>

        <el-col :span="6">
          <group-field />
        </el-col>
      </el-row>
    </el-form-item>
  </el-form>
</template>

<script>
import { defineComponent } from '@vue/composition-api'

// Components and Mixins
import ContactField from './contactField.vue'
import CustomerField from './customerField.vue'
import EmailField from './emailField.vue'
import GroupField from './groupField'
import NameField from './nameField.vue'
import PhoneField from './phoneField.vue'
import ValueField from './valueField.vue'
import VendorField from './vendorField.vue'
import ZipCodeField from './zipCodeField.vue'

export default defineComponent({
  name: 'QueryCriteria',

  components: {
    ContactField,
    CustomerField,
    EmailField,
    GroupField,
    NameField,
    PhoneField,
    ValueField,
    VendorField,
    ZipCodeField
  }
})
</script>
