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
  <el-dialog
    :visible.sync="showDialog"
    :center="true"
    :modal="true"
    class="custom-dialog-business"
    width="90%"
    top="10vh"
    :title="$t('form.businessPartnerInformation.titleDialog')"
  >
    <span>
      <info-business />
      <el-divider
        style="margin: 0px !important; padding:0px !important"
      />
      <tab-panel />
    </span>
  </el-dialog>
</template>

<script>
import store from '@/store'
import { defineComponent, computed } from '@vue/composition-api'
import InfoBusiness from '@/components/ADempiere/Form/BusinessPartnerInformation/dialog/infoBusiness.vue'
import TabPanel from '@/components/ADempiere/Form/BusinessPartnerInformation/tabPanel'
export default defineComponent({
  name: 'ShowDialogBusiness',
  components: {
    InfoBusiness,
    TabPanel
  },
  setup() {
    const showDialog = computed({
      set(newValue) {
        store.commit('showDialogBusiness', newValue)
      },
      get() {
        return store.getters.getShowDialog
      }
    })
    return {
      showDialog
    }
  }
})
</script>
