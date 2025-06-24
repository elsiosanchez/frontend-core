<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
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
  <span class="tablePos">
    <el-table
      id="tablePos"
      ref="tablePos"
      :data="lines"
      :border="true"
      height="60vh"
      fit
      highlight-current-row
      style="height: 100% !important; font-size: 12px !important;"
      @cell-click="editLine"
      @cell-dblclick="editLineExit"
      @current-change="handleCurrentChangeOrderLine"
    >
      <template v-for="(valueOrder, key) in orderLineDefinition">
        <el-table-column
          v-if="displayLabel({ row: valueOrder })"
          :key="key"
          :column-key="valueOrder.columnName"
          :label="valueOrder.label"
          :min-width="sizeTableColumn(valueOrder.columnName)"
          :align="valueOrder.isNumeric ? 'right' : 'left'"
        >
          <template slot-scope="scope">
            <span
              v-if="scope.row.isEditCurrentPrice && valueOrder.columnName === 'CurrentPrice'"
            >
              <p
                v-if="isLoadingPrice"
                style="text-align: center;margin: 0px;"
              >
                <i
                  class="el-icon-loading"
                  style="font-size: 20px;"
                />
              </p>
              <edit-amount
                v-else-if="scope.row.isEditCurrentPrice && valueOrder.columnName === 'CurrentPrice'"
                :value="convertToNumber(scope.row.price)"
                :handle-change="updateCurrentPrice"
              />
            </span>
            <span
              v-else-if="scope.row.isEditQtyEntered && valueOrder.columnName === 'QtyEntered'"
            >
              <p
                v-if="isLoadingQty"
                style="text-align: center;margin: 0px;"
              >
                <i
                  class="el-icon-loading"
                  style="font-size: 20px;"
                />
              </p>
              <edit-qty-entered
                v-else-if="scope.row.isEditQtyEntered && valueOrder.columnName === 'QtyEntered'"
                :qty="convertToNumber(scope.row.quantity_ordered)"
                :handle-change="updateQuantity"
              />
            </span>
            <span
              v-else-if="scope.row.isEditDiscount && valueOrder.columnName === 'Discount'"
            >
              <p
                v-if="isLoadingDiscount"
                style="text-align: center;margin: 0px;"
              >
                <i
                  class="el-icon-loading"
                  style="font-size: 20px;"
                />
              </p>
              <edit-amount
                v-else
                :value="convertToNumber(scope.row.discount_rate)"
                :handle-change="updateDiscount"
                :precision="2"
              />
            </span>
            <span v-else>
              <p style="margin: 0px !important;">
                <el-button
                  v-show="valueOrder.columnName === 'LineDescription'"
                  icon="el-icon-document-copy"
                  style="padding: 0px;"
                  type="text"
                  @click="copyCode(scope.row)"
                />
                {{ displayValue({ row: scope.row, columnName: valueOrder.columnName}) }}
              </p>
            </span>
          </template>
        </el-table-column>
      </template>
      <el-table-column
        :label="$t('form.pos.tableProduct.options')"
        :align="'center'"
        header-align="center"
        width="160"
        style="padding: 0px !important;"
      >
        <option-line
          slot-scope="scope"
          :line="scope.row"
        />
      </el-table-column>
    </el-table>
  </span>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'
import lang from '@/lang'
import store from '@/store'

// Components and Mixins
import EditAmount from '@/components/ADempiere/Form/VPOS2/MainOrder/OptionLine/editLine/editAmount.vue'
import EditQtyEntered from '@/components/ADempiere/Form/VPOS2/MainOrder/OptionLine/editLine/editQtyEntered.vue'
import OptionLine from '@/components/ADempiere/Form/VPOS2/MainOrder/OptionLine'

