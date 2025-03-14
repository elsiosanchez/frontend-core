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
  <el-card class="box-card-panel-display-definition" :body-style="{ padding: '0px' }" shadow="never">
    <div v-shortkey="{ close: ['esc'] }" @shortkey="actionClose('')">
      <component
        :is="componentRender"
        :parent-uuid="parentUuid"
        :container-uuid="containerUuid"
        :current-disply-definitions="currentDisplayDefinition"
        :container-manager="containerManagerPanel"
        :current-record="currentRecord"
        :panel-metadata="panelMetadata"
        :button-close-panel="actionClose"
        :details-title="detailsTitle"
        :is-panel-right="isPanelRight"
        :is-panel-window="isPanelWindow"
        :is-quick-entry="bachtEntry"
        :customer="currentCustomer"
      >
        <template v-slot:footer-buttons>
          <el-button
            type="danger"
            class="button-base-icon"
            icon="el-icon-close"
            style="float: right;margin-left: 10px;"
            @click="actionClose('')"
          />
          <span
            v-if="!isQuickEntry && !isPanelWindow"
            style="float: right;margin: 0px"
          >
            <b>
              {{ $t('table.dataTable.continueRegister') }}
            </b>
            <el-switch
              v-model="bachtEntry"
              active-color="#13ce66"
              inactive-color="#ff4949"
            />
          </span>
          <i style="color: #9198a1;margin-right: 5px;float: right;">
            {{ $t('table.dataTable.commandSave') }}
          </i>
        </template>
      </component>
    </div>
  </el-card>
</template>

<script>
import {
  defineComponent,
  computed,
  ref
} from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'PanelDisplayDefinitions',

  props: {
    parentUuid: {
      type: [String, Number],
      default: undefined
    },
    containerUuid: {
      type: [String, Number],
      required: false
    },
    containerManager: {
      type: Object,
      required: true
    },
    currentDisplayDefinition: {
      type: Object,
      required: false
    },
    typePanel: {
      type: String,
      required: false
    },
    isPanelWindow: {
      type: Boolean,
      required: false
    },
    actionClose: {
      type: Function,
      required: true
    },
    currentRecord: {
      type: Object,
      required: false
    },
    detailsTitle: {
      type: String,
      required: false
    },
    isPanelRight: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const bachtEntry = ref(false)

    const recordId = computed(() => {
      return store.getters.getBusinessPartnerId
    })
    const currentCustomer = computed(() => {
      return store.getters.getBusinessPartnerDefinition({ recordId: recordId.value })
    })

    const currentab = computed({
      // store.getters.getCurrentTabPanelDefinition
      get() {
        return store.getters.getCurrentTabPanelDefinition.type
      },
      set() {}
    })

    const getCurrentRecord = computed(() => {
      const record = store.getters.getRecordValuesData({
        recordId: props.currentRecord.id
      })
      if (record) return record.data
      return props.currentRecord
    })

    const containerManagerPanel = computed(() => {
      return props.containerManager
    })

    const listTabs = computed(() => {
      return [
        { label: lang.t('component.displayDefinition.cardNew'), name: 'new', icon: 'el-icon-plus' },
        { label: lang.t('component.displayDefinition.cardView'), name: 'view', icon: 'el-icon-news' }
      ]
    })

    /**
     * Get the panel object with all its attributes as well as
     * the fields it contains
     */
    const panelMetadata = computed(() => {
      return containerManagerPanel.value.getPanel({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      }) || {}
    })

    const displayDefinitionMetadata = computed(() => {
      return store.getters.getDisplayTabDefinition({
        id: props.currentDisplayDefinition.id
      })
    })

    const isQuickEntry = computed(() => {
      let fields = []
      if (currentab.value === 'view') return true
      if (
        !isEmptyValue(displayDefinitionMetadata.value) &&
        !isEmptyValue(displayDefinitionMetadata.value.fields)
      ) {
        fields = displayDefinitionMetadata.value.fields
          .filter(field => field.is_displayed && field.is_insert_record && field.is_quick_entry)
          .sort((a, b) => a.sequence - b.sequence)
      }
      return isEmptyValue(fields)
    })

    const componentRender = computed(() => {
      let panelComponent
      switch (currentab.value) {
        case 'new':
          panelComponent = () => import('@/components/ADempiere/PanelDisplayDefinitionsBussinesPartner/PanelNew.vue')
          break
        case 'view':
          panelComponent = () => import('@/components/ADempiere/PanelDisplayDefinitionsBussinesPartner/PanelView.vue')
          break
      }

      return panelComponent
    })

    // Methods

    function handleTabClick(tab) {
      store.dispatch('changeTabPanelDefinition', {
        type: tab.name,
        displyDefinitions: props.currentDisplayDefinition,
        recordId: props.currentRecord.id

      })
      // currentab.value = tab.name
    }
    return {
      // Ref
      currentab,
      bachtEntry,
      // computeds
      listTabs,
      recordId,
      isQuickEntry,
      currentCustomer,
      displayDefinitionMetadata,
      getCurrentRecord,
      containerManagerPanel,
      panelMetadata,
      componentRender,
      // Methods
      handleTabClick
    }
  }
})
</script>

<style lang="scss">
.box-card-panel-display-definition {
  .el-card__body {
    padding: 2px !important;
    margin-top: 5px !important;
  }
}
</style>

