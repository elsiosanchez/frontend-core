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
  <div style="height: calc(100vh - 150px) !important;;">
    <div style="line-height: 1.2; font-size: 14px; color: #303133; border-bottom: 1px solid #d0d7de; margin-right: 10px; margin-left: 5px; ">
      <svg-icon icon-class="workflow" />
      <span style="font-weight: bold;">
        {{ infoTitle }}
      </span>
      <div style="color: rgb(130, 132, 138); margin-left: 18px; padding-bottom: 5px;">
        {{ infoDescription }}
      </div>
    </div>
    <div style="overflow: hidden;">
      <el-steps :active="activate" align-center finish-status="success">
        <el-step
          v-for="(actions, key) in listWorkflow.steps"
          :key="key"
          :title="actions.name"
          style="font-weight: bold;"
        />
      </el-steps>
      <div style="overflow-x: hidden; overflow-y: auto;  height: calc(100vh - 300px)">
        <el-timeline v-if="!isEmptyValue(listWorkflow.records)">
          <el-timeline-item
            v-for="(worrkflow, keys) in listWorkflow.records"
            :key="keys"
            placement="top"
          >
            <el-card shadow="hover" class="clearfix" style="padding: 2%">
              <div>
                <span style="color: #606266; font-weight: bold; font-size: 14px;">
                  {{ worrkflow.title }} <i class="el-icon-user-solid" />
                </span>
                <el-link
                  type="primary"
                  style="float: right;"
                  @click="showkey(keys)"
                >
                  {{ $t('window.containerInfo.changeDetail') }}
                </el-link>
              </div>
              <el-collapse-transition>
                <el-scrollbar wrap-class="scroll-child" style="font-size: 12px;">
                  <div v-show="(currentKey === keys)" style="line-height: 5">
                    <span>
                      {{ worrkflow.description }}
                    </span>
                  </div>
                </el-scrollbar>
              </el-collapse-transition>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <div v-else>
          <el-empty />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import router from '@/router'

import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

import { defineComponent, computed, ref } from '@vue/composition-api'
export default defineComponent({
  name: 'WorflowView',
  props: {
    containerUuid: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const currentKey = ref(0)
    const typeAction = ref(0)
    const infoTitle = ref('')
    const infoDescription = ref('')
    const listWorkflow = ref({})
    const displayDefinition = computed(() => {
      return store.getters.getDefinition
    })
    const { query, params } = router.app._route
    const recordId = computed(() => {
      if (!isEmptyValue(query) && !isEmptyValue(query.recordId)) return query.recordId
      if (!isEmptyValue(params) && !isEmptyValue(params.recordId)) return params.recordId
      return -1
    })
    const tableName = computed(() => {
      const { currentTab } = store.getters.getContainerInfo
      if (!isEmptyValue(currentTab) && !isEmptyValue(currentTab.table_name)) return currentTab.table_name
      return ''
    })
    const activate = computed(() => {
      const getData = store.getters.getTabData({
        containerUuid: props.containerUuid
      })
      if (!isEmptyValue(getData) && !isEmptyValue(listWorkflow.value)) {
        const { recordsList } = getData
        const requestTypeIds = recordsList.map(record => record[listWorkflow.value.column_name])
        const index = listWorkflow.value.steps.findIndex(step => String(step.value) === String(requestTypeIds[0]))
        return index
      }
    })
    function searchWorkflow() {
      const filter = displayDefinition.value.find(display => display.display_type === 'W')
      const { id, description, name } = filter
      infoTitle.value = name
      infoDescription.value = description
      store.dispatch('getWorflowDisplay', {
        id,
        filters: { name: [tableName.value] + '_ID', values: recordId.value }
      })
        .then(response => {
          if (!isEmptyValue(response)) {
            listWorkflow.value = response
          }
        })
    }
    const showkey = (key, index) => {
      if (key === currentKey.value && index === typeAction.value) {
        currentKey.value = 1000
      } else {
        currentKey.value = key
        typeAction.value = index
      }
    }
    searchWorkflow()
    return {
      // Ref
      listWorkflow,
      currentKey,
      infoTitle,
      infoDescription,
      // Computed
      displayDefinition,
      recordId,
      tableName,
      activate,
      //
      searchWorkflow,
      showkey
    }
  }
})

</script>