// Utils and Helper Methods
import {
  displayLabel,
  displayValue,
  sizeTableColumn,
  displayLineQtyEntered
} from '@/utils/ADempiere/dictionary/form/VPOS'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { copyToClipboard } from '@/utils/ADempiere/coreUtils.js'
import { convertToNumber } from '@/utils/ADempiere/formatValue/numberFormat'

export default defineComponent({
  name: 'MainOrder',

  components: {
    EditAmount,
    EditQtyEntered,
    OptionLine
  },

  setup() {
    /**
     * Ref
     * @currentLine {Object}
     * @isLoadingDiscount {Boolean}
     * @isLoadingQty {Boolean}
     * @currentLine {Boolean}
     */
    const currentLine = ref({})
    const isLoadingDiscount = ref(false)
    const isLoadingQty = ref(false)
    const isLoadingPrice = ref(false)

    /**
     * Computed
     * @lines
     * @orderLineDefinition
     * @isLoading
     * @currentPos
     */
    const lines = computed(() => {
      return store.getters.getListOrderLines
    })

    const orderLineDefinition = computed(() => {
      return {
        lineDescription: {
          columnName: 'LineDescription',
          label: lang.t('form.pos.tableProduct.product'),
          isNumeric: false,
          size: 'auto'
        },
        currentPrice: {
          columnName: 'CurrentPrice',
          label: lang.t('form.productInfo.price'),
          isNumeric: true,
          size: '150px'
        },
        quantityOrdered: {
          columnName: 'QtyEntered',
          label: lang.t('form.pos.tableProduct.quantity'),
          isNumeric: true,
          size: '125px'
        },
        uom: {
          columnName: 'UOM',
          label: lang.t('form.pos.tableProduct.uom'),
          isNumeric: false,
          size: '75px'
        },
        discount: {
          columnName: 'Discount',
          label: lang.t('form.pos.order.discount'),
          isNumeric: true,
          size: '100px'
        },
        discountTotal: {
          columnName: 'DiscountTotal',
          label: lang.t('form.pos.tableProduct.displayDiscountAmount'),
          isNumeric: true,
          size: '125px'
        },
        discounDisplayTaxIndicator: {
          columnName: 'taxIndicator',
          label: lang.t('form.pos.tableProduct.taxRate'),
          isNumeric: true,
          size: '80px'
        },
        discounDisplayTaxAmounttTotal: {
          columnName: 'DisplayTaxAmount',
          label: lang.t('form.pos.tableProduct.taxAmount'),
          isNumeric: true,
          size: '150px'
        },
        grandTotal: {
          columnName: 'GrandTotal',
          label: 'Total',
          isNumeric: true,
          isVisible: true,
          size: '150px'
        },
        convertedAmount: {
          columnName: 'ConvertedAmount',
          label: lang.t('form.pos.collect.convertedAmount'),
          isNumeric: true,
          size: '150px'
        }
      }
    })

    const isLoading = computed(() => {
      return store.getters.getLoadingLines
    })

    const currentPos = computed(() => {
      return store.getters.getVPOS
    })

    const currentOrder = computed(() => {
      return store.getters.getCurrentOrder
    })

    const validateProcess = computed(() => {
      const { is_processed, is_processing } = currentOrder.value
      return is_processed || is_processing
    })

    /**
     * Methods copyCode
     * @param {*} value - The object containing the product information.
     * @param {Object} value.product - The object representing the product.
     * @param {string} value.product.value - The value of the product to be copied.
     *
     * @returns {void} Returns no value.
     *
     * @example
     * const productInfo = {
     * product: {
     *  value: 'product code 12345'
     * }
     */
    function copyCode(value) {
      copyToClipboard({
        text: value.product.value,
        isShowMessage: true
      })
    }

    /**
     * Handles the change of the current line in the order.
     *
     * This function takes care of updating the status of the current line in the Vuex store and also updates a local reactive reference.
     * Vuex store and also updates a local reactive reference.
     * It is used to reflect the change of the selected line in the user interface and in the status of the order.
     * user interface and in the global state of the application.
     *
     * @param {Object} line - The order line that is set as the current line.
     * Must be an object that contains the relevant information * of the order line
     * of the order line.
     *
     * @returns {void} Returns no value.
     *
     * @example
     * // Suppose we have an order line.
     * const orderLine = { id: 1, product: 'Product A', quantity: 2 };
     * handleCurrentChangeOrderLine(orderLine);
     *
     * This will update the state in the store and the local reference.
     */

    function handleCurrentChangeOrderLine(line) {
      store.commit('setCurrentLine', line)
      currentLine.value = line
    }

    /**
     * Enables editing of a row according to the selected column.
     * -
     * This function is used to mark a specific row as editable
     * depending on the column being edited. Depending on the key
     * of the column, a flag is set in the corresponding row
     * to allow editing of certain fields (current price, quantity * entered or discount)
     * entered or discount).
     * -
     * @param {Object} row - The row of the order to be edited
     * Must be an object representing a row
     * in the table, with properties indicating
     * whether each field can be edited.
     * -
     * @param {Object} column - The column being edited
     * Must be an object containing information
     * about the column, including its key.
     * -
     * @param {Object} cell - The object of the cell being edited
     * This parameter may contain additional information
     * about the cell, although it is not used in this function.
     *
     * @returns {void} Returns no value.
     *
     * @example
     * // Suppose we have a row and a column.
     * const row = { isEditCurrentPrice: false, isEditQtyEntered: false, isEditDiscount: false };
     * const column = { columnKey: 'CurrentPrice' };
     * editLine(row, column);
     *
     */

    function editLine(row, column, cell) {
      if (validateProcess.value) return
      const { columnKey } = column
      if (columnKey === 'CurrentPrice') row.isEditCurrentPrice = true
      if (columnKey === 'QtyEntered') row.isEditQtyEntered = true
      if (columnKey === 'Discount') row.isEditDiscount = true
    }

    function editLineExit(row, column, cell) {
      const { columnKey } = column
      if (columnKey === 'QtyEntered') row.isEditQtyEntered = false
      if (columnKey === 'CurrentPrice') row.isEditCurrentPrice = false
      if (columnKey === 'Discount') row.isEditDiscount = false
    }

    function refreshLine(line) {
      currentLine.value.available_quantity = line.line.available_quantity
      currentLine.value.base_tax_amoun = line.base_tax_amoun
      currentLine.value.charge = line.charge
      currentLine.value.description = line.description
      currentLine.value.discount_amount = line.discount_amount
      currentLine.value.discount_rate = line.discount_rate
      currentLine.value.id = line.id
      currentLine.value.line = line.line
      currentLine.value.line_description = line.line_description
      currentLine.value.list_tax_amount = line.list_tax_amount
      currentLine.value.order_id = line.order_id
      currentLine.value.price = line.price
      currentLine.value.price_base = line.price_base
      currentLine.value.price_base_with_tax = line.price_base_with_tax
      currentLine.value.price_list = line.price_list
      currentLine.value.price_list_with_tax = line.price_list_with_tax
      currentLine.value.price_with_tax = line.price_with_tax
      currentLine.value.product = line.product
      currentLine.value.product_uom = line.product_uom
      currentLine.value.quantity = line.quantity
      currentLine.value.quantity_ordered = line.quantity_ordered
      currentLine.value.resource_assignment = line.resource_assignment
      currentLine.value.source_rma_line_id = line.source_rma_line_id
      currentLine.value.tax_amount = line.tax_amount
      currentLine.value.tax_rate = line.tax_rate
      currentLine.value.total_amount = line.total_amount
      currentLine.value.total_amount_converted = line.total_amount_converted
      currentLine.value.total_amount_with_tax = line.total_amount_with_tax
      currentLine.value.total_amount_with_tax_converted = line.total_amount_with_tax_converted
      currentLine.value.total_base_amount = line.total_base_amount
      currentLine.value.total_base_amount_with_tax = line.total_base_amount_with_tax
      currentLine.value.total_discount_amount = line.total_discount_amount
      currentLine.value.total_tax_amount = line.total_tax_amount
    }

    function updateCurrentPrice(price) {
      const { is_modify_price } = currentPos.value
      const {
        quantity_ordered
      } = currentLine.value
      if (!is_modify_price) {
        store.dispatch('setModalPin', {
          title: lang.t('form.pos.pinMessage.pin') + lang.t('form.pos.pinMessage.price'),
          doneMethod: () => {
            isLoadingPrice.value = true
            store.dispatch('updateCurrentLine', {
              lineId: currentLine.value.id,
              quantity: quantity_ordered,
              price
            })
              .then(updateLineResponse => {
                refreshLine(updateLineResponse)
                isLoadingPrice.value = false
                if (currentLine && currentLine.value) {
                  currentLine.value.isEditCurrentPrice = false
                }
              })
              .catch(() => {
                isLoadingPrice.value = false
                currentLine.value.isEditCurrentPrice = true
              })
          },
          cancelMethod: () => {
            if (currentLine && currentLine.value) {
              currentLine.value.isEditCurrentPrice = false
            }
            isLoadingPrice.value = false
          },
          requestedAccess: 'IsModifyPrice',
          requestedAmount: price,
          isShowed: true
        })
        return
      }
      isLoadingPrice.value = true
      store.dispatch('updateCurrentLine', {
        lineId: currentLine.value.id,
        quantity: quantity_ordered,
        price
      })
        .then(updateLineResponse => {
          refreshLine(updateLineResponse)
          isLoadingPrice.value = false
          if (currentLine && currentLine.value) {
            currentLine.value.isEditCurrentPrice = false
          }
        })
        .catch(() => {
          isLoadingPrice.value = false
          if (currentLine && currentLine.value) {
            currentLine.value.isEditCurrentPrice = false
          }
        })
    }
    function updateQuantity(quantity) {
      if (isEmptyValue(currentLine.value)) {
        return
      }
      const { is_allows_modify_quantity } = currentPos.value
      if (!is_allows_modify_quantity) {
        store.dispatch('setModalPin', {
          title: lang.t('form.pos.pinMessage.pin') + lang.t('form.pos.pinMessage.qtyEntered'),
          doneMethod: () => {
            isLoadingQty.value = true
            store.dispatch('updateCurrentLine', {
              lineId: currentLine.value.id,
              quantity
            })
              .then(updateLineResponse => {
                refreshLine(updateLineResponse)
                isLoadingQty.value = false
                if (currentLine && currentLine.value) {
                  currentLine.value.isEditQtyEntered = false
                }
              })
              .catch(() => {
                refreshLine(currentLine.value)
                isLoadingQty.value = false
                if (currentLine && currentLine.value) {
                  currentLine.value.isEditQtyEntered = false
                }
              })
              .finally(() => {
                isLoadingQty.value = false
              })
            isLoadingQty.value = false
          },
          cancelMethod: () => {
            if (currentLine && currentLine.value) {
              currentLine.value.isEditQtyEntered = false
            }
            isLoadingQty.value = false
          },
          requestedAccess: 'IsAllowsModifyQuantity',
          requestedAmount: quantity,
          isShowed: true
        })
        return
      }
      isLoadingQty.value = true
      store.dispatch('updateCurrentLine', {
        lineId: currentLine.value.id,
        quantity
      })
        .then(updateLineResponse => {
          refreshLine(updateLineResponse)
          isLoadingQty.value = false
          if (currentLine && currentLine.value) {
            currentLine.value.isEditQtyEntered = false
          }
        })
        .catch(() => {
          isLoadingQty.value = false
        })
        .finally(() => {
          isLoadingQty.value = false
        })
    }
    function updateDiscount(discount_rate) {
      const { is_allows_modify_discount, maximum_line_discount_allowed } = currentPos.value
      const {
        quantity_ordered
      } = currentLine.value
      isLoadingDiscount.value = true
      if (!is_allows_modify_discount || (convertToNumber(maximum_line_discount_allowed) !== 0 && discount_rate > convertToNumber(maximum_line_discount_allowed))) {
        store.dispatch('setModalPin', {
          title: lang.t('form.pos.pinMessage.pin') + lang.t('form.pos.pinMessage.qtyEntered'),
          doneMethod: () => {
            store.dispatch('updateCurrentLine', {
              lineId: currentLine.value.id,
              discount_rate,
              quantity: quantity_ordered
            })
              .then(updateLineResponse => {
                refreshLine(updateLineResponse)
                if (currentLine && currentLine.value) {
                  currentLine.value.isEditDiscount = false
                }
                isLoadingDiscount.value = false
              })
              .catch(() => {
                if (currentLine && currentLine.value) {
                  currentLine.value.isEditDiscount = false
                }
                isLoadingDiscount.value = false
              })
          },
          cancelMethod: () => {
            if (currentLine && currentLine.value) {
              currentLine.value.isEditDiscount = false
            }
            isLoadingDiscount.value = false
          },
          requestedAccess: 'IsAllowsModifyDiscount',
          requestedAmount: discount_rate,
          isShowed: true
        })
        return
      }
      store.dispatch('updateCurrentLine', {
        lineId: currentLine.value.id,
        discount_rate,
        quantity: quantity_ordered
      })
        .then(updateLineResponse => {
          refreshLine(updateLineResponse)
          if (currentLine && currentLine.value) {
            currentLine.value.isEditDiscount = false
          }
          isLoadingDiscount.value = false
        })
        .catch(() => {
          if (currentLine && currentLine.value) {
            currentLine.value.isEditDiscount = false
          }
          isLoadingDiscount.value = false
        })
        .finally(() => {
          isLoadingDiscount.value = false
        })
    }

    return {
      // Ref
      currentLine,
      isLoadingDiscount,
      isLoadingPrice,
      isLoadingQty,
      // Computed
      lines,
      isLoading,
      currentPos,
      currentOrder,
      validateProcess,
      orderLineDefinition,
      // Methods
      convertToNumber,
      handleCurrentChangeOrderLine,
      displayLabel,
      displayValue,
      editLineExit,
      updateQuantity,
      updateDiscount,
      sizeTableColumn,
      updateCurrentPrice,
      displayLineQtyEntered,
      editLine,
      copyCode
    }
  }
})
</script>

