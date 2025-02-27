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
  <div style="display: contents;">
    <div style="height: 6% !important;padding: 0px 15px;">
      <el-steps :active="currentStep" finish-status="success">
        <el-step
          v-for="(list, key) in stepList"
          :key="key"
          :title="list.name"
        />
      </el-steps>
    </div>
    <div style="height: 80% !important; padding: 0px 15px">
      <search-criteria
        v-show="'searchCriteria' === stepList[currentStep].key"
        :metadata="metadata"
      />
      <components
        v-show="'order' === stepList[currentStep].key"
      />
      <process
        v-show="'process' === stepList[currentStep].key"
      />
      <div style="height: 14% !important;text-align: end;padding: 0px 15px;">
        <el-button
          v-if="'order' === stepList[currentStep].key || 'process' === stepList[currentStep].key"
          type="primary"
          class="button-base-icon"
          icon="el-icon-s-grid"
          @click="showPanel = true"
        />
        <el-button
          v-if="'order' === stepList[currentStep].key"
          type="success"
          class="button-base-icon"
          icon="el-icon-refresh-right"
          size="small"
          @click="refreshRecords();"
        />
        <el-button
          v-if="'order' === stepList[currentStep].key || 'process' === stepList[currentStep].key"
          type="danger"
          class="button-base-icon"
          icon="el-icon-close"
          @click="currentStep--"
        />
        <el-button
          v-if="'order' === stepList[currentStep].key"
          type="primary"
          class="button-base-icon"
          icon="el-icon-check"
          @click="nextStep"
        />
      </div>
    </div>
    <div v-show="currentStep <= 0" style="height: 14% !important;text-align: end;padding: 0px 15px;">
      <el-button
        type="success"
        class="button-base-icon"
        icon="el-icon-arrow-right"
        :disabled="!isDisabled"
        @click="nextStep"
      />
    </div>
    <el-drawer
      :visible.sync="showPanel"
      :show-close="true"
      :with-header="true"
      :size="isMobile ? '100%' : '50%'"
      :title="$t('form.outBoundOrder.productInfo.title')"
    >
      <info-panel />
      <panel />
    </el-drawer>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'

// Components and Mixins
import SearchCriteria from './SearchCriteria/index.vue'
import Components from './components/index.vue'
import Process from './process/index.vue'
import InfoPanel from './components/infopanel.vue'
// import Summary from './components/Summary'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

/**
 * Based on:
 * org.compiere.apps.form.Allocation
 * org.compiere.apps.form.VAllocation
 * org.adempiere.webui.apps.form.WAllocation
 */
export default defineComponent({
  name: 'outBoundOrder',

  components: {
    SearchCriteria,
    Components,
    Process,
    InfoPanel
  },

  props: {
    metadata: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  setup() {
    /**
     * Refs
     */
    const showPanel = ref(false)
    const stepList = ref([
      {
        name: lang.t('form.outBoundOrder.step.searchCriteria'),
        description: '',
        key: 'searchCriteria'
      },
      {
        name: lang.t('form.outBoundOrder.step.order'),
        description: '',
        key: 'order'
      },
      {
        name: lang.t('form.outBoundOrder.step.process'),
        description: '',
        key: 'process'
      }
    ])
    const isDisabled = computed(() => {
      const { organizationId, warehouseId } = store.getters.getSearchFilterGenerateOrder
      return !isEmptyValue(organizationId) && !isEmptyValue(warehouseId)
    })
    const currentStep = computed({
      // getter
      get() {
        const step = store.getters.getSteps
        return step
      },
      // setter
      set(value) {
        store.commit('setChangeSteps', value)
      }
    })
    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    function refreshRecords() {
      searchRecords()
    }
    function searchRecords() {
      const { organizationId, moventTypeId, warehouseId } = store.getters.getSearchFilterGenerateOrder
      let moventType = 'C_Order'
      if (moventTypeId) {
        moventType = 'DD_Order'
      }
      store.dispatch('searchListDocument', {
        organizationId,
        moventTypeId: moventType,
        warehouseId
        // salesRegionId,
        // salesRepresentativeId,
        // documentTypeId
      })
    }
    function nextStep(step) {
      searchRecords()
      currentStep.value++
    }

    /**
     * Methods
     */
    return {
      // Refs
      stepList,
      currentStep,
      showPanel,
      // Computed
      isDisabled,
      isMobile,
      // Methods
      nextStep,
      refreshRecords
    }
  }
})
</script>

<style lang="scss">
  .from-wf-panel {
    padding-top: 10px;
    padding-left: 20px;
    padding-right: 20px;
  }
  .el-input-number {
    .el-input--medium .el-input__inner {
      text-align: end;
    }
  }
</style>
