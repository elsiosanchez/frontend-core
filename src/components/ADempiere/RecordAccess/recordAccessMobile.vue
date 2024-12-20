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
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix" style="padding-bottom: 2%;">
        <span>
          {{ $t('data.recordAccess.actions') }}
        </span>
      </div>
      <div style="margin-bottom: 5%;">
        <span style="margin-bottom: 5%;">
          {{ $t('data.recordAccess.availableRoles') }} ({{ labelListExclude.length }})
        </span>
        <br>
        <el-select
          v-model="labelListExclude"
          multiple
          style="margin-top: 2.5%;"
          filterable
          placeholder="Select"
          collapse-tags
          @change="addListExclude"
        >
          <el-option
            v-for="item in includedList"
            :key="item.uuid"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </div>
      <div>
        <span
          style="margin-bottom: 5%;"
        >
          {{ $t('data.recordAccess.modeMobile.accessRoles') }} ({{ labelListInclude.length }})
        </span>
        <br>
        <el-select
          v-model="labelListInclude"
          multiple
          placeholder="Select"
          filterable
          collapse-tags
          style="margin-top: 2.5%;"
          @change="addListInclude"
        >
          <el-option
            v-for="item in excludedList"
            :key="item.uuid"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </div>
      <!-- Roles with Access and Read Only -->
      <div
        style="padding-top: 9%;"
      >
        <span
          style="margin-bottom: 5%;"
        >
          {{ $t('data.recordAccess.modeMobile.accessRolesIsReadonly') }} ({{ listRolesLockReadOnly.length }})
        </span>
        <br>
        <el-select
          v-model="listRolesLockReadOnly"
          multiple
          placeholder="Select"
          filterable
          collapse-tags
          style="margin-top: 2.5%;"
          @change="addRolesLockReadOnly"
        >
          <el-option
            v-for="item in includedList.filter(element => element.is_exclude)"
            :key="item.uuid"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </div>
      <!-- Locked Roles -->
      <div
        style="padding-top: 9%;"
      >
        <span
          style="margin-bottom: 5%;"
        >
          {{ $t('data.recordAccess.modeMobile.lockedRoles') }} ({{ listRolesLock.length }})
        </span>
        <br>
        <el-select
          v-model="listRolesLock"
          multiple
          placeholder="Select"
          filterable
          collapse-tags
          style="margin-top: 2.5%;"
          @change="addRolesLock"
        >
          <el-option
            v-for="item in includedList"
            :key="item.uuid"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </div>
      <!-- Locked Roles with Dependent Entities -->
      <div
        style="padding-top: 9%;"
      >
        <span
          style="margin-bottom: 5%;"
        >
          {{ $t('data.recordAccess.modeMobile.lockedRolesIsDependentEntities') }} ({{ listRolesUnLock.length }})
        </span>
        <br>
        <el-select
          v-model="listRolesUnLock"
          multiple
          placeholder="Select"
          filterable
          collapse-tags
          style="margin-top: 2.5%;"
          @change="addlockedRolesIsDependentEntities"
        >
          <el-option
            v-for="item in includedList.filter(element => !element.is_exclude)"
            :key="item.uuid"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </div>
    </el-card>
    <span style="float: right;padding-top: 1%;">
      <el-button
        type="danger"
        icon="el-icon-close"
        @click="close"
      />
      <el-button
        type="primary"
        icon="el-icon-check"
        @click="SendRecorAccess(includedList)"
      />
    </span>
  </div>
</template>

<script>
import recordAccessMixin from './recordAccess.js'

export default {
  name: 'RecordAccessMobile',

  mixins: [recordAccessMixin],

  props: {
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      default: undefined
    },
    order: {
      type: String,
      default: undefined
    },
    included: {
      type: String,
      default: undefined
    },
    keyColumn: {
      type: String,
      default: undefined
    },
    identifiersList: {
      type: Array,
      default: undefined
    }
  },

  data() {
    return {
      group: 'sequence',
      is_read_only: false,
      is_dependent_entities: false,
      labelListInclude: [],
      labelListExclude: []
    }
  },

  computed: {
    listExclude() {
      return this.excludedList.map(element => {
        return element.name
      })
    },
    listInclude() {
      return this.includedList.map(element => {
        return element.name
      })
    },
    listRolesLock: {
      get() {
        const list = this.includedList.filter(element => {
          return !element.is_exclude
        })
        if (list) {
          return list.map(element => {
            return element.name
          })
        }
        return []
      },
      set(value) {
      }
    },
    listRolesLockReadOnly: {
      get() {
        const list = this.includedList.filter(element => {
          if (element.is_exclude && element.is_read_only) {
            return element
          }
        })
        if (list) {
          return list.map(element => {
            return element.name
          })
        }
        return []
      },
      set(value) {
      }
    },
    listLabelRolesLockReadOnly: {
      get() {
        const list = this.includedList.filter(element => {
          if (!element.is_exclude && element.is_read_only) {
            return element
          }
        })
        if (list) {
          return list.map(element => {
            return element.name
          })
        }
        return []
      },
      set(value) {
      }
    },
    listRolesUnLock: {
      get() {
        const list = this.includedList.filter(element => {
          if (!element.is_exclude && element.is_dependent_entities) {
            return element
          }
        })
        if (list) {
          return list.map(element => {
            return element.name
          })
        }
        return []
      },
      set(value) {
      }
    }
  },

  watch: {
    listInclude(value) {
      this.labelListInclude = value
    },
    listExclude(value) {
      this.labelListExclude = value
    }
  },

  methods: {
    addListInclude(element) {
      const index = this.recordAccess.roles.findIndex(item => {
        if (element[element.length - 1] === item.name) {
          return item
        }
      })
      if (index >= 0) {
        this.addItem({
          index,
          element: this.recordAccess.roles[index]
        })
      }
    },
    addListExclude(element) {
      const index = this.recordAccess.roles.findIndex(item => {
        if (element[element.length - 1] === item.name) {
          return item
        }
      })
      if (index >= 0) {
        this.deleteItem({
          index,
          element: this.recordAccess.roles[index]
        })
      }
    },
    addRolesLock(element) {
      const index = this.recordAccess.roles.findIndex(item => {
        if (element[element.length - 1] === item.name) {
          return item
        }
      })

      if (index >= 0) {
        this.recordAccess.roles[index].is_exclude = !this.recordAccess.roles[index].is_exclude
      }
    },
    addRolesLockReadOnly(element) {
      const index = this.recordAccess.roles.find(item => {
        if (element[element.length - 1] === item.name) {
          return item
        }
      })
      if (index) {
        index.is_read_only = !index.is_read_only
      } else {
        const undo = this.recordAccess.roles.find(item => {
          if (this.listRolesLockReadOnly[0] === item.name) {
            return item
          }
        })
        undo.is_read_only = !undo.is_read_only
      }
    },
    addlockedRolesIsDependentEntities(element) {
      const index = this.recordAccess.roles.find(item => {
        if (element[element.length - 1] === item.name) {
          return item
        }
      })
      if (index) {
        index.is_dependent_entities = !index.is_dependent_entities
      } else {
        const undo = this.recordAccess.roles.find(item => {
          if (this.listRolesUnLock[0] === item.name) {
            return item
          }
        })
        undo.is_dependent_entities = !undo.is_dependent_entities
      }
    },
    SendRecorAccess(list) {
      this.saveRecordAccess(list)
    }
  }
}
</script>

<style lang="scss" scoped>
  .board-column {
    min-width: 250px;
    min-height: 70px;
    height: auto;
    overflow: hidden;
    background: #f0f0f0;
    border-radius: 3px;

    .board-column-header {
      height: 50px;
      line-height: 50px;
      overflow: hidden;
      padding: 0 20px;
      text-align: center;
      background: #333;
      color: #fff;
      border-radius: 3px 3px 0 0;
    }

    .board-column-content {
      height: auto;
      overflow: hidden;
      border: 10px solid transparent;
      min-height: 60px;
      display: flex;
      justify-content: flex-start;
      flex-direction: column;
      align-items: center;

      .board-item {
        cursor: pointer;
        width: 100%;
        height: 30px;
        margin: 5px 0;
        background-color: #fff;
        text-align: left;
        line-height: 30px;
        padding: 0px 10px;
        box-sizing: border-box;
        box-shadow: 0px 1px 3px 0 rgba(0, 0, 0, 0.2);
      }
    }
  }
</style>
<style lang="scss">
  .el-card__header {
    background: rgba(245, 247, 250, 0.75);
    padding-top: 18px;
    padding-right: 20px;
    padding-bottom: 1%;
    padding-left: 20px;
    border-bottom: 1px solid #f5f7fa;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .el-card__body {
    padding-top: 2.5%;
  }
  .scroll-panel-right-mode-mobile {
    max-height: 200px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  // .el-scrollbar__bar.is-vertical > div {
  //   width: 100%;
  //   transform: translateY(998%);
  // }
  .board {
    width: 100%;
    margin-left: 20px;
    display: flex;
    justify-content: space-around;
    flex-direction: row;
    align-items: flex-start;
  }
  .kanban {
    &.todo {
      .board-column-header {
        background: #f9944a;
      }
    }
    &.working {
      .board-column-header {
        background: #4A9FF9;
      }
    }
  }
</style>
