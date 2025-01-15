<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/ElsioSanchez
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
  <div v-loading="isLoading">
    <el-drawer
      :visible.sync="showContainerInfo"
      :with-header="true"
      :before-close="closePanel"
      :size="isDrawerWidth"
      class="drawer-panel-info"
    >
      <span slot="title">
        <svg-icon icon-class="tab" style="margin-right: 10px;" />
        {{ $t('window.containerInfo.log.tab') }}
      </span>
      <panel-info
        :all-tabs-list="allTabsList"
        :show-container-info="showContainerInfo"
        :container-manager="containerManager"
        :is-accounting-info="isAccountingInfo"
        :default-opened-tab="'getRecordLogs'"
        :record-id="recordId"
      />
    </el-drawer>
    <div v-if="!isPanel" class="tab-options-container-calendar">
      <advanced-tab-query
        :parent-uuid="parentUuid"
        :container-uuid="containerUuid"
        :container-manager="containerManager"
        :id-display-definition="filter.id"
        :name-list-server="'searchPanelResource'"
        style="float: right;"
      />
      <tab-options
        :container-manager="containerManager"
        :parent-uuid="parentUuid"
        :container-uuid="containerUuid"
        :current-tab-uuid="currentTabUuid"
      />
    </div>
    <el-card class="box-card">
      <FullCalendar
        class="demo-app-calendar"
        :options="calendarOptions"
      >
        <template
          v-slot:eventContent="arg"
        >
          <b @dblclick="openPanel(12)">{{ arg.timeText }}</b>
          <i>{{ arg.event.title }}</i>
        </template>
      </FullCalendar>
    </el-card>
  </div>
</template>

<script>
import lang from '@/lang'
import store from '@/store'

import {
  defineComponent,
  computed,
  ref
} from '@vue/composition-api'

// Components and Mixins
import FullCalendar from '@fullcalendar/vue'
import esLocale from '@fullcalendar/core/locales/es'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import TabOptions from '@/components/ADempiere/TabManager/TabOptions.vue'
import PanelInfo from '@/components/ADempiere/PanelInfo/index.vue'
import AdvancedTabQuery from '@/components/ADempiere/KanbanView/AdvancedTabQuery.vue'

