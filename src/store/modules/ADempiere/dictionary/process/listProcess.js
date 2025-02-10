/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Ricardo Fenomeno ricardofenomeno13@gmail.com https://github.com/Ricrgame
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import Vue from 'vue'

import {
  requestListProcesses
} from '@/api/ADempiere/dictionary/process'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

const initState = {
  listProcess: {}
}

const process = {
  state: initState,
  mutations: {
    setListProcess(state, {
      list,
      tableName
    }) {
      Vue.set(state.listProcess, tableName, list)
    }
  },
  actions: {
    geProcessesListFromServer({ commit }, {
      tableName
    }) {
      return new Promise((resolve, reject) => {
        requestListProcesses({
          tableName
        })
          .then(response => {
            if (!isEmptyValue(response)) {
              const list = response.processes.map(data => {
                let icon = 'el-icon-setting'
                if (data.is_report) {
                  icon = 'skill'
                }
                return {
                  ...data,
                  icon
                }
              })
              commit('setListProcess', {
                list,
                tableName
              })
            }
            resolve(response)
          })
          .catch(error => {
            reject(error)
          })
      })
    }
  },
  getters: {
    getListProcess: (state) => ({ tableName }) => {
      return state.listProcess[tableName]
    }
  }
}

export default process
