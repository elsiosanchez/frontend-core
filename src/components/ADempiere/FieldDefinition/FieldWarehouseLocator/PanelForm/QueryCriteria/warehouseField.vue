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
  <el-form-item :label="$t('field.warehouseLocator.warehouse')">
    <el-select
      v-model="currentWarehouseId"
      value-key="id"
      clearable
      filterable
      remote
      :remote-method="remoteSearchWarehouses"
      :loading="isLoadingWarehouses"
      :disabled="warehouseId > 0"
      @change="getListWarehouseLocators({})"
      @clear="clearWarehouses()"
      @visible-change="getWarehousesList"
    >
      <el-option
        v-for="(warehouse, key) in warehousesList"
        :key="key"
        :value="warehouse.id"
        :label="warehouse.name"
      />
    </el-select>
  </el-form-item>
</template>

<script>
import { defineComponent, computed, onMounted, ref } from '@vue/composition-api'

import store from '@/store'

// Constants
import { ROWS_OF_RECORDS_BY_PAGE } from '@/utils/ADempiere/tableUtils'

// Components and Mixins
import useLocatorWarehouse from '@/components/ADempiere/FieldDefinition/FieldWarehouseLocator/useLocatorWarehouse'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'WarehouseField',

  props: {
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      required: true
    },
    containerManager: {
      type: Object,
      required: true
    },
    metadata: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    const {
      uuidForm,
      contextAttributesList,
      warehouseId
    } = useLocatorWarehouse({
      parentUuid: props.parentUuid,
      containerUuid: props.containerUuid,
      containerManager: props.containerManager,
      fieldAttributes: props.metadata
    })

    const isLoadingWarehouses = ref(false)
    const timeOutSearchWarehouses = ref(null)

    const recordData = computed(() => {
      return store.getters.getWarehouseLocatorData({
        containerUuid: uuidForm.value
      })
    })

    const warehousesList = computed(() => {
      return store.getters.getListAvailableWarehouses({
        containerUuid: uuidForm.value
      })
    })

    const currentWarehouseId = computed({
      get() {
        return recordData.value.warehouseId
      },
      set(newValue) {
        if (isEmptyValue(newValue)) {
          // all warehouse
          newValue = 0
        }
        store.commit('setWarehouseLocatorWarehouseId', {
          containerUuid: uuidForm.value,
          warehouseId: newValue
        })
      }
    })

    function listAvailableWarehouses(searchValue = '') {
      isLoadingWarehouses.value = true
      store.dispatch('listAvailableWarehouses', {
        containerUuid: uuidForm.value,
        warehouseId: warehouseId.value,
        searchValue
      })
        .finally(() => {
          isLoadingWarehouses.value = false
        })
    }
    function getWarehousesList(isShowList) {
      if (isShowList) {
        if (isEmptyValue(warehousesList.value)) {
          listAvailableWarehouses()
        }
      }
    }
    function localSearch(searchQuery = '') {
      if (isEmptyValue(searchQuery)) {
        return warehousesList.value
      }
      searchQuery = searchQuery.toLocaleLowerCase()
      return warehousesList.value.filter(option => {
        return option.name.toLowerCase().includes(searchQuery) ||
          option.description.toLowerCase().includes(searchQuery)
      })
    }
    function remoteSearchWarehouses(searchQuery) {
      const results = localSearch(searchQuery)
      if (isEmptyValue(searchQuery) ||
        (!isEmptyValue(searchQuery) && (isEmptyValue(results) || results.length < 3))) {
        clearTimeout(timeOutSearchWarehouses.value)
        timeOutSearchWarehouses.value = setTimeout(() => {
          listAvailableWarehouses(searchQuery)
        }, 1000)
        return
      }
    }
    function clearWarehouses() {
      // store.commit('setWarehousesList', {
      //   containerUuid: uuidForm.value,
      //   recordsList: []
      // })
      setTimeout(() => {
        currentWarehouseId.value = warehouseId.value
      }, 100)
      listAvailableWarehouses()
    }

    function getListWarehouseLocators({
      pageNumber = 1,
      pageSize = ROWS_OF_RECORDS_BY_PAGE
    }) {
      props.containerManager.warehouseLocatorSearch({
        containerUuid: uuidForm.value,
        contextAttributesList: contextAttributesList.value,
        // warehouseId: currentWarehouseId.value,
        uuid: props.metadata.uuid,
        id: props.metadata.internal_id,
        // searchValue: searchValue.value,
        pageNumber,
        pageSize
      })
        .catch(error => {
          console.warn(error)
        })
    }

    onMounted(() => {
      const parentWarehouseId = warehouseId.value
      if (!isEmptyValue(parentWarehouseId) && parentWarehouseId > 0) {
        currentWarehouseId.value = parentWarehouseId
      }

      listAvailableWarehouses()
    })

    return {
      isLoadingWarehouses,
      warehouseId,
      currentWarehouseId,
      warehousesList,
      // Methods
      getWarehousesList,
      clearWarehouses,
      listAvailableWarehouses,
      remoteSearchWarehouses,
      getListWarehouseLocators
    }
  }
})
</script>
