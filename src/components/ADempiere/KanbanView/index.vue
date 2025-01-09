<template>
  <el-card v-loading="isLoading" class="kanban-container">
    <div class="tab-options-container">
      <advanced-tab-query
        :parent-uuid="parentUuid"
        :container-uuid="containerUuid"
        :container-manager="containerManager"
        :id-display-definition="filter.id"
        style="float: right;"
      />
      <tab-options
        :container-manager="containerManager"
        :parent-uuid="parentUuid"
        :container-uuid="containerUuid"
        :current-tab-uuid="currentTabUuid"
      />
    </div>
    <div v-if="columns.length === 0" class="no-data-placeholder">
      {{ $t('window.nodata') }}
    </div>
    <div class="kanban-columns-container">
      <div
        v-for="(column, index) in columns"
        :key="index"
        class="kanban-column"
      >
        <template>
          <!-- <svg-icon
            icon-class="issues"
            style="font-size: 26px"
          /> -->
          <b style="font-size: 16px;padding-left: 10px;">
            <i>
              {{ column.title }}
            </i>
          </b>
        </template>
        <draggable
          v-model="column.items"
          v-bind="dragOptions"
          class="list-group"
          @start="isDragging = true"
          @end="isDragging = false"
          @change="handleCardMove($event, column)"
        >
          <template>
            <div
              v-for="element in column.items"
              :key="element.id"
              class="list-group-item"
              @dblclick="showPanel(element.id)"
            >
              <!-- <i
                :class="element.fixed ? 'fa fa-anchor' : 'glyphicon glyphicon-pushpin'"
                aria-hidden="true"
                @click="element.fixed = !element.fixed"
              /> -->
              <div class="kanban-column-header">
                <!-- <svg-icon icon-class="issues" class="column-icon" /> -->
                <span class="column-title">{{ element.title }}</span>
              </div>
              <div style="padding-left: 5px; padding-right: 5px; color: rgb(130, 132, 138); line-height: 1.2; padding-bottom: 1rem;">
                <span style="font-size: 12px;">
                  {{ element.description }}
                </span>
              </div>
            </div>
          </template>
          <div v-if="column.items.length < 1" class="empty-placeholder">{{ $t('form.kanban.dropCard') }}</div>
        </draggable>
      </div>
    </div>
    <el-drawer
      :visible.sync="showContainerInfo"
      :with-header="true"
      :before-close="showPanel"
      :size="isDrawerWidth"
      class="drawer-panel-info"
    >
      <span slot="title">
        <svg-icon icon-class="tab" style="margin-right: 10px;" />
        {{ $t('window.containerInfo.log.tab') }}
      </span>
      <panel-info
        v-if="showContainerInfo"
        :all-tabs-list="allTabsList"
        :show-container-info="showContainerInfo"
        :container-manager="containerManager"
        :current-record="currentRecordLogs"
        :tab-uuid="tabUuid"
        :is-accounting-info="isAccountingInfo"
        :default-opened-tab="defaultNameTab"
        :record-id="recordId"
      />
    </el-drawer>
  </el-card>
</template>

