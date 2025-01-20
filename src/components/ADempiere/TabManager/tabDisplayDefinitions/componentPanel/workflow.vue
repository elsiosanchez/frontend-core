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
  <span>
    <div
      class="info-definitions"
    >
      <span style="font-weight: bold;">
        {{ currentDisplyDefinitions.name }}
      </span>
      <div style="color: rgb(130, 132, 138);">
        {{ currentDisplyDefinitions.description }}
      </div>
    </div>
    <div v-loading="isLoading">
      <el-steps :active="activate" align-center finish-status="success" style="overflow-x: auto;">
        <el-step
          v-for="(actions, key) in stepsWorkflowDefinitions"
          :key="key"
          :title="actions.name"
          style="font-weight: bold;"
        />
      </el-steps>
      <div style="overflow-x: hidden;">
        <el-timeline v-if="!isEmptyValue(recordWorkflowDefinitions)">
          <el-timeline-item
            v-for="(worrkflow, keys) in recordWorkflowDefinitions"
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
  </span>
</template>

<script>
import store from '@/store'
import { defineComponent, computed, ref } from '@vue/composition-api'

export default defineComponent({
  name: 'WorkflowDefinition',
  props: {
    tabAttributes: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const currentKey = ref(0)
    const typeAction = ref(0)
    const activate = computed(() => {
      return store.getters.getWorkflowActivate({
        tableName: props.tabAttributes.table_name
      })
    })
    const currentDisplyDefinitions = computed(() => {
      return store.getters.getCurrentDisplayPanelRightDefinitions({ tableName: props.tabAttributes.table_name })
    })
    const isLoading = computed(() => {
      return store.getters.getWorkflowLoading({
        tableName: props.tabAttributes.table_name
      })
    })
    const stepsWorkflowDefinitions = computed(() => {
      return store.getters.getCurrentWorkflowDefinition({
        tableName: props.tabAttributes.table_name
      }).steps
    })
    const recordWorkflowDefinitions = computed(() => {
      return store.getters.getCurrentWorkflowDefinition({
        tableName: props.tabAttributes.table_name
      }).records
    })
    function showkey(groupId, key, index) {
      if (key === currentKey.value && index === typeAction.value) {
        currentKey.value = 1000
      } else {
        currentKey.value = key
        typeAction.value = index
      }
      const activate = stepsWorkflowDefinitions.value.findIndex(step => step.value === String(groupId))
      store.dispatch('requestWorkflowActivate', {
        activate,
        tableName: props.tabAttributes.table_name
      })
    }
    return {
      // ref
      activate,
      currentKey,
      // computed
      currentDisplyDefinitions,
      isLoading,
      stepsWorkflowDefinitions,
      recordWorkflowDefinitions,
      // methods
      showkey
    }
  }
})
</script>

<style lang="scss">
.info-definitions {
  line-height: 1.2;
  font-size: 12px;
  color: #303133;
}
</style>
