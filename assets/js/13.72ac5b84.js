(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{219:function(t,a,e){"use strict";e.r(a);var s=e(0),n=Object(s.a)({},(function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("div",{staticClass:"content"},[e("h1",{attrs:{id:"paginacion"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#paginacion"}},[t._v("#")]),t._v(" Paginación "),e("Badge",{attrs:{text:"v3.9.2+"}})],1),t._v(" "),e("p",[t._v("El componente de paginación se basa principalmente en el elemento 'el-pagination' para el empaquetado secundario, y expandió la función de desplazamiento automático (auto-scroll).")]),t._v(" "),t._m(0),t._v(" "),t._m(1),t._m(2),t._v(" "),t._m(3),t._v(" "),e("p",[t._v("También se admite soporte de otros atributos del elemento "),e("code",[t._v("el-pagination")]),t._v(". Consulte la "),e("a",{attrs:{href:"http://element.eleme.io/#/zh-CN/component/pagination",target:"_blank",rel:"noopener noreferrer"}},[t._v("Documentación"),e("OutboundLink")],1),t._v(" para obtener más detalles.")]),t._v(" "),t._m(4),t._v(" "),t._m(5),t._v(" "),t._m(6),t._v(" "),e("ul",[e("li",[e("p",[e("a",{attrs:{href:"https://github.com/adempiere/adempiere-vue/blob/master/src/components/Pagination/index.vue",target:"_blank",rel:"noopener noreferrer"}},[t._v("Código fuente"),e("OutboundLink")],1)])]),t._v(" "),e("li",[e("p",[e("a",{attrs:{href:"https://adempiere.github.io/adempiere-vue/#/table/complex-table",target:"_blank",rel:"noopener noreferrer"}},[t._v("Demo en línea"),e("OutboundLink")],1)])])])])}),[function(){var t=this.$createElement,a=this._self._c||t;return a("h2",{attrs:{id:"uso-basico"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#uso-basico"}},[this._v("#")]),this._v(" Uso básico")])},function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("div",{staticClass:"language-html extra-class"},[e("pre",{pre:!0,attrs:{class:"language-html"}},[e("code",[t._v("  "),e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("template")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("pagination")]),t._v("\n      "),e("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v(":total")]),e("span",{pre:!0,attrs:{class:"token attr-value"}},[e("span",{pre:!0,attrs:{class:"token punctuation attr-equals"}},[t._v("=")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("total"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v("\n      "),e("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v(":page.sync")]),e("span",{pre:!0,attrs:{class:"token attr-value"}},[e("span",{pre:!0,attrs:{class:"token punctuation attr-equals"}},[t._v("=")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("listQuery.page"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v("\n      "),e("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v(":limit.sync")]),e("span",{pre:!0,attrs:{class:"token attr-value"}},[e("span",{pre:!0,attrs:{class:"token punctuation attr-equals"}},[t._v("=")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("listQuery.limit"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v("\n      "),e("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("@pagination")]),e("span",{pre:!0,attrs:{class:"token attr-value"}},[e("span",{pre:!0,attrs:{class:"token punctuation attr-equals"}},[t._v("=")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("getList"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("/>")])]),t._v("\n  "),e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("template")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n\n  "),e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("script")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),e("span",{pre:!0,attrs:{class:"token script"}},[e("span",{pre:!0,attrs:{class:"token language-javascript"}},[t._v("\n  "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" Pagination "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token string"}},[t._v("'@/components/Pagination'")]),t._v("\n\n  "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("export")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("default")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("components")]),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" Pagination "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("data")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),e("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("total")]),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        "),e("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("listQuery")]),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n          "),e("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("page")]),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n          "),e("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("limit")]),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token number"}},[t._v("20")]),t._v("\n        "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n      "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("methods")]),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n      "),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("getList")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Obtener datos")]),t._v("\n      "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n  ")])]),e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token tag"}},[e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("script")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n")])])])},function(){var t=this.$createElement,a=this._self._c||t;return a("h2",{attrs:{id:"atributos"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#atributos"}},[this._v("#")]),this._v(" Atributos")])},function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("table",[e("thead",[e("tr",[e("th",{staticStyle:{"text-align":"center"}},[t._v("Atributo")]),t._v(" "),e("th",{staticStyle:{"text-align":"left"}},[t._v("Descripción")]),t._v(" "),e("th",{staticStyle:{"text-align":"center"}},[t._v("Tipo")]),t._v(" "),e("th",{staticStyle:{"text-align":"center"}},[t._v("Predeterminado")])])]),t._v(" "),e("tbody",[e("tr",[e("td",{staticStyle:{"text-align":"center"}},[t._v("total")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("recuento total de artículos")]),t._v(" "),e("td",{staticStyle:{"text-align":"center"}},[t._v("Number")]),t._v(" "),e("td",{staticStyle:{"text-align":"center"}},[t._v("/")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"center"}},[t._v("page")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("número de página actual, soporta el modificador .sync")]),t._v(" "),e("td",{staticStyle:{"text-align":"center"}},[t._v("Number")]),t._v(" "),e("td",{staticStyle:{"text-align":"center"}},[t._v("1")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"center"}},[t._v("limit")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Recuento de elementos de cada página, admite el modificador .sync")]),t._v(" "),e("td",{staticStyle:{"text-align":"center"}},[t._v("Number")]),t._v(" "),e("td",{staticStyle:{"text-align":"center"}},[t._v("20")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"center"}},[t._v("page-sizes")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Opciones de conteo de artículos por página")]),t._v(" "),e("td",{staticStyle:{"text-align":"center"}},[t._v("Number []")]),t._v(" "),e("td",{staticStyle:{"text-align":"center"}},[t._v("10, 20, 30, 50]")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"center"}},[t._v("hidden")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("si ocultar")]),t._v(" "),e("td",{staticStyle:{"text-align":"center"}},[t._v("Boolean")]),t._v(" "),e("td",{staticStyle:{"text-align":"center"}},[t._v("false")])]),t._v(" "),e("tr",[e("td",{staticStyle:{"text-align":"center"}},[t._v("auto-scroll")]),t._v(" "),e("td",{staticStyle:{"text-align":"left"}},[t._v("Si se desplaza automáticamente a la parte superior después de la paginación")]),t._v(" "),e("td",{staticStyle:{"text-align":"center"}},[t._v("Boolean")]),t._v(" "),e("td",{staticStyle:{"text-align":"center"}},[t._v("true")])])])])},function(){var t=this.$createElement,a=this._self._c||t;return a("h2",{attrs:{id:"eventos"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#eventos"}},[this._v("#")]),this._v(" Eventos")])},function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("table",[e("thead",[e("tr",[e("th",[t._v("Nombre del evento")]),t._v(" "),e("th",[t._v("Descripción")]),t._v(" "),e("th",[t._v("Parámetros")])])]),t._v(" "),e("tbody",[e("tr",[e("td",[t._v("pagination")]),t._v(" "),e("td",[t._v("Se dispara cuando cambia el límite o la página")]),t._v(" "),e("td",[t._v("{pagina, límite}")])])])])},function(){var t=this.$createElement,a=this._self._c||t;return a("h2",{attrs:{id:"codigo-fuente-y-demo"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#codigo-fuente-y-demo"}},[this._v("#")]),this._v(" Código fuente y Demo")])}],!1,null,null,null);a.default=n.exports}}]);