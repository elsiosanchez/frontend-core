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
      v-if="isPanelRight"
      class="info-definitions"
    >
      <span style="font-weight: bold;">
        {{ currentDisplyDefinitions.name }}
      </span>
      <div style="color: rgb(130, 132, 138);">
        {{ currentDisplyDefinitions.description }}
      </div>
    </div>
    <el-card v-loading="isLoading" :body-style="{ padding: '10px' }">
      <div class="kanban-columns-container" style="display: block;">
        <FullCalendar
          class="demo-app-resource"
          :options="calendarOptions"
        >
          <template
            v-slot:eventContent="arg"
          >
            <p
              style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;margin: 0px;padding: 0px;height: 20px;line-height: 15px;font-size: 10px;"
              @click="openDetails(arg)"
            >
              {{ arg.event.title }}
            </p>
          </template>
        </FullCalendar>
      </div>
    </el-card>
    <el-dialog
      :title="currentResource.title"
      :visible.sync="dialogVisibleDetails"
      custom-class="details-resource"
    >
      <see-details-calendar
        :current-resource="currentResource"
        :is-panel-right="isPanelRight"
        :close-details="closeDetails"
      >
        <template v-slot:footer>
          <el-button v-if="!isPanelRight" @click="isOpenDetails(currentResource.id),closeDetails()">{{ $t('component.date.seeDetails') }}</el-button>
        </template>
      </see-details-calendar>

    </el-dialog>
  </span>
</template>

<script>
import {
  defineComponent,
  computed,
  ref
} from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'

// Components and Mixins
import FullCalendar from '@fullcalendar/vue'
import SeeDetailsCalendar from '@/components/ADempiere/TabManager/tabDisplayDefinitions/componentPanel/seeDetailsCalendar.vue'
import esLocale from '@fullcalendar/core/locales/es'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { parseDate } from '@/utils/ADempiere/displayDefinition/resourceTime.js'

export default defineComponent({
  name: 'ResourceDefinitions',

  components: {
    FullCalendar,
    SeeDetailsCalendar
  },

  props: {
    parentUuid: {
      type: String,
      required: false
    },
    containerManager: {
      type: Object,
      required: false
    },
    actionsManager: {
      type: Object,
      required: false
    },
    currentTabUuid: {
      type: String,
      default: ''
    },
    tabUuid: {
      type: String,
      default: ''
    },
    tabAttributes: {
      type: Object,
      default: () => ({})
    },
    tabsList: {
      type: Array,
      required: false
    },
    allTabsList: {
      type: Array,
      required: false
    },
    // used only window
    isPanelRight: {
      type: Boolean,
      default: false
    },
    isOpenDetails: {
      type: Function,
      default: (recordPrevious) => {
        console.info('implement method Change to Previous Record ', recordPrevious)
      }
    }
  },

  setup(props) {
    // Ref
    const dialogVisibleDetails = ref(false)
    const currentResource = ref({})
    // Computed
    const currenPanelResource = computed(() => {
      return store.getters.getResourcePanel({
        tableName: props.tabAttributes.table_name,
        isPanel: props.isPanelRight
      })
    })
    const groupedResourcesList = computed(() => {
      if (props.isPanelRight) {
        const { resourcesList } = store.getters.getCurrentResourcePanelRightDefinition({
          tableName: props.tabAttributes.table_name
        })
        if (isEmptyValue(resourcesList)) {
          return []
        }
        return resourcesList
      }

      const { resourcesList } = store.getters.getCurrentResourceDefinition({
        tableName: props.tabAttributes.table_name
      })
      if (isEmptyValue(resourcesList)) {
        return []
      }
      return resourcesList
    })

    const resourceEventsList = computed(() => {
      if (props.isPanelRight) {
        const { eventsList } = store.getters.getCurrentResourcePanelRightDefinition({
          tableName: props.tabAttributes.table_name
        })
        if (isEmptyValue(eventsList)) {
          return []
        }
        return eventsList
      }

      const { eventsList } = store.getters.getCurrentResourceDefinition({
        tableName: props.tabAttributes.table_name
      })
      if (isEmptyValue(eventsList)) {
        return []
      }
      return eventsList
    })

    const calendarOptions = computed(() => {
      return {
        expandRows: true,
        navLinks: true, // can click day/week names to navigate views
        selectable: true,
        nowIndicator: true,
        // dayMaxEvents: true, // allow "more" link when too many
        // timeZone: 'UTC',
        plugins: [resourceTimelinePlugin],
        headerToolbar: {
          left: 'today prev,next',
          center: 'title',
          right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth,resourceTimelineYear'
        },
        resourceAreaWidth: '30%',
        initialView: 'resourceTimelineMonth',
        eventMinWidth: 90,
        locale: esLocale,
        scrollTime: '01:00',
        // aspectRatio: 1,
        // editable: true,
        resourceAreaHeaderContent: lang.t('window.containerInfo.log.resource'),
        // resourceGroupField: 'group_name',
        resources: groupedResourcesList.value,
        events: resourceEventsList.value,
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
        datesSet: function(info, event) {
          changeRange(info)
        }
      }
    })

    const currentDisplyDefinitions = computed(() => {
      if (props.isPanelRight) {
        return store.getters.getCurrentDisplayPanelRightDefinitions({ tableName: props.tabAttributes.table_name })
      }
      return store.getters.getCurrentDisplayTabDefinitions({
        tableName: props.tabAttributes.table_name
      })
    })

    const isLoading = computed(() => {
      if (props.isPanelRight) return store.getters.getResourcePanelRightLoading({ tableName: props.tabAttributes.table_name })
      return store.getters.getResourceLoading({
        tableName: props.tabAttributes.table_name
      })
    })

    const currentRecord = computed(() => {
      return store.getters.getTabCurrentRow({
        containerUuid: props.tabAttributes.containerUuid
      })
    })

    // Mehtods

    function changeRange(params) {
      const definition = currentDisplyDefinitions.value
      // if (isEmptyValue(definition)) {
      //   definition = store.getters.getDisplayPanelRightDefinitions({ tableName: props.tabAttributes.table_name }).currentDefinition
      // }

      if (isEmptyValue(params) || isEmptyValue(definition)) {
        return
      }
      const { endStr, startStr } = params
      store.dispatch('changeDateRange', {
        endStr: parseDate(endStr),
        startStr: parseDate(startStr),
        isPanel: props.isPanelRight,
        id: definition.id,
        tableName: props.tabAttributes.table_name,
        recordId: currentRecord.value[props.tabAttributes.table_name + '_ID']
      })
    }

    function openDetails(params) {
      dialogVisibleDetails.value = true
      currentResource.value = params.event
    }

    function closeDetails() {
      dialogVisibleDetails.value = false
    }

    return {
      // Ref
      currentResource,
      dialogVisibleDetails,
      // computeds
      isLoading,
      calendarOptions,
      currentDisplyDefinitions,
      resourceEventsList,
      groupedResourcesList,
      currentRecord,
      currenPanelResource,
      //
      esLocale,
      listPlugin,
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin,
      // Mehtods
      openDetails,
      changeRange,
      closeDetails
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
