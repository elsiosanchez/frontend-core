<template>
  <div class="kanban-container">
    <div class="tab-options-container">
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
        <h3>{{ column.title }}</h3>
        <draggable
          v-model="column.items"
          v-bind="dragOptions"
          class="list-group"
          @start="isDragging = true"
          @end="isDragging = false"
        >
          <template>
            <div
              v-for="element in column.items"
              :key="element.id"
              class="list-group-item"
              @dblclick="showPanel"
            >
              <i
                :class="element.fixed ? 'fa fa-anchor' : 'glyphicon glyphicon-pushpin'"
                aria-hidden="true"
                @click="element.fixed = !element.fixed"
              />
              <strong>{{ element.name }}</strong>
              <p>{{ element.description }}</p>
            </div>
          </template>
          <div v-if="column.items.length < 1" class="empty-placeholder">Suelta aquí una tarjeta</div>
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
      />
    </el-drawer>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import store from '@/store'
import TabOptions from '@/components/ADempiere/TabManager/TabOptions.vue'
import PanelInfo from '@/components/ADempiere/PanelInfo'
import { defineComponent, computed, ref } from '@vue/composition-api'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'Kanban',
  components: {
    draggable,
    TabOptions,
    PanelInfo
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
    const columns = ref([])
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

    function showPanel() {
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
    function loadColumns() {
      const info = store.getters.getInfoKanban
      if (!isEmptyValue(info)) {
        const { steps, records } = info
        const result = steps.map(step => ({
          title: step.name,
          items: records
            .filter(record => record.group_id === step.value && !isEmptyValue(record.description))
            .map(record => ({
              id: record.id,
              name: record.title,
              description: record.description
            }))
        }))
        columns.value = result
      }
    }

    function searchInfoKanvan() {
      if (!isEmptyValue(displayDefinition.value)) {
        const filter = displayDefinition.value.find(display => display.display_type === 'K')
        const { id } = filter
        store.dispatch('searchPanelKanban', {
          id
        })
          .finally(() => {
            loadColumns()
          })
      }
    }
    // function handleCardMove(event, destinationColumn) {
    //   if (!isEmptyValue(event) && !isEmptyValue(event.added) && !isEmptyValue(event.added.element)) {
    //     const { id } = event.added.element
    //   }
    // }

    searchInfoKanvan()
    return {
      // Ref
      currentRecordLogs,
      // Constant
      isMobile,
      dragOptions,
      isDrawerWidth,
      showContainerInfo,
      defaultNameTab,
      tableName,
      displayDefinition,
      columns,
      //
      showPanel,
      searchInfoKanvan
    }
  }
})
</script>

<style>
.kanban-container {
  position: relative;
  padding-top: 4rem;
}

.kanban-columns-container {
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

/* Lista de ítems */
.list-group {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Ítems */
.list-group-item {
  cursor: grab;
  padding: 0.75rem 1rem;
  background-color: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  transition: background-color 0.2s, border-color 0.2s;
}

.list-group-item:hover {
  background-color: #f3f4f6;
  border-color: #c9d1d9;
}

.list-group-item i {
  cursor: pointer;
  margin-right: 8px;
  color: #57606a; /* Íconos estilo GitHub */
  transition: color 0.2s;
}

.list-group-item i:hover {
  color: #24292f; /* Cambia a color más oscuro al pasar el cursor */
}

.list-group-item strong {
  font-size: 1rem;
  color: #24292f;
}

.list-group-item p {
  font-size: 0.875rem;
  color: #57606a; /* Texto secundario */
  margin: 0.5rem 0 0;
}

/* Efecto visual al arrastrar */
.ghost {
  opacity: 0.5;
  background: #d8e2ec; /* Fondo más oscuro para destacar */
  border: 2px dashed #c9d1d9;
}
/* Estilo para la zona vacía */
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
  position: absolute; /* Fija el componente sobre las columnas */
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
</style>
