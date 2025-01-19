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
  <div v-loading="isLoading" style="height: calc(100vh - 150px) !important;">
    <options-bar
      :title="currentWorkflowDefinitions.name"
      :description="currentWorkflowDefinitions.description"
      :icon="'workflow'"
    />
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
              <div style="cursor:pointer" @click="showkey(worrkflow.group_id, keys)">
                <span style="color: #606266; font-weight: bold; font-size: 14px;">
                  {{ worrkflow.title }} <i class="el-icon-user-solid" />
                </span>
                <el-link
                  type="primary"
                  style="float: right;"
                  @click.stop="showkey(worrkflow.group_id, keys)"
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
import OptionsBar from '@/components/ADempiere/PanelInfo/Component/optionsBar.vue'

import { defineComponent, computed, ref } from '@vue/composition-api'
export default defineComponent({
  name: 'WorflowView',
  components: {
    OptionsBar
  },
  props: {
    containerUuid: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const activate = ref(-1)
    const currentKey = ref(0)
    const typeAction = ref(0)
    const infoTitle = ref('')
    const infoDescription = ref('')
    const listWorkflow = computed(() => {
      return store.getters.getCurrentDisplayWorkflow
    })
    const displayDefinition = computed(() => {
      return store.getters.getPanelOptions
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

    const currentWorkflowDefinitions = computed(() => {
      return store.getters.getCurrentWorkflowDefinitions
    })
    const isLoading = computed(() => {
      return store.getters.getIsLoadingWorkflow
    })
    function searchWorkflow() {
      const filter = displayDefinition.value.find(display => display.display_type === 'W')
      const { id, description, name } = filter
      infoTitle.value = name
      infoDescription.value = description
      let filters = [{ name: [tableName.value] + '_ID', values: recordId.value }]
      filters = JSON.stringify(filters)
      store.dispatch('currentWorkflowDefinitions', filter)
      store.dispatch('getWorflowDisplay', {
        id,
        filters
      })
        .then(res => {
          const { records } = res
          if (isEmptyValue(records)) return
          const stepIndex = listWorkflow.value.steps.findIndex(step => step.value === String(records[0].group_id))
          activate.value = stepIndex
        })
    }
    const showkey = (groupId, key, index) => {
      if (key === currentKey.value && index === typeAction.value) {
        currentKey.value = 1000
      } else {
        currentKey.value = key
        typeAction.value = index
      }
      const stepIndex = listWorkflow.value.steps.findIndex(step => step.value === String(groupId))
      activate.value = stepIndex
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
      currentWorkflowDefinitions,
      isLoading,
      //
      searchWorkflow,
      showkey
    }
  }
})

</script>
