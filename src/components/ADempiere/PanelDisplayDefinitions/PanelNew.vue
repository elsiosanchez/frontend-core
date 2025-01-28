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
  <el-card class="box-card-display-definition" :body-style="{ padding: '0px' }">
    <div slot="header" class="clearfix">
      <p style="text-align: center;margin-top: 7px;margin-bottom: 7px;">
        <b style="font-size: larger;">
          {{ currentDisplyDefinitions.name }}
        </b>
      </p>
    </div>
    <div class="text item">
      <el-card v-loading="isLoadingDisplayDefinitions" class="box-card" />
    </div>
  </el-card>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import store from '@/store'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'PanelDisplayDefinitionsNew',

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
    currentDisplyDefinitions: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    const containerManagerPanel = computed(() => {
      return props.containerManager
    })

    const displayDefinitionMetadata = computed(() => {
      return store.getters.getDisplayTabDefinition({ id: props.currentDisplyDefinitions.id })
    })

    const displayDefinitionFields = computed(() => {
      if (
        !isEmptyValue(displayDefinitionMetadata.value) &&
        !isEmptyValue(displayDefinitionMetadata.value.fields)
      ) {
        return displayDefinitionMetadata.value.fields
      }
      return []
    })

    const isLoadingDisplayDefinitions = computed(() => {
      if (
        !isEmptyValue(displayDefinitionMetadata.value) &&
        !isEmptyValue(displayDefinitionMetadata.value.isLoading)
      ) {
        return displayDefinitionMetadata.value.isLoading
      }
      return false
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

    return {
      // computeds
      isLoadingDisplayDefinitions,
      displayDefinitionMetadata,
      displayDefinitionFields,
      containerManagerPanel,
      panelMetadata
    }
  }
})
</script>

<style lang="scss">
.box-card-display-definition {
  width: 100%;
  height: 100%;
  overflow: auto;
  .el-card__header {
    padding: 0px;
  }
}
</style>