<script>
import draggable from 'vuedraggable'
import store from '@/store'
import lang from '@/lang'
import router from '@/router'
import TabOptions from '@/components/ADempiere/TabManager/TabOptions.vue'
import PanelInfo from '@/components/ADempiere/PanelInfo'
import { defineComponent, computed, ref, watch } from '@vue/composition-api'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { updateEntity } from '@/api/ADempiere/userInterface/entities.ts'
import AdvancedTabQuery from '@/components/ADempiere/KanbanView/AdvancedTabQuery.vue'
export default defineComponent({
  name: 'Kanban',
  components: {
    draggable,
    TabOptions,
    PanelInfo,
    AdvancedTabQuery
  },
  props: {
    containerManager: {
      type: Object,
      required: false
    },
    parentUuid: {
      type: String,
      required: false
    },
    containerUuid: {
      type: String,
      required: false
    },
    currentTabUuid: {
      type: String,
      required: false
    },
    allTabsList: {
      type: Array,
      required: false
    },
    tabsList: {
      type: Array,
      default: () => []
    },
    actionsManager: {
      type: Object,
      default: () => ({})
    },
    // used only window
    isAccountingInfo: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const currentRoute = router.app._route
    const columns = ref([])
    const recordId = ref('')
    const isLoading = computed(() => {
      return store.getters.getIsLoadingKanban
    })
    const currentRecordLogs = ref({})
    const defaultNameTab = computed(() => {
      return store.getters.getDefaultOpenedTab
    })
    const dragOptions = computed(() => {
      return {
        animation: 150,
        group: 'kanban',
        disabled: false,
        ghostClass: 'ghost'
      }
    })
    const showContainerInfo = computed(() => {
      return store.getters.getShowLogs
    })
    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })
    const isDrawerWidth = computed(() => {
      if (isMobile.value) {
        return '100%'
      }
      return '65%'
    })
    function showPanel(id) {
      const {
        name,
        query,
        params
      } = currentRoute
      router.replace({
        name,
        query: {
          ...query,
          recordId: id
        },
        params: {
          ...params,
          recordId: id
        }
      })
      recordId.value = id
      store.commit('setShowLogs', !showContainerInfo.value)
    }

    const tableName = computed(() => {
      const { currentTab } = store.getters.getContainerInfo
      if (!isEmptyValue(currentTab) && !isEmptyValue(currentTab.table_name)) return currentTab.table_name
      return ''
    })
    const displayDefinition = computed(() => {
      return store.getters.getDefinition
    })
    const filter = displayDefinition.value.find(display => display.display_type === 'K')

    const info = computed(() => {
      return store.getters.getInfoKanban
    })
    function loadColumns() {
      if (!isEmptyValue(info.value)) {
        const { steps, records } = info.value
        const ungroupedItems = records
          .filter(record => !steps.some(step => record.group_id === step.value))
          // .map(record => ({
          //   id: record.id,
          //   name: record.title,
          //   description: record.description
          // }))
        const ungroupedColumn = {
          title: lang.t('form.kanban.noStatus'),
          items: ungroupedItems
        }

        const groupedColumns = steps.map(step => ({
          title: step.name,
          value: step.value,
          items: records
            .filter(record => record.group_id === step.value)
            // .map(record => ({
            //   id: record.id,
            //   name: record.title,
            //   description: record.description
            // }))
        }))

        columns.value = [ungroupedColumn, ...groupedColumns]
      }
    }

    // function searchInfoKanvan() {
    //   if (!isEmptyValue(displayDefinition.value)) {
    //     const filter = displayDefinition.value.find(display => display.display_type === 'K')
    //     const { id } = filter
    //     store.dispatch('searchPanelKanban', {
    //       id,
    //       filters: { name: [tableName.value] + '_ID', value: recordId.value }
    //     })
    //       .finally(() => {
    //         loadColumns()
    //       })
    //   }
    // }
    function handleCardMove(event, column) {
      if (!isEmptyValue(event) && !isEmptyValue(event.added) && !isEmptyValue(event.added.element)) {
        const { value } = column
        const { id, uuid } = event.added.element
        const columnName = info.value.column_name
        const { currentTab } = store.getters.getContainerInfo

        updateEntity({
          tableName: tableName.value,
          recordUuid: uuid,
          recordId: id,
          tabId: currentTab.id,
          recordAttributes: {
            [columnName]: value
          }
        })
      }
    }
    watch(info, () => {
      loadColumns()
    })
    loadColumns()
    return {
      filter,
      // Ref
      currentRecordLogs,
      isLoading,
      recordId,
      // Constant
      isMobile,
      dragOptions,
      isDrawerWidth,
      showContainerInfo,
      defaultNameTab,
      tableName,
      displayDefinition,
      columns,
      info,
      //
      showPanel,
      handleCardMove
      // searchInfoKanvan
    }
  }
})
</script>

<style>
.kanban-container {
  position: relative;
  padding-top: 4rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

.kanban-columns-container {
  height: calc(100vh - 150px);
  display: flex;
  flex-wrap: nowrap;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  padding-top: 0.5rem;
}

.kanban-column {
  flex: 0 0 auto;
  width: 300px;
  background-color: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(27, 31, 35, 0.12);
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.kanban-column h3 {
  margin: 0;
  margin-bottom: 1rem;
  color: #24292f;
  font-size: 1.25rem;
  font-weight: 600;
  border-bottom: 1px solid #d0d7de;
  padding-bottom: 0.5rem;
}

.list-group {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-group-item {
  cursor: grab;
  background-color: #ffffff;
  border-width: 1px;
  border-style: solid;
  border-color: #d0d7de;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  transition: background-color 0.2s, border-color 0.2s;
  box-shadow: 0 3px 6px rgba(140,149,159,0.15);
  padding: 0px 5px;
}

.list-group-item:hover {
  background-color: #f3f4f6;
  border-color: #c9d1d9;
}

.list-group-item i {
  cursor: pointer;
  margin-right: 8px;
  color: #57606a;
  transition: color 0.2s;
}

.list-group-item i:hover {
  color: #24292f;
}

.list-group-item strong {
  font-size: 1rem;
  color: #24292f;
}

.list-group-item p {
  font-size: 0.875rem;
  color: #57606a;
  margin: 0.5rem 0 0;
}

.ghost {
  opacity: 0.5;
  background: #d8e2ec;
  border: 2px dashed #c9d1d9;
}
.empty-placeholder {
  min-height: 50px;
  padding: 10px;
  background-color: #f6f8fa;
  border: 2px dashed #d0d7de;
  border-radius: 6px;
  text-align: center;
  color: #57606a;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, border-color 0.2s;
}

.empty-placeholder:hover {
  background-color: #e1e4e8;
  border-color: #c9d1d9;
}
.tab-options-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: #ffffff;
  padding: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.list-group-item strong{
  font-size: 12px !important;
  color: #495060;
}
.kanban-column-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.2rem;
  padding-left: 5px;
  padding-right: 5px;
  border-width: 1px 0px;
  border-style: solid none;
  border-color: rgb(230, 235, 245) currentcolor;
}

.column-icon {
  color: green;
  margin-left: 4px;
  margin-right: 4px;
}
.column-title {
  font-size: 12px;
}
</style>
