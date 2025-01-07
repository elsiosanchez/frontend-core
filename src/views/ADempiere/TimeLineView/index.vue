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
  <div class="timeline-container">
    <el-timeline style="max-width: 600px">
      <el-timeline-item
        v-for="(info, index) in infoTimeLine"
        :key="info.id"
        :timestamp="formatDate({ value: info.date })"
        placement="top"
        :color="getPointColor(index)"
      >
        <el-card :class="index % 2 === 0 ? 'left-card' : 'right-card'">
          <div class="container-title">
            <span>{{ info.title }}</span>
          </div>
          <div class="container-description">
            <span>{{ info.description }}</span>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
import store from '@/store'
import { defineComponent, ref } from '@vue/composition-api'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'TimeLine',
  setup() {
    const infoTimeLine = ref([])

    function searchTimeLine() {
      store.dispatch('searchPanelTimeLine', {
        id: 1000002
      })
        .then(response => {
          infoTimeLine.value = response
        })
    }

    function getPointColor(index) {
      const colors = ['#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1']
      return colors[index % colors.length]
    }

    searchTimeLine()

    return {
      infoTimeLine,
      searchTimeLine,
      formatDate,
      getPointColor
    }
  }
})
</script>

<style scoped>
.timeline-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.el-timeline {
  width: 100%;
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
  padding: 0.5rem 0;
  padding-right: 12px;
  padding-left: 12px;
  border-bottom: 1px solid #d0d7de;
}

.container-description {
  line-height: 1.2;
  padding-bottom: 1rem 0.2rem;
  padding-right: 12px;
  padding-left: 12px;
  font-size: 12px;
  padding: 1rem;
}
</style>
