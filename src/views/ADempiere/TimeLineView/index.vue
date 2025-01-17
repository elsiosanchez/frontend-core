<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Ricardo Fenomeno ricardofenomeno13@gmail.com https://github.com/Ricargame
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  validateng with this program. If not, see <https:www.gnu.org/licenses/>.
-->
<template>
  <div>
    <options-bar
      :title="currentTimeLineDefinitions.name"
      :description="currentTimeLineDefinitions.description"
      :icon="'timeline'"
    />
    <div class="timeline-container">
      <el-timeline>
        <el-timeline-item
          v-for="(info, index) in infoTimeLine"
          :key="info.id"
          :timestamp="translateDate(info.date)"
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
  </div>
</template>

<script>
import store from '@/store'
import router from '@/router'
import { defineComponent, ref, computed } from '@vue/composition-api'
import { translateDate } from '@/utils/ADempiere/formatValue/dateFormat'
import { isEmptyValue } from '@/utils/ADempiere'
import OptionsBar from '@/components/ADempiere/PanelInfo/Component/optionsBar.vue'

export default defineComponent({
  name: 'TimeLine',
  components: {
    OptionsBar
  },
  setup() {
    const infoTimeLine = ref([])
    const currentKey = ref(null)
    const infoTitle = ref('')
    const infoDescription = ref('')
    const { query, params } = router.app._route
    const currentTimeLineDefinitions = computed(() => {
      return store.getters.getCurrentTimeLineDefinitions
    })
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
    const displayDefinition = computed(() => {
      return store.getters.getPanelOptions
    })
    function searchTimeLine() {
      if (!isEmptyValue(displayDefinition.value)) {
        const filter = displayDefinition.value.find(display => display.display_type === 'T')
        const { id, description, name } = filter
        infoTitle.value = name
        infoDescription.value = description
        let filters = [{ name: [tableName.value] + '_ID', values: recordId.value }]
        filters = JSON.stringify(filters)
        store.dispatch('currentTimeLineDefinitions', filter)
        store.dispatch('searchPanelTimeLine', {
          id,
          filters
        })
          .then(response => {
            infoTimeLine.value = response
          })
      }
    }

    function getPointColor(index) {
      const colors = ['#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1']
      return colors[index % colors.length]
    }

    function toggleKey(key) {
      currentKey.value = currentKey.value === key ? null : key
    }

    searchTimeLine()

    return {
      infoTimeLine,
      currentKey,
      infoTitle,
      currentTimeLineDefinitions,
      infoDescription,
      translateDate,
      recordId,
      tableName,
      displayDefinition,
      searchTimeLine,
      getPointColor,
      toggleKey
    }
  }
})
</script>

<style scoped>
.timeline-container {
  height: calc(100vh - 300px) !important;
  display: flex;
  margin-top: 12px;
}

.el-timeline {
  width: 100%;
  padding-left: 20px !important;
}

.left-card {
  margin-left: 20px;
  background-color: #f5f5f5;
}

.right-card {
  margin-right: 20px;
  background-color: #e8f0fe;
}

.container-title {
  font-size: 14px;
  font-weight: bold;
}

.container-description {
  line-height: 1.2;
  padding-bottom: 1rem 0.2rem;
  padding-right: 12px;
  padding-left: 12px;
  font-size: 12px;
  padding: 1rem;
}
.el-descriptions-item__label.has-colon::after {
  content: none !important;
}
</style>