// Utils and Helpers Methods
import { isEmptyValue, setRecordPath } from '@/utils/ADempiere/valueUtils.js'
import { translateDate } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'ResourceTimelineView',

  components: {
    TabOptions,
    FullCalendar, // make the <FullCalendar> tag available
    PanelInfo,
    AdvancedTabQuery
  },

  props: {
    isPanel: {
      type: Boolean,
      default: true
    },
    containerManager: {
      type: Object,
      required: false
    },
    parentUuid: {
      type: String,
      required: false
    },
    allTabsList: {
      type: Array,
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
    listResources: {
      type: Array,
      deafult: []
    },
    listEvents: {
      type: Array,
      deafult: []
    },
    resourcesInfo: {
      type: Object,
      deafult: {}
    },
    // used only window
    isAccountingInfo: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    /**
     * Ref
     */
    // const currentEvents = ref([])
    const recordId = ref('')
    /**
     * Computed
     */
    const isLoading = computed(() => {
      return store.getters.getIsLoadingResource
    })
    const currentEvents = computed(() => {
      return store.getters.getListTasksEvents
    })

    const defaultNameTab = computed(() => {
      return store.getters.getDefaultOpenedTab
    })

    const showContainerInfo = computed(() => {
      return store.getters.getShowLogs
    })

    const resource = computed(() => {
      return store.getters.getInfoResource
    })

    const groudResource = computed(() => {
      if (isEmptyValue(resource.value.groupsRecurso)) return []
      const { groupsRecurso } = resource.value
      return groupsRecurso
    })

    const recordsEvents = computed(() => {
      if (isEmptyValue(resource.value.recordsEvents)) return []
      const { recordsEvents } = resource.value
      return recordsEvents.map(list => {
        return {
          ...list,
          start: parse(list.start),
          end: parse(list.end)
        }
      })
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
    const tableName = computed(() => {
      const { currentTab } = store.getters.getContainerInfo
      if (!isEmptyValue(currentTab) && !isEmptyValue(currentTab.table_name)) return currentTab.table_name
      return ''
    })
    const displayDefinition = computed(() => {
      return store.getters.getDefinition
    })

    const calendarOptions = computed(() => {
      return {
        expandRows: true,
        navLinks: true, // can click day/week names to navigate views
        selectable: true,
        nowIndicator: true,
        dayMaxEvents: true, // allow "more" link when too many
        timeZone: 'UTC',
        plugins: [resourceTimelinePlugin],
        headerToolbar: {
          left: 'today prev,next',
          center: 'title',
          right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth,resourceTimelineYear'
        },
        resourceAreaWidth: '25%',
        initialView: 'resourceTimelineMonth',
        resourceGroupField: 'building',
        eventMinWidth: 90,
        scrollTime: '08:00',
        aspectRatio: 1.5,
        editable: true,
        resourceAreaHeaderContent: lang.t('window.containerInfo.log.resource'),
        resources: groudResource.value,
        events: recordsEvents.value,
        views: {
          resourceTimelineDay: {
            slotDuration: '00:30:00', // Intervalos de 30 minutos
            slotLabelInterval: '00:30:00' // Etiquetas cada 30 minutos
          },
          resourceTimelineWeek: {
            slotDuration: '01:00:00', // Intervalos de 1 hora
            slotLabelInterval: '01:00:00' // Etiquetas cada 1 hora
          },
          resourceTimelineMonth: {
            slotDuration: { days: 1 }, // Intervalos de 1 día
            slotLabelInterval: { days: 1 } // Etiquetas cada día
          },
          resourceTimelineYear: {
            slotDuration: { months: 1 }, // Intervalos de 1 mes
            slotLabelInterval: { months: 1 } // Etiquetas cada mes
          }
        },
        datesSet: function(info) {
          changeRange(info)
        },
        eventClick: openPanel
      }
    })

    /**
     * Methods
     */

    function changeRange(params) {
      if (isEmptyValue(params)) return
      const { endStr, startStr } = params
      store.dispatch('setDateDefault', {
        endStr: endStr.split('T')[0],
        startStr: startStr.split('T')[0]
      })
      return { endStr, startStr }
    }

    const openPanel = (info) => {
      recordId.value = Number(info.event._def.publicId)
      setRecordPath({
        recordId: recordId.value
      })
      setTimeout(() => {
        console.log({ info, recordId: recordId.value })
        store.commit('setShowLogs', true)
      }, 500)
    }

    function handleDateSelect(selectInfo) {
      if (!selectInfo) {
        return
      }
      // const title = prompt(lang.t('component.calendar.titleNewEvent'))
      const calendarApi = selectInfo.view.calendar
      calendarApi.unselect() // clear date selection
      // if (title) {
      //   calendarApi.addEvent({
      //     id: createEventId(),
      //     title,
      //     start: selectInfo.startStr,
      //     end: selectInfo.endStr,
      //     allDay: selectInfo.allDay
      //   })
      // }
    }

    function handleEventClick(clickInfo) {
      if (confirm(`${lang.t('component.calendar.deleteEventConfirm')} '${clickInfo.event.title}'`)) {
        clickInfo.event.remove()
      }
    }

    function handleEvents(events) {
      // currentEvents.value = events
    }

    function parse(dateToParse) {
      const parts = dateToParse.split('T')[0].split('-')
      return `${parts[0]}-${parts[1]}-${parts[2]}`
    }

    const filter = displayDefinition.value.find(display => display.display_type === 'R')

    function searchListCalendars() {
      if (!isEmptyValue(displayDefinition.value)) {
        let filters
        if (props.isPanel) {
          filters = [{ name: [tableName.value] + '_ID', values: recordId.value }]
          filters = JSON.stringify(filters)
        }
        store.dispatch('searchPanelResource', {
          id: filter.id,
          filters
        })
      }
    }

    function closePanel() {
      store.commit('setShowLogs', false)
    }
    // searchListCalendars()
    return {
      // Ref
      currentEvents,
      recordId,
      filter,
      // Computed
      isMobile,
      defaultNameTab,
      showContainerInfo,
      calendarOptions,
      isDrawerWidth,
      groudResource,
      recordsEvents,
      resource,
      isLoading,
      // Methods
      openPanel,
      closePanel,
      searchListCalendars,
      handleDateSelect,
      handleEventClick,
      handleEvents,
      translateDate,
      changeRange,
      //
      esLocale,
      listPlugin,
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin
    }
  }
})
</script>

<style lang='scss'>
.demo-app {
  display: flex !important;
  height: calc(100vh - 180px);
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;

  .demo-app-sidebar {
    width: 300px;
    line-height: 1.5;
    background: #eaf9ff;
    border-right: 1px solid #d3e2e8;
    h2 {
      margin: 0;
      font-size: 16px;
    }

    ul {
      overflow: auto;
      height: calc(100vh - 210px);
      padding: 0px 5px;
      margin: 0;
    }

    li {
      margin: 0.5em 0;
      padding: 0;
    }

    b { /* used for event dates/times */
      margin-right: 3px;
    }
  }

  .demo-app-main {
    flex-grow: 1;
    /* padding: 3em; */
    padding: 1em;

    .demo-app-sidebar-section {
      padding: 2em;
    }
  }

  .fc { /* the calendar root */
    /* max-width: 1100px; */
    margin: 0 auto;
    /* max-width: auto; */
    width: auto;
    height: 50%;
    overflow: auto;
    display: block;
  }
}

.fc-resource-area {
  width: 200px; /* Ajusta este valor según sea necesario */
}

.fc-resource-group {
  white-space: normal; /* Permite que el texto se ajuste a varias líneas */
  overflow: visible; /* Asegúrate de que el desbordamiento sea visible */
  text-overflow: clip; /* Evita el recorte del texto */
}

.fc-resource-group {
  white-space: nowrap; /* Evita que el texto se ajuste a varias líneas */
  overflow: hidden; /* Oculta el desbordamiento */
  text-overflow: ellipsis; /* Muestra puntos suspensivos para el texto recortado */
}

.fc .fc-view-harness {
  flex-grow: 1;
  position: relative;
  height: 85ch !important;
}

// .fc .fc-scroller-harness-liquid {
//   height: 60% !important;
// }
.fc-resource-area {
  width: 200px; /* Ajusta este valor según sea necesario */
}

.fc-resource-group {
  white-space: normal; /* Permite que el texto se ajuste a varias líneas */
  overflow: visible; /* Asegúrate de que el desbordamiento sea visible */
  text-overflow: clip; /* Evita el recorte del texto */
}

.fc-license-message {
  color: transparent;
  background: transparent !important;
  z-index: -1 !important;
  border: 0px !important;
}

.custom-card-calendar {
  margin: 0px;
  cursor: pointer;
}
.custom-card-calendar:hover {
  background-color: #eaf5fe;
  border: 1px solid #36a3f7;
}
.tab-options-container-calendar {
  position: relative;
  left: 0;
  right: 0;
  z-index: 10;
  background: #ffffff;
  padding: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

</style>