<style lang="scss">
.el-table .cell {
  padding-left: 5px;
  padding-right: 5px;
}
</style>
<style lang="scss">
.tablePos {
  height: 100%;
  overflow: auto;
  .el-table {
    height: calc(100vh - 335px) !important;
    overflow: hidden !important;
  }
  .el-table .el-table__cell {
    padding: 0px !important;
    line-height: 1.5 !important;
  }
  .el-table .success-row {
    background: #e8f4ff;
  }
  .el-table .cell {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    line-height: 1.5 !important;
  }
  .el-table .cell:hover {
    border: 1px solid blue;
    overflow: hidden;
  }
  .el-table th.el-table__cell > .cell{
    padding-left: 5px !important;
    padding-right: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
}
.table-pos-dialogo {
  height: 100%;
  overflow: auto;
  .el-table {
    height: calc(80vh - 330px) !important;
    overflow: hidden !important;
  }
  .el-table .el-table__cell {
    padding: 0px !important;
    line-height: 1.5 !important;
  }
  .el-table .success-row {
    background: #e8f4ff;
  }
  .el-table .cell {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    line-height: 1.5 !important;
  }
  .el-table .cell:hover {
    border: 1px solid blue;
    overflow: hidden;
  }
  .el-table th.el-table__cell > .cell{
    padding-left: 5px !important;
    padding-right: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
}
</style>
