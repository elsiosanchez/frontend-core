<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez Elsiosanchez15@outlook.com https://github.com/Elsiosanchez
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
  <component
    :is="templateDevice"
    :record="record"
    :table-name="tableName"
  />
</template>

<script>
export default {
  name: 'RecordAccess',

  props: {
    record: {
      type: Object,
      default: () => {}
    },
    tableName: {
      type: String,
      default: undefined
    }
  },

  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    templateDevice() {
      if (this.isMobile) {
        return () => import('@/components/ADempiere/RecordAccess/recordAccessMobile')
      }
      return () => import('@/components/ADempiere/RecordAccess/recordAccessDesktop')
    }
  }
}
</script>
