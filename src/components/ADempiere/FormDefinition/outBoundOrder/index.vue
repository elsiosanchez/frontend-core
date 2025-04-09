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
          v-for="(list) in stepList"
          :key="list.key"
          :title="list.name"
        />
      </el-steps>
    </div>
    <div style="height: 80% !important; padding: 0px 15px">
      <component
        :is="componentRender"
      />
    </div>
    <div style="height: 14% !important;text-align: end;padding: 0px 15px;">
      <footer-buttons
        :current-step="stepList[currentStep].key"
        :records-selecion="isEmptyValue(recordsSelecion)"
        :is-disabled-organizations="isDisabled"
        :is-loading-process="isLoadingProcess"
        :is-disable-process="isDisableProcess"
        :open-panel-right="openPanel"
        :previos-step="previosStep"
        :action-clear="clearSearch"
        :refresh="refreshRecords"
        :action-run="runProcess"
        :next-step="nextStep"
        :action-close="exit"
      />
    </div>
    <el-drawer
      :visible.sync="showPanel"
      :show-close="true"
      :with-header="true"
      :size="isMobile ? '100%' : '65%'"
      :title="$t('form.outBoundOrder.productInfo.title')"
    >
      <span slot="title">
        <p style="color: #606266; font-weight: bold;margin: 0px;text-align: center;">
          {{ $t('form.outBoundOrder.productInfo.title') }}
        </p>
      </span>
      <info-panel />
    </el-drawer>
  </div>
</template>

<script>
import { defineComponent, computed, ref, watch } from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'
import router from '@/router'

// Components and Mixins
import InfoPanel from './RecordResult/infoPanel.vue'
import FooterButtons from '@/components/ADempiere/FormDefinition/outBoundOrder/footer'
// import Summary from './components/Summary'

// Constants
import {
  MOVEMENT_TYPE_SALES_ORDER
} from '@/utils/ADempiere/dictionary/form/WOutBoundOrder'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { showNotification } from '@/utils/ADempiere/notification.js'

/**
 * Based on:
 * org.spin.wms.form.OutBoundOrder
 * org.spin.wms.form.WOutBoundOrder
 */
