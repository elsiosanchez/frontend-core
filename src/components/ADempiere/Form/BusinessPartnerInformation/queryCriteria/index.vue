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
        <el-col :span="8">
          <Code />
        </el-col>
        <el-col :span="8">
          <Contact />
        </el-col>
        <el-col :span="8">
          <Phone />
        </el-col>
        <!-- <el-col :span="6">
          <CustomersOnly />
        </el-col> -->
        <el-col :span="8">
          <CompanyName />
        </el-col>
        <!-- <el-col :span="6">
          <FantasyName />
        </el-col> -->
        <el-col :span="8">
          <Email />
        </el-col>
        <el-col :span="8">
          <ZipCode />
        </el-col>
        <!-- <el-col :span="6">
          <AllOrAny />
        </el-col> -->
      </el-row>
    </el-form-item>
  </el-form>
</template>

<script>
import { defineComponent } from '@vue/composition-api'

// Component
import Code from './code.vue'
import Contact from './contact.vue'
import Phone from './phone.vue'
import CompanyName from './companyName.vue'
import FantasyName from './fantasyName.vue'
import Email from './email.vue'
import ZipCode from './zipCode.vue'
import CustomersOnly from './customersOnly.vue'
import AllOrAny from './allOrAny.vue'
export default defineComponent({
  name: 'QueryCriteria',
  components: {
    Code,
    Contact,
    Phone,
    CompanyName,
    FantasyName,
    Email,
    ZipCode,
    CustomersOnly,
    AllOrAny
  }
})
</script>
