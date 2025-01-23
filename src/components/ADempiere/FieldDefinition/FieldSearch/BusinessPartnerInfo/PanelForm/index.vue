<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
  Contributor(s): Elsio Sanchez ElsioSanchez15@outlook.com https://github.com/ElsioSanchez
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
  <!-- Main container for the business partners section -->
  <el-main
    v-shortkey="QUICK_KEY_ACCESS"
    class="business-partners-container"
    @shortkey.native="keyAction"
  >
    <!-- Component for query criteria -->
    <query-criteria
      :uuid-form="uuidForm"
      :container-manager="containerManager"
      :metadata="metadata"
    />

    <!-- Component for displaying table records -->
    <table-records
      :uuid-form="uuidForm"
      :container-manager="containerManager"
      :metadata="metadata"
    />

    <!-- Component for the panel footer -->
    <panel-footer
      :uuid-form="uuidForm"
      :container-manager="containerManager"
      :metadata="metadata"
    />
  </el-main>
</template>

<script>
import {
  defineComponent,
  onUnmounted,
  computed,
  watch // Imports necessary functions from Vue Composition API
} from '@vue/composition-api'

import store from '@/store' // Imports the Vuex store

// Constants
import {
  BUSINESS_PARTNERS_LIST_FORM, // Constant for the business partners list form
  COLUMN_NAME // Constant for the column name
} from '@/utils/ADempiere/dictionary/field/search/businessPartner.ts'
import {
  QUICK_KEY_ACCESS // Constant for quick key access
} from '@/utils/ADempiere/dictionary/field/search/index.ts'

// Components and Mixins
import QueryCriteria from './QueryCriteria/index.vue' // Imports the QueryCriteria component
import TableRecords from './tableRecords.vue' // Imports the TableRecords component
import PanelFooter from './panelFooter.vue' // Imports the PanelFooter component

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils' // Imports utility function to check for empty values
import useBusinessPartner from './useBusinessPartner' // Imports custom composition function for business partner logic

export default defineComponent({
  name: 'PanelForm', // Name of the component

  components: {
    QueryCriteria, // Registers the QueryCriteria component
    TableRecords, // Registers the TableRecords component
    PanelFooter // Registers the PanelFooter component
  },

  props: {
    metadata: {
      type: Object,
      default: () => {
        return {
          containerUuid: BUSINESS_PARTNERS_LIST_FORM, // Default container UUID
          columnName: COLUMN_NAME // Default column name
        }
      }
    },
    containerManager: {
      type: Object,
      default: () => ({
        actionPerformed: () => {}, // Default action performed function
        getFieldsLit: () => {}, // Default function to get fields list
        setDefaultValues: () => {} // Default function to set default values
      })
    },
    showPopover: {
      type: Boolean,
      default: () => false // Default value for showing popover
    }
  },

  setup(props) {
    // Computes the UUID form based on metadata
    const uuidForm = computed(() => {
      if (!isEmptyValue(props.metadata.containerUuid)) {
        return props.metadata.columnName + '_' + props.metadata.containerUuid
      }
      return BUSINESS_PARTNERS_LIST_FORM
    })

    // Destructures values from the useBusinessPartner composition function
    const {
      infoData,
      isLoadedRecords,
      isLoadingRecords,
      isSalesTransactionContext,
      keyAction,
      loadRecordsList
    } = useBusinessPartner({
      uuidForm: uuidForm.value, // Passes the computed UUID form
      parentUuid: props.metadata.parentUuid, // Passes the parent UUID from metadata
      containerUuid: props.metadata.containerUuid, // Passes the container UUID from metadata
      containerManager: props.containerManager, // Passes the container manager object
      fieldAttributes: props.metadata // Passes metadata as field attributes
    })

    // Computes readiness state for data loading
    const isReadyFromGetData = computed(() => {
      return !isLoadedRecords.value && props.showPopover
    })

    // Watches for changes in readiness state and loads records if ready
    watch(isReadyFromGetData, (newValue) => {
      if (newValue) {
        loadRecordsList({}) // Loads records when ready
      }
    })

    // Loads records if certain conditions are met
    if (isReadyFromGetData.value || isSalesTransactionContext.value !== infoData.value.isSalesTransaction) {
      loadRecordsList({})
    }

    /**
     * Methods
     */

    // Subscribes to Vuex store mutations related to accounting facts
    function subscribeAccoutingFacts() {
      return store.subscribe((mutation) => {
        const enabledMutations = ['setBusinessPartnerQueryFilters', 'setBusinessPartnerQueryFilterByAttribute']
        if (enabledMutations.includes(mutation.type)) {
          loadRecordsList({}) // Reloads records on specific mutations
        }
      })
    }

    const unsubscribeAccoutingFacts = subscribeAccoutingFacts() // Stores the unsubscribe function

    // Cleans up the subscription on component unmount
    onUnmounted(() => {
      unsubscribeAccoutingFacts()
    })

    return {
      QUICK_KEY_ACCESS, // Exposes quick key access constant
      uuidForm, // Exposes computed UUID form
      isLoadingRecords, // Exposes loading state for records
      isReadyFromGetData, // Exposes readiness state for data loading
      keyAction // Exposes key action handler
    }
  }
})
</script>

<style lang="scss">
.business-partners-container {
  padding: 0; // Sets padding to zero for the container
  overflow-x: hidden; // Hides horizontal overflow
}
</style>
