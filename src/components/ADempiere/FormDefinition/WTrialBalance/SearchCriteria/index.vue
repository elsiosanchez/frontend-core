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
  <el-card class="box-card">
    <el-collapse v-model="activeCollapse">
      <el-collapse-item name="1">
        <template slot="title">
          <b style="font-size: 18px">
            {{ $t('report.preference') }}
            <i style="font-size: 18px;" class="el-icon-s-operation" />
          </b>
        </template>

        <el-row :gutter="20">
          <el-form class="form-bases form-min-label" size="smalls">
            <el-col :span="6">
              <organization-field />
            </el-col>

            <el-col :span="6">
              <period-field />
            </el-col>

            <el-col :span="6">
              <report-cube-field />
            </el-col>

            <el-col :span="6">
              <budget-field />
            </el-col>

            <el-col :span="8">
              <accounting-key-field />
            </el-col>

            <el-col :span="8">
              <show-buttom-wtrial-balance
                :header-list="headerList"
                :metadata="metadata"
              />
            </el-col>
          </el-form>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<script>
import {
  defineComponent,
  // computed,
  ref
} from '@vue/composition-api'

// import store from '@/store'

// Components and Mixins
import AccountingKeyField from './accountingKeyField.vue'
import BudgetField from './budgetField.vue'
import OrganizationField from './organizationField.vue'
import PeriodField from './periodField.vue'
import ReportCubeField from './reportCubeField.vue'
import showButtomWtrialBalance from './showButtom'

export default defineComponent({
  name: 'optionsWtrialBalance',

  components: {
    AccountingKeyField,
    BudgetField,
    OrganizationField,
    PeriodField,
    ReportCubeField,
    showButtomWtrialBalance
  },

  props: {
    headerList: {
      type: Array,
      required: false
    },
    metadata: {
      type: Object,
      default: () => {}
    }
  },

  setup() {
    const activeCollapse = ref()

    return {
      activeCollapse
    }
  }
})

</script>

<style lang="scss">
.box-card.el-card {
  .el-card__body {
    padding-top: 0px;
    padding-bottom: 0px;

    .el-collapse-item__content {
      padding-bottom: 0px;
    }
  }
}
</style>
