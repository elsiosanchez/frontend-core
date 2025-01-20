<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Elsio Sanchez elsiosanchez@gmail.com https://github.com/elsiosanchez
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
      <div v-if="!isEmptyValue(timeLineDefinitions)" class="timeline-container">
        <el-timeline>
          <el-timeline-item
            v-for="(info, index) in timeLineDefinitions"
            :key="info.id"
            :timestamp="translateDate({ value: info.date, format:'long' })"
            placement="top"
            :color="getPointColor(index)"
          >
            <el-card shadow="hover" class="clearfix">
              <div>
                <span class="container-title">
                  {{ info.title }}
                </span>
                <el-link
                  type="primary"
                  style="float: right;"
                  @click="toggleKey(info.id)"
                >
                  {{ $t('window.containerInfo.changeDetail') }}
                </el-link>
              </div>
              <el-collapse-transition>
                <div v-show="currentKey === info.id">
                  <span>
                    <hr class="divider">
                    <el-col style="margin-left: 10px;">
                      <span style="color: #606266; font-weight: bold; line-height: 1;">
                        {{ info.description }}
                      </span>
                    </el-col>
                  </span>
                </div>
              </el-collapse-transition>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      <div v-else>
        <el-empty />
      </div>
    </div>
  </span>
</template>

<script>
import store from '@/store'
import { defineComponent, computed, ref } from '@vue/composition-api'
import { translateDate } from '@/utils/ADempiere/formatValue/dateFormat'
export default defineComponent({
  name: 'TimeLineDefinitin',
  props: {
    tabAttributes: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const currentKey = ref(null)
    const currentDisplyDefinitions = computed(() => {
      return store.getters.getCurrentDisplayPanelRightDefinitions({ tableName: props.tabAttributes.table_name })
    })
    const timeLineDefinitions = computed(() => {
      return store.getters.getCurrentTimeLineDefinition({
        tableName: props.tabAttributes.table_name
      })
    })
    const isLoading = computed(() => {
      return store.getters.getTimeLineLoading({
        tableName: props.tabAttributes.table_name
      })
    })
    function getPointColor(index) {
      const colors = ['#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1']
      return colors[index % colors.length]
    }
    function toggleKey(key) {
      currentKey.value = currentKey.value === key ? null : key
    }
    return {
      // ref
      currentKey,
      // computed
      currentDisplyDefinitions,
      timeLineDefinitions,
      isLoading,
      // methods
      getPointColor,
      translateDate,
      toggleKey
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