export default defineComponent({
  name: 'OutBoundOrder',

  components: {
    FooterButtons,
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
    const disabledButton = ref(false)
    const buttonKey = ref(0)

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

    const recordsSelecion = computed(() => {
      return store.getters.getLinesSelection
    })

    const recordsId = computed(() => {
      return store.getters.getHeaderRecordsId
    })

    const isLoadingProcess = computed(() => {
      return store.getters.getIsLoadingProcess
    })

    const isDisableProcess = computed(() => {
      if (isLoadingProcess.value) {
        return true
      }
      const {
        charterOrder, vehiclesId, driverId, freightDocumentTypesId, shipperId
      } = store.getters.getSearchFilterGenerateOrder
      if (charterOrder) {
        return isEmptyValue(vehiclesId) || isEmptyValue(driverId) || isEmptyValue(freightDocumentTypesId) || isEmptyValue(shipperId)
      }
      return false
    })

    const currentStep = computed({
      // getter
      get() {
        const step = store.getters.getOutputSteps
        return step
      },
      // setter
      set(value) {
        store.commit('setOutputSteps', value)
      }
    })

    const componentRender = computed(() => {
      let panel
      switch (stepList.value[currentStep.value].key) {
        case 'searchCriteria':
          panel = () => import('@/components/ADempiere/FormDefinition/outBoundOrder/SearchCriteria')
          break
        case 'order':
          panel = () => import('@/components/ADempiere/FormDefinition/outBoundOrder/RecordResult/index.vue')
          break
        case 'process':
          panel = () => import('@/components/ADempiere/FormDefinition/outBoundOrder/process')
          break
        default:
          panel = () => import('@/components/ADempiere/FormDefinition/outBoundOrder/SearchCriteria')
          break
      }
      return panel
    })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    function refreshRecords() {
      searchRecords()
    }

    function searchRecords(clear = false) {
      const {
        organizationId, movementTypeId, warehouseId,
        salesRegionId, salesRepresentativeId, documentTypeId
      } = store.getters.getSearchFilterGenerateOrder

      let movementType = movementTypeId
      if (isEmptyValue(movementType)) {
        movementType = MOVEMENT_TYPE_SALES_ORDER
      }
      store.dispatch('searchListDocument', {
        organizationId,
        movementTypeId: movementType,
        warehouseId,
        salesRegionId,
        salesRepresentativeId,
        documentTypeId
      })
      const ids = recordsId.value
      if (!isEmptyValue(ids)) {
        store.dispatch('searchListDocumentLine', {
          organizationId,
          movementTypeId: movementType,
          warehouseId,
          recordsId: clear ? [] : ids,
          salesRegionId,
          salesRepresentativeId,
          documentTypeId
        })
      }
    }

    function nextStep(step) {
      store.commit('setLinesSelection', [])
      store.commit('setListDocumentList', [])
      store.commit('setRecordsId', [])
      searchRecords()
      currentStep.value++
    }

    function previosStep() {
      currentStep.value--
    }

    function validateNextStep() {
      if (!isEmptyValue(recordsSelecion.value)) {
        disabledButton.value = true
        let hasError = false
        recordsSelecion.value.forEach(record => {
          if (record.delivery_rule_value === 'F' || record.delivery_rule_value === 'M') {
            return
          }
          if (record.quantity > record.ordered_quantity) {
            const message = lang.t('form.outBoundOrder.error2') + ' ' + lang.t('form.outBoundOrder.header.documentNo') + ': ' + record.document_no
            showNotification({
              title: lang.t('notifications.error'),
              message,
              type: 'error'
            })
            hasError = true
          } else if (record.quantity > record.on_hand_quantity) {
            const message = lang.t('form.outBoundOrder.error') + ' ' + lang.t('form.outBoundOrder.header.documentNo') + ': ' + record.document_no
            showNotification({
              title: lang.t('notifications.error'),
              message,
              type: 'error'
            })
            hasError = true
          }
        })
        if (!hasError) {
          currentStep.value++
        }
      } else {
        disabledButton.value = false
      }
    }

    function runProcess() {
      const filters = store.getters.getSearchFilterGenerateOrder
      const lineSelect = store.getters.getLinesSelection

      const {
        movementTypeId, organizationId, warehouseId, targetDocumentTypeId,
        documentDate, shipDate, deliveryRuleId, deliveryViaId, shipperId,
        vehiclesId, driverId, charterOrder, freightDocumentTypesId } = filters
      const orderLineRequest = lineSelect.map(data => {
        return {
          id: data.id,
          product_id: data.product_id,
          weight: data.weight,
          volume: data.volume,
          quantity: data.quantity.toString(),
          reserved_quantity: data.reserved_quantity,
          quantity_invoiced: data.quantity_invoiced,
          quantity_in_transit: data.quantity_in_transit,
          ordered_quantity: data.ordered_quantity,
          on_hand_quantity: data.on_hand_quantity
        }
      })
      let movementType = movementTypeId
      if (isEmptyValue(movementTypeId)) {
        movementType = MOVEMENT_TYPE_SALES_ORDER
      }
      store.dispatch('runOutputOrderProcess', {
        organization_id: organizationId,
        warehouse_id: warehouseId,
        target_document_type_id: targetDocumentTypeId,
        delivery_rule: deliveryRuleId,
        delivery_via: deliveryViaId,
        shipper_id: shipperId,
        document_date: documentDate,
        shipment_date: shipDate,
        movement_type: movementType,
        orderLineRequest,
        is_generate_freight_order: charterOrder,
        vehicle_id: vehiclesId,
        driver_id: driverId,
        freight_document_type_id: freightDocumentTypesId
      })
    }
    function exit() {
      const currentRoute = router.app._route
      const tabViewsVisited = store.getters.visitedViews
      store.dispatch('tagsView/delView', currentRoute)
      const oldRouter = tabViewsVisited[tabViewsVisited.length - 1]
      router.push({
        path: oldRouter.path
      }, () => {})
      store.commit('clearOutputOrder')
    }
    function clearSearch() {
      searchRecords(true)
    }
    function openPanel() {
      showPanel.value = true
    }

    watch(
      () => store.getters.getSearchFilterGenerateOrder,
      () => {
        buttonKey.value++
      },
      { deep: true }
    )

    return {
      // Refs
      stepList,
      currentStep,
      showPanel,
      disabledButton,
      buttonKey,
      // Computed
      isDisabled,
      isMobile,
      recordsSelecion,
      recordsId,
      isLoadingProcess,
      isDisableProcess,
      componentRender,
      // Methods
      nextStep,
      previosStep,
      openPanel,
      refreshRecords,
      validateNextStep,
      runProcess,
      exit,
      clearSearch
    }
  }
})
</script>
