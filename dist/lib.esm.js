import { JsonFormElementMixin, ControlParser, JsonForm, StringControlParser } from '@aquarelle/json-form';
import Quill from 'quill';
import hljs from 'highlightjs';
import ace from 'ace-builds';
import VuetifyJsonForm, { BlockError, ControlLabel, BlockForm, StepperForm, DialogForms } from '@aquarelle/vuetify-json-form';
import VueRouter from 'vue-router';
import Vue from 'vue';
import Vuetify from 'vuetify';
import Intl from '@aquarelle/intl';

// Credit: https://github.com/calebroseland/vue-dom-portal

/**
 * Get target DOM Node
 * @param {(Node|string|Boolean)} [node=document.body] DOM Node, CSS selector, or Boolean
 * @return {Node} The target that the el will be appended to
 */
function getTarget(node = document.body) {
    if (node === true) return document.body;
    return node instanceof window.Node ? node : document.querySelector(node);
}

const homes = new Map();

const directive = {
    inserted(el, {value}, vnode) {
        const {parentNode} = el;
        const home = document.createComment('');
        let hasMovedOut = false;

        if (value !== false) {
            parentNode.replaceChild(home, el); // moving out, el is no longer in the document
            getTarget(value).appendChild(el); // moving into new place
            hasMovedOut = true;
        }

        if (!homes.has(el)) {
            // remember where home is or should be
            homes.set(el, {parentNode, home, hasMovedOut});
        }
    },
    componentUpdated(el, {value}) { // need to make sure children are done updating (vs. `update`)
        const {parentNode, home, hasMovedOut} = homes.get(el); // recall where home is

        if (!hasMovedOut && value) {
            // remove from document and leave placeholder
            parentNode.replaceChild(home, el);
            // append to target
            getTarget(value).appendChild(el);
            homes.set(el, {...homes.get(el), hasMovedOut});
        } else if (hasMovedOut && value === false) {
            // previously moved, coming back home
            parentNode.replaceChild(el, home);
            homes.set(el, {...homes.get(el), hasMovedOut});
        } else if (value) {
            // already moved, going somewhere else
            getTarget(value).appendChild(el);
        }
    },
    unbind(el, binding) {
        const {parentNode, home, hasMovedOut} = homes.get(el); // recall where home is
        if (hasMovedOut) {
            // previously moved, coming back home
            parentNode.replaceChild(el, home);
        }
        homes.delete(el);
    }
};

function install(Vue$$1) {
    Vue$$1.directive('dom-portal', directive);
}

const directive$1 = {
    inserted: (el, binding) => document.title = binding.value,
    update: (el, binding) => document.title = binding.value
};

function install$1(Vue$$1) {
    Vue$$1.directive('title', directive$1);
}

//
//
//
//
//

const mainKeys = ["red", "pink", "purple", "deep-purple", "indigo", "blue", "light-blue", "cyan", "teal", "green",
    "light-green", "lime", "yellow", "amber", "orange", "deep-orange", "brown", "blue-grey", "grey"];

const secondaryKeys = ["", "lighten-2", "lighten-1", "darken-1", "darken-2", "accent-2", "accent-3", "accent-4"];
const mkl = mainKeys.length;
const skl = secondaryKeys.length;

var script = {
    name: "letter-avatar",
    props: {
        text: {
            type: String,
            required: true
        },
        lettersCount: {
            type: Number,
            default: 1
        },
        toUpper: {
            type: Boolean,
            default: true
        },
        textClass: {
            type: String,
            default: "white--text headline"
        },
        squared: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        avatarClass() {
            const alpha = this.text.charCodeAt(0);
            const omega = this.text.charCodeAt(this.text.length - 1);
            const cls = ['letter-avatar'];
            if (this.squared) {
                cls.push('squared');
            }
            cls.push(mainKeys[alpha % mkl]);
            cls.push(secondaryKeys[omega % skl]);
            return cls.join(' ').trim();
        },
        letter() {
            const l = this.text.substring(0, this.lettersCount);
            return this.toUpper ? l.toUpperCase() : l;
        }
    }
};

/* script */
            const __vue_script__ = script;
/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:_vm.avatarClass},[_c('span',{class:_vm.textClass},[_vm._v(_vm._s(_vm.letter))])])};
var __vue_staticRenderFns__ = [];

  /* style */
  const __vue_inject_styles__ = undefined;
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* component normalizer */
  function __vue_normalize__(
    template, style, script$$1,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script$$1 === 'function' ? script$$1.options : script$$1) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "LetterAvatar.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var LetterAvatar = __vue_normalize__(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    undefined,
    undefined
  );

/**
 * Extendable error class
 */
class ExtendableError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}

class ServerError extends ExtendableError {
    /**
     * Response
     * @param response
     */
    constructor(response){
        super(response.statusText);
        this._response = response;
    }

    get response(){
        return this._response;
    }
}

let fetchBaseUrl = null;
let fetchCredentials = 'same-origin';
let fetchHeaders = {
    "Accept": "application/json",
    "Content-Type": "application/json"
};

class Requestor
{

    /**
     * @param {String} url
     */
    constructor(url)
    {
        this._url = url;
    }

    _onResponse(response)
    {
        if (!response.ok) {
            throw new ServerError(response);
        }
        if (response.status === 204) {
            return response;
        }
        return response.json();
    }

    /**
     * @param {String} url
     * @returns {String}
     * @protected
     */
    _resolveUrl(url)
    {
        return Requestor.resolveUrl(url);
    }

    /**
     * @param {String} url
     * @param {Object} options
     * @returns {Promise<Object|Response|ServerError>}
     * @protected
     */
    _fetch(url, options = {})
    {
        url = this._resolveUrl(url);
        options = {
            method: "get",
            headers: fetchHeaders,
            credentials: fetchCredentials,
            ...options
        };

        let request = new Request(url, options);
        return fetch(request).then(this._onResponse);
    }

    /**
     * @param {String} url
     * @param {Object} data
     * @param {String} method
     * @returns {Promise<Object|ServerError>}
     * @protected
     */
    _send(url, data, method = 'post')
    {
        url = this._resolveUrl(url);
        return fetch(url, {
            method: method,
            body: JSON.stringify(data),
            headers: fetchHeaders,
            credentials: fetchCredentials
        }).then(this._onResponse);
    }

    /**
     * @param {String} url
     * @returns {String}
     */
    static resolveUrl(url)
    {
        if (fetchBaseUrl === null) {
            return url;
        }
        return fetchBaseUrl + url;
    }

    /**
     * Set base url
     * @param {String} base
     */
    static setBaseUrl(base)
    {
        fetchBaseUrl = base;
    }

    /**
     * @returns {String|null}
     */
    static getBaseUrl()
    {
        return fetchBaseUrl;
    }

    /**
     * @param {String} credentials
     */
    static setCredentials(credentials)
    {
        fetchCredentials = credentials;
    }

    /**
     * @returns {string}
     */
    static getCredentials()
    {
        return fetchCredentials
    }

    /**
     * @param {Object} headers
     */
    static setFetchHeaders(headers)
    {
        fetchHeaders = headers;
    }

}

//

const SVG = /^\s*\<svg(\s|\>)/i;
const URL = /^(https?\:|data\:|\/)/i;

var script$1 = {
    name: 'image-icon',
    components: {LetterAvatar},
    props: {
        src: {
            type: String,
            default: ''
        },
        letterFallback: {
            type: Boolean,
            default: true
        },
        squared: {
            type: Boolean,
            default: false
        },
        size: {
            type: Number,
            default: 40
        }
    },
    computed: {
        source()
        {
            let src = this.src;
            if (this.isIcon) {
                return src.substring(1);
            }
            if (SVG.test(src)) {
                if (src.indexOf('xmlns="http://www.w3.org/2000/svg"') === -1) {
                    src = src.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
                }
                return 'data:image/svg+xml;base64,' + btoa(src);
            }
            const base = Requestor.getBaseUrl();
            if (base && src.startsWith('/')) {
                src = base + src;
            }
            return src;
        },
        isURL()
        {
            return URL.test(this.source);
        },
        isIcon()
        {
            return this.src.length > 0 && this.src[0] === '@';
        }
    }
};

/* script */
            const __vue_script__$1 = script$1;
/* template */
var __vue_render__$1 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return (_vm.isIcon)?_c('v-icon',_vm._b({style:({width: _vm.size + 'px', height: _vm.size + 'px'})},'v-icon',_vm.$attrs,false),[_vm._v(_vm._s(_vm.$controlIcon(_vm.source)))]):(_vm.isURL)?_c('img',_vm._b({class:{'image-icon': true, 'squared': _vm.squared},style:({width: _vm.size + 'px', height: _vm.size + 'px'}),attrs:{"src":_vm.source}},'img',_vm.$attrs,false)):(_vm.letterFallback)?_c('letter-avatar',_vm._b({style:({width: _vm.size + 'px', height: _vm.size + 'px'}),attrs:{"text":_vm.src,"squared":_vm.squared}},'letter-avatar',_vm.$attrs,false)):_vm._e()};
var __vue_staticRenderFns__$1 = [];

  /* style */
  const __vue_inject_styles__$1 = undefined;
  /* scoped */
  const __vue_scope_id__$1 = undefined;
  /* module identifier */
  const __vue_module_identifier__$1 = undefined;
  /* functional template */
  const __vue_is_functional_template__$1 = false;
  /* component normalizer */
  function __vue_normalize__$1(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "ImageIcon.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var ImageIcon = __vue_normalize__$1(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//

var script$2 = {
    name: 'content-loader',
    props: {
        loading: {
            type: Boolean,
            default: false
        }
    }
};

/* script */
            const __vue_script__$2 = script$2;
            
/* template */
var __vue_render__$2 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return (_vm.loading)?_c('v-layout',{attrs:{"fill-height":"","justify-center":"","align-center":""}},[_c('v-progress-circular',{attrs:{"indeterminate":"","color":"secondary"}})],1):_c('v-layout',{attrs:{"column":"","fill-height":""}},[_vm._t("default")],2)};
var __vue_staticRenderFns__$2 = [];

  /* style */
  const __vue_inject_styles__$2 = undefined;
  /* scoped */
  const __vue_scope_id__$2 = undefined;
  /* module identifier */
  const __vue_module_identifier__$2 = undefined;
  /* functional template */
  const __vue_is_functional_template__$2 = false;
  /* component normalizer */
  function __vue_normalize__$2(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "ContentLoader.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var ContentLoader = __vue_normalize__$2(
    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
    __vue_inject_styles__$2,
    __vue_script__$2,
    __vue_scope_id__$2,
    __vue_is_functional_template__$2,
    __vue_module_identifier__$2,
    undefined,
    undefined
  );

var Loaders = {
    _items: {},
    get(name) {
        return this.has(name) ? this._items[name] : null;
    },
    register(name, obj) {
        this._items[name] = obj;
        return this;
    },
    unregister(name) {
        delete this._items[name];
        return this;
    },
    has(name) {
        return this._items.hasOwnProperty(name);
    }
};

//

var script$3 = {
    name: 'entity-type-control',
    mixins: [JsonFormElementMixin],
    components: {
        ImageIcon
    },
    data() {
        return {
            loading: true,
            loadedItems: []
        };
    },
    created() {
        this.refresh();
    },
    methods: {
        getValue(item) {
            return {type: item.type, behavior: item.behavior};
        },
        refresh() {
            this.loading = true;
            const loader = this.loader;
            if (loader) {
                this.loader.cached(this.config.cacheKey).then(data => {
                    this.loadedItems = this.translateItems(data);
                    this.loading = false;
                    this.reset();
                });
            }
        },
        translateItems(items) {
            return items.map(item => {
                item = {...item};
                item[this.titleProp] = this.$intl.translate(item[this.titleProp]);
                item[this.descriptionProp] = this.$intl.translate(item[this.descriptionProp]);
                return item;
            });
        }
    },
    computed: {
        loader() {
            return Loaders.get(this.config.entity);
        },
        titleProp() {
            return this.config.titleProp || 'title';
        },
        descriptionProp() {
            return this.config.descriptionProp || 'description';
        },
        iconProp() {
            return this.config.iconProp || 'icon';
        }
    }
};

/* script */
            const __vue_script__$3 = script$3;
            
/* template */
var __vue_render__$3 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-autocomplete',{attrs:{"error-messages":_vm.allErrors,"label":_vm.$intl.translate(_vm.display.title),"hint":_vm.$intl.translate(_vm.display.hint),"placeholder":_vm.$intl.translate(_vm.display.placeholder),"prepend-icon":_vm.$controlIcon(_vm.display.prependIcon),"append-icon":_vm.$controlIcon(_vm.display.appendIcon),"box":_vm.display.appearance === 'box',"solo":_vm.display.appearance === 'solo',"solo-inverted":_vm.display.appearance === 'solo-inverted',"outline":_vm.display.appearance === 'outline',"flat":!!_vm.display.flat,"multiple":_vm.config.multiple || false,"clearable":"","items":_vm.loadedItems,"item-value":_vm.getValue,"item-text":_vm.titleProp,"item-avatar":_vm.iconProp,"value-comparator":_vm.$equals,"loading":_vm.loading,"disabled":_vm.loading},scopedSlots:_vm._u([{key:"selection",fn:function(data){return [[_c('image-icon',{attrs:{"src":data.item[_vm.iconProp] || data.item[_vm.titleProp],"squared":_vm.display.squared}}),_vm._v(" "),_c('span',{staticClass:"ml-1 mr-1"},[_vm._v(_vm._s(data.item[_vm.titleProp]))])]]}},{key:"item",fn:function(data){return [_c('v-list-tile-avatar',[_c('image-icon',{attrs:{"src":data.item[_vm.iconProp] || data.item[_vm.titleProp],"squared":_vm.display.squared}})],1),_vm._v(" "),_c('v-list-tile-content',[_c('v-list-tile-title',[_vm._v("\n                "+_vm._s(data.item[_vm.titleProp])+"\n            ")]),_vm._v(" "),_c('v-list-tile-sub-title',[_vm._v("\n                "+_vm._s(data.item[_vm.descriptionProp])+"\n                "),(!_vm.display.hideType)?_c('small',[_vm._v("("+_vm._s(data.item.behavior ? data.item.type + ':' + data.item.behavior : data.item.type)+")")]):_vm._e()])],1)]}}]),model:{value:(_vm.model[_vm.name]),callback:function ($$v) {_vm.$set(_vm.model, _vm.name, $$v);},expression:"model[name]"}})};
var __vue_staticRenderFns__$3 = [];

  /* style */
  const __vue_inject_styles__$3 = undefined;
  /* scoped */
  const __vue_scope_id__$3 = undefined;
  /* module identifier */
  const __vue_module_identifier__$3 = undefined;
  /* functional template */
  const __vue_is_functional_template__$3 = false;
  /* component normalizer */
  function __vue_normalize__$3(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "control.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var Control = __vue_normalize__$3(
    { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
    __vue_inject_styles__$3,
    __vue_script__$3,
    __vue_scope_id__$3,
    __vue_is_functional_template__$3,
    __vue_module_identifier__$3,
    undefined,
    undefined
  );

class Parser extends ControlParser {

    constructor(name, entity = null, display = {}, cacheKey = 'types') {
        super(name);
        this._entity = entity;
        this._display = display;
        this._cacheKey = cacheKey;
    }

    getDisplay(definition, form) {
        return {...this._display, ...super.getDisplay(definition, form)};
    }

    getDefault(definition) {
        if (definition.config && definition.config.multiple) {
            return Array.isArray(definition.default) ? definition.default : [];
        }
        return definition.default || undefined;
    }

    getConfig(definition) {
        return {
            multiple: false,
            entity: this._entity,
            cacheKey: this._cacheKey,
            ...definition.config
        };
    }

    getItems(definition, form, data, validator) {
        return [];
    }

    parse(definition, form, validator) {
        const data = super.parse(definition, form, validator);
        if (data.config.multiple) {
            ControlParser.setConfigUsingValidation(data.config, definition.validation, ['required', 'minItems', 'maxItems']);
        }
        else {
            ControlParser.setConfigUsingValidation(data.config, definition.validation, ['required']);
        }
        return data;
    }
}

Control.install = function (Vue$$1) {
    Vue$$1.component(Control.name, Control);
    JsonForm.addControl('entity-type', new Parser(Control.name, null));
};

//

var script$4 = {
    name: 'entity-instance-control',
    mixins: [JsonFormElementMixin],
    components: {
        LetterAvatar
    },
    data() {
        return {
            loading: true,
            loadedItems: []
        };
    },
    created() {
        this.refresh();
    },
    methods: {
        refresh() {
            this.loading = true;
            const loader = this.loader;
            if (loader) {
                this.loader.cached(this.config.cacheKey).then(data => {
                    this.loadedItems = data.collection;
                    this.loading = false;
                    this.reset();
                });
            }
        }
    },
    computed: {
        loader() {
            return Loaders.get(this.config.entity);
        },
        titleProp() {
            return this.config.titleProp || 'title';
        },
        descriptionProp() {
            return this.config.descriptionProp || 'description';
        },
        valueProp() {
            return this.config.valueProp || 'id';
        }
    }
};

/* script */
            const __vue_script__$4 = script$4;
            
/* template */
var __vue_render__$4 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-autocomplete',{attrs:{"error-messages":_vm.allErrors,"label":_vm.$intl.translate(_vm.display.title),"hint":_vm.$intl.translate(_vm.display.hint),"placeholder":_vm.$intl.translate(_vm.display.placeholder),"prepend-icon":_vm.$controlIcon(_vm.display.prependIcon),"append-icon":_vm.$controlIcon(_vm.display.appendIcon),"box":_vm.display.appearance === 'box',"solo":_vm.display.appearance === 'solo',"solo-inverted":_vm.display.appearance === 'solo-inverted',"outline":_vm.display.appearance === 'outline',"flat":!!_vm.display.flat,"multiple":_vm.config.multiple || false,"hide-selected":"","autocomplete":"","clearable":"","items":_vm.loadedItems,"item-value":_vm.valueProp,"item-text":_vm.titleProp,"value-comparator":_vm.$equals,"loading":_vm.loading,"disabled":_vm.loading},scopedSlots:_vm._u([{key:"selection",fn:function(data){return [[_c('letter-avatar',{attrs:{"text":data.item[_vm.titleProp] || ''}}),_vm._v(" "),_c('span',{staticClass:"ml-1 mr-1"},[_vm._v(_vm._s(data.item[_vm.titleProp]))])]]}},{key:"item",fn:function(data){return [_c('v-list-tile-avatar',[_c('letter-avatar',{attrs:{"text":data.item[_vm.titleProp] || ''}})],1),_vm._v(" "),_c('v-list-tile-content',[_c('v-list-tile-title',[_vm._v("\n                "+_vm._s(data.item[_vm.titleProp])+"\n            ")]),_vm._v(" "),(!_vm.display.hideType)?_c('v-list-tile-sub-title',[_vm._v("\n                "+_vm._s(data.item.behavior ? data.item.type + ':' + data.item.behavior : data.item.type)+"\n            ")]):_c('v-list-tile-sub-title',[_vm._v("\n                "+_vm._s(data.item[_vm.descriptionProp] || '')+"\n            ")])],1)]}}]),model:{value:(_vm.model[_vm.name]),callback:function ($$v) {_vm.$set(_vm.model, _vm.name, $$v);},expression:"model[name]"}})};
var __vue_staticRenderFns__$4 = [];

  /* style */
  const __vue_inject_styles__$4 = undefined;
  /* scoped */
  const __vue_scope_id__$4 = undefined;
  /* module identifier */
  const __vue_module_identifier__$4 = undefined;
  /* functional template */
  const __vue_is_functional_template__$4 = false;
  /* component normalizer */
  function __vue_normalize__$4(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "control.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var Control$1 = __vue_normalize__$4(
    { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
    __vue_inject_styles__$4,
    __vue_script__$4,
    __vue_scope_id__$4,
    __vue_is_functional_template__$4,
    __vue_module_identifier__$4,
    undefined,
    undefined
  );

class Parser$1 extends ControlParser {

    constructor(name, entity = null, display = {}, config = {}, cacheKey = 'instances') {
        super(name);
        this._entity = entity;
        this._display = display;
        this._config = config;
        this._cacheKey = cacheKey;
    }

    getDisplay(definition, form) {
        return {...this._display, ...super.getDisplay(definition, form)};
    }

    getDefault(definition) {
        if (definition.config && definition.config.multiple) {
            return Array.isArray(definition.default) ? definition.default : [];
        }
        return definition.default || undefined;
    }

    getConfig(definition) {
        return {
            multiple: false,
            entity: this._entity,
            cacheKey: this._cacheKey,
            ...this._config,
            ...definition.config
        };
    }

    getItems(definition, form, data, validator) {
        return [];
    }

    parse(definition, form, validator) {
        const data = super.parse(definition, form, validator);
        if (data.config.multiple) {
            ControlParser.setConfigUsingValidation(data.config, definition.validation, ['required', 'minItems', 'maxItems']);
        }
        else {
            ControlParser.setConfigUsingValidation(data.config, definition.validation, ['required']);
        }
        return data;
    }
}

Control$1.install = function (Vue$$1) {
    Vue$$1.component(Control$1.name, Control$1);
    JsonForm.addControl('entity-instance', new Parser$1(Control$1.name, null));
};

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$5 = {
    name: "app-layout",
    data() {
        return {
            leftDrawer: null,
            rightDrawer: false
        }
    },
    props: {
        actionIcon: {
            type: String,
            default: 'apps'
        }
    },
};

/* script */
            const __vue_script__$5 = script$5;
/* template */
var __vue_render__$5 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-app',[_c('v-navigation-drawer',{attrs:{"app":"","fixed":"","clipped":""},model:{value:(_vm.leftDrawer),callback:function ($$v) {_vm.leftDrawer=$$v;},expression:"leftDrawer"}},[_vm._t("app-left-drawer")],2),_vm._v(" "),_c('v-navigation-drawer',{attrs:{"app":"","right":"","temporary":""},model:{value:(_vm.rightDrawer),callback:function ($$v) {_vm.rightDrawer=$$v;},expression:"rightDrawer"}},[_vm._t("app-right-drawer")],2),_vm._v(" "),_c('v-toolbar',{ref:"toolbar",attrs:{"app":"","fixed":"","clipped-left":"","clipped-right":"","color":"primary","dark":""}},[_c('v-toolbar-side-icon',{on:{"click":function($event){$event.stopPropagation();_vm.leftDrawer = !_vm.leftDrawer;}}}),_vm._v(" "),_c('v-toolbar-title',{staticClass:"ml-0",attrs:{"id":"app-title"}}),_vm._v(" "),_c('v-spacer'),_vm._v(" "),_vm._t("app-actions",[_c('div',{attrs:{"id":"app-actions"}})]),_vm._v(" "),_c('v-btn',{attrs:{"icon":"","flat":""},on:{"click":function($event){$event.stopPropagation();_vm.rightDrawer = !_vm.rightDrawer;}}},[_c('v-icon',[_vm._v(_vm._s(_vm.actionIcon))])],1)],2),_vm._v(" "),_vm._t("default")],2)};
var __vue_staticRenderFns__$5 = [];

  /* style */
  const __vue_inject_styles__$5 = undefined;
  /* scoped */
  const __vue_scope_id__$5 = undefined;
  /* module identifier */
  const __vue_module_identifier__$5 = undefined;
  /* functional template */
  const __vue_is_functional_template__$5 = false;
  /* component normalizer */
  function __vue_normalize__$5(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "AppLayout.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var AppLayout = __vue_normalize__$5(
    { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
    __vue_inject_styles__$5,
    __vue_script__$5,
    __vue_scope_id__$5,
    __vue_is_functional_template__$5,
    __vue_module_identifier__$5,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$6 = {
    name: 'app-menu',
    props: {
        user: {
            type: Object,
            required: true
        },
        app: {
            type: Object,
            required: true
        },
        vendor: {
            type: String
        },
        extension: {
            type: String
        }
    },
    computed: {
        menus() {
            const app = this.app.getVendorExtension(this.vendor, this.extension);

            if (!app || !app.menu || app.menu.length === 0) {
                return [];
            }

            const menu = [];

            app.menu.map(region => {
                if (!this.hasPermissions(region.permissions)) {
                    return;
                }

                const items = [];

                if (region.items && region.items.length > 0) {
                    region.items.map(item => {
                        if (!this.hasPermissions(item.permissions)) {
                            return;
                        }
                        items.push({
                            title: item.title || null,
                            description: item.description || null,
                            icon: item.icon || null,
                            permissions: item.permissions || [],
                            href: this.hrefPrefix + (item.href || '')
                        });
                    });
                }

                if (items.length === 0) {
                    return;
                }

                menu.push({
                    title: region.title || null,
                    permissions: region.permissions || [],
                    icon: region.icon || null,
                    items: items,
                });
            });

            return menu;
        },
        hrefPrefix() {
            return '/' + this.vendor + '/' + this.extension + '/';
        }
    },
    methods: {
        hasPermissions(perm) {
            return this.user.hasPermission(perm);
        }
    }
};

/* script */
            const __vue_script__$6 = script$6;
            
/* template */
var __vue_render__$6 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-list',_vm._b({attrs:{"two-line":""}},'v-list',_vm.$attrs,false),[_vm._l((_vm.menus),function(region){return [_c('v-subheader',[_vm._v(_vm._s(_vm.$intl.translate(region.title)))]),_vm._v(" "),_vm._l((region.items),function(item){return _c('v-list-tile',{key:item.href,attrs:{"to":item.href}},[_c('v-list-tile-action',[_c('v-icon',[_vm._v(_vm._s(_vm.$controlIcon(item.icon)))])],1),_vm._v(" "),_c('v-list-tile-content',[_c('v-list-tile-title',[_vm._v("\n                    "+_vm._s(_vm.$intl.translate(item.title))+"\n                ")]),_vm._v(" "),(item.description !== null)?_c('v-list-tile-sub-title',[_vm._v("\n                    "+_vm._s(_vm.$intl.translate(item.description))+"\n                ")]):_vm._e()],1)],1)})]})],2)};
var __vue_staticRenderFns__$6 = [];

  /* style */
  const __vue_inject_styles__$6 = undefined;
  /* scoped */
  const __vue_scope_id__$6 = undefined;
  /* module identifier */
  const __vue_module_identifier__$6 = undefined;
  /* functional template */
  const __vue_is_functional_template__$6 = false;
  /* component normalizer */
  function __vue_normalize__$6(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "AppMenu.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var AppMenu = __vue_normalize__$6(
    { render: __vue_render__$6, staticRenderFns: __vue_staticRenderFns__$6 },
    __vue_inject_styles__$6,
    __vue_script__$6,
    __vue_scope_id__$6,
    __vue_is_functional_template__$6,
    __vue_module_identifier__$6,
    undefined,
    undefined
  );

//

var script$7 = {
    components: {ImageIcon},
    name: 'app-extensions',
    props: {
        currentVendor: {
            type: String,
            default: null
        },
        app: {
            type: Object,
            required: true
        },
        alwaysOpen: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        vendors() {
            let vendors = [];
            const all = this.app.vendors;

            for (const p in all) {
                if (!all.hasOwnProperty(p)) {
                    continue;
                }
                const vendor = all[p];
                if (!this.hasPermissions(vendor.permissions || [])) {
                    continue;
                }
                const extensions = this.getVendorExtensions(vendor.name);
                if (extensions.length === 0) {
                    continue;
                }
                vendors.push({
                    name: vendor.name,
                    title: vendor.title || vendor.name,
                    description: vendor.description || null,
                    icon: vendor.icon || null,
                    extensions,
                });
            }

            return vendors;
        },
    },
    methods: {
        hasPermissions(perm) {
            return this.app.user.hasPermission(perm);
        },
        getVendorExtensions(vendor) {
            const filtered = [];
            this.app.getAllVendorExtensions(vendor).map(ext => {
                // Check permissions
                if (!this.hasPermissions(ext.permissions)) {
                    return;
                }
                if (!ext.menu || ext.menu.length === 0) {
                    return;
                }

                let href = '';
                const hasItems = ext.menu.some(region => {
                    if (!region.items || region.items.length === 0 || !this.hasPermissions(region.permissions)) {
                        return false;
                    }
                    return region.items.some(item => {
                        if (this.hasPermissions(item.permissions)) {
                            href = item.href || '';
                            return true;
                        }
                        return false;
                    });
                });

                if (!hasItems) {
                    return;
                }

                const item = {
                    vendor: ext.vendor,
                    name: ext.name,
                    title: ext.title,
                    description: ext.description,
                    icon: ext.icon,
                    href: '/' + ext.vendor + '/' + ext.name + '/' + href
                };

                filtered.push(item);
            });

            return filtered;
        }
    }
};

/* script */
            const __vue_script__$7 = script$7;
            
/* template */
var __vue_render__$7 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-list',_vm._b({attrs:{"two-line":""}},'v-list',_vm.$attrs,false),_vm._l((_vm.vendors),function(vendor){return _c('v-list-group',{key:vendor.name,attrs:{"value":_vm.alwaysOpen || vendor.name === _vm.currentVendor}},[_c('v-list-tile',{attrs:{"slot":"activator"},slot:"activator"},[_c('v-list-tile-action',[_c('image-icon',{attrs:{"src":vendor.icon || _vm.$intl.translate(vendor.title)}})],1),_vm._v(" "),_c('v-list-tile-content',[_c('v-list-tile-title',[_vm._v("\n                    "+_vm._s(_vm.$intl.translate(vendor.title))+"\n                ")]),_vm._v(" "),_c('v-list-tile-sub-title',[_vm._v("\n                    "+_vm._s(_vm.$intl.translate(vendor.description))+"\n                ")])],1)],1),_vm._v(" "),_vm._l((vendor.extensions),function(item){return _c('v-list-tile',{key:item.href,attrs:{"to":item.href}},[_c('v-list-tile-action',[_c('image-icon',{attrs:{"src":item.icon || _vm.$intl.translate(item.title)}})],1),_vm._v(" "),_c('v-list-tile-content',[_c('v-list-tile-title',[_vm._v("\n                    "+_vm._s(_vm.$intl.translate(item.title))+"\n                ")]),_vm._v(" "),_c('v-list-tile-sub-title',[_vm._v("\n                    "+_vm._s(_vm.$intl.translate(item.description))+"\n                ")])],1)],1)})],2)}))};
var __vue_staticRenderFns__$7 = [];

  /* style */
  const __vue_inject_styles__$7 = undefined;
  /* scoped */
  const __vue_scope_id__$7 = undefined;
  /* module identifier */
  const __vue_module_identifier__$7 = undefined;
  /* functional template */
  const __vue_is_functional_template__$7 = false;
  /* component normalizer */
  function __vue_normalize__$7(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "AppExtensions.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var AppExtensions = __vue_normalize__$7(
    { render: __vue_render__$7, staticRenderFns: __vue_staticRenderFns__$7 },
    __vue_inject_styles__$7,
    __vue_script__$7,
    __vue_scope_id__$7,
    __vue_is_functional_template__$7,
    __vue_module_identifier__$7,
    undefined,
    undefined
  );

//

var script$8 = {
    name: 'app-user',
    components: {ImageIcon},
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    methods: {
        signOut()
        {
            this.user.signOut().then(() => {
               window.location.replace(window.location.toString().split('#')[0]);
            });
        }
    }
};

/* script */
            const __vue_script__$8 = script$8;
            
/* template */
var __vue_render__$8 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-card',{attrs:{"flat":""}},[_c('v-container',{attrs:{"fluid":"","grid-list-sm":""}},[_c('v-layout',{attrs:{"row":""}},[_c('v-flex',[_c('image-icon',{attrs:{"squared":"","size":80,"letters-count":2,"src":_vm.user.avatar || _vm.user.name}})],1),_vm._v(" "),_c('v-flex',[_c('div',{staticClass:"headline"},[_vm._v(_vm._s(_vm.user.name))]),_vm._v(" "),_c('div',[_vm._v(_vm._s(_vm.user.email))]),_vm._v(" "),_c('div',[_c('a',{attrs:{"href":"#"},on:{"click":function($event){$event.preventDefault();$event.stopPropagation();return _vm.signOut($event)}}},[_vm._v("Sign out")])])])],1)],1)],1)};
var __vue_staticRenderFns__$8 = [];

  /* style */
  const __vue_inject_styles__$8 = undefined;
  /* scoped */
  const __vue_scope_id__$8 = undefined;
  /* module identifier */
  const __vue_module_identifier__$8 = undefined;
  /* functional template */
  const __vue_is_functional_template__$8 = false;
  /* component normalizer */
  function __vue_normalize__$8(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "AppUser.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var AppUser = __vue_normalize__$8(
    { render: __vue_render__$8, staticRenderFns: __vue_staticRenderFns__$8 },
    __vue_inject_styles__$8,
    __vue_script__$8,
    __vue_scope_id__$8,
    __vue_is_functional_template__$8,
    __vue_module_identifier__$8,
    undefined,
    undefined
  );

var Logo = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDU2LjA3MDIiIGhlaWdodD0iMjI1LjY5MTciIHZpZXdCb3g9IjAgMCAxNDU2LjA3MDIgMjI1LjY5MTciPgogICAgPGRlZnM+CiAgICAgICAgPHN0eWxlPi5hIHtmaWxsOiAjMTk3NmQyfTwvc3R5bGU+CiAgICA8L2RlZnM+CiAgICA8dGl0bGU+QXF1YXJlbGxlPC90aXRsZT4KICAgIDxnPgogICAgICAgIDxnPgogICAgICAgICAgICA8cGF0aCBjbGFzcz0iYSIgZD0iTTgzMy4xOTI4LDU1LjA1Vjc4Ljc4NTZhNjYuNjI4NCw2Ni42Mjg0LDAsMSwwLDAsODUuNzg2NnYyMy43MzUxSDg0OC44NVY1NS4wNVpNNzgyLjIyMTksMTcyLjY1YTUwLjk3MDgsNTAuOTcwOCwwLDEsMSw1MC45NzA5LTUwLjk3MDZBNTAuOTcsNTAuOTcsMCwwLDEsNzgyLjIyMTksMTcyLjY1WiIvPgogICAgICAgICAgICA8cGF0aCBjbGFzcz0iYSIgZD0iTTU1NS40NCwxMjEuNjc5QTY2LjY2ODUsNjYuNjY4NSwwLDEsMCw1MzAuMDUxNCwxNzMuOTlsMTQuMzE3MiwxNC4zMTcxTDU1NS40NCwxNzcuMjM1OCw1NDEuMTIzLDE2Mi45MTg2QTY2LjMyMTIsNjYuMzIxMiwwLDAsMCw1NTUuNDQsMTIxLjY3OVpNNDg4LjgxMTYsMTcyLjY1YTUwLjk4NjgsNTAuOTg2OCwwLDEsMSw0MS4xNDU0LTIwLjg5NjlsLTEyLjI3NTktMTIuMjc2TDUwNi42MSwxNTAuNTQ4M2wxMi4yNzYsMTIuMjc1OUE1MC43Myw1MC43MywwLDAsMSw0ODguODExNiwxNzIuNjVaIi8+CiAgICAgICAgICAgIDxwYXRoIGNsYXNzPSJhIiBkPSJNNjg2LjUyMjksNTUuMDVWMTIxLjY3OWgtLjAzNTNhNTAuOTcwOCw1MC45NzA4LDAsMCwxLTEwMS45NDE2LDBoLS4wMzUzVjU1LjA1SDU2OC44ODg0VjEyMS42NzlhNjYuNjI4NCw2Ni42Mjg0LDAsMCwwLDEzMy4yNTY4LDBWNTUuMDVaIi8+CiAgICAgICAgICAgIDxwYXRoIGNsYXNzPSJhIiBkPSJNOTMyLjgzNjQsNTUuMDVhNjYuNjI4NCw2Ni42Mjg0LDAsMCwwLTY2LjYyODUsNjYuNjI4NHY2Ni42Mjg1SDg4MS44M1YxMjEuNjc4OGguMDM1M2E1MC45NzA3LDUwLjk3MDcsMCwwLDEsMTAxLjk0MTQsMGgxNS42NTc2QTY2LjYyODIsNjYuNjI4MiwwLDAsMCw5MzIuODM2NCw1NS4wNVoiLz4KICAgICAgICAgICAgPHBhdGggY2xhc3M9ImEiIGQ9Ik0xMDc4Ljc1LDU1LjA1NTVBNjYuNjIzNCw2Ni42MjM0LDAsMSwwLDExMzQuNjU2LDE1Ny44OTdoLTIwLjA2ODdhNTAuOTUyLDUwLjk1MiwwLDEsMSwxNS4xMzU5LTM2LjIxODFIMTA3OC43NXYxNS42NWg2NC43NjM5YTY1Ljk1MjcsNjUuOTUyNywwLDAsMCwxLjg1OTMtMTUuNjVBNjYuNjIzOCw2Ni42MjM4LDAsMCwwLDEwNzguNzUsNTUuMDU1NVoiLz4KICAgICAgICAgICAgPHBhdGggY2xhc3M9ImEiIGQ9Ik0xMzg5LjQ0Nyw1NS4wNTU1YTY2LjYyMzQsNjYuNjIzNCwwLDEsMCw1NS45MDY0LDEwMi44NDE1aC0yMC4wNjg3YTUwLjk1Miw1MC45NTIsMCwxLDEsMTUuMTM1OS0zNi4yMTgxSDEzODkuNDQ3djE1LjY1aDY0Ljc2MzlhNjUuOTUyNyw2NS45NTI3LDAsMCwwLDEuODU5My0xNS42NUE2Ni42MjM4LDY2LjYyMzgsMCwwLDAsMTM4OS40NDcsNTUuMDU1NVoiLz4KICAgICAgICAgICAgPHBhdGggY2xhc3M9ImEiIGQ9Ik0xMTc4LjM5OSwxMjEuNjc5aC0uMDM1NlY1NS4wNWgtMTUuNjIyVjEyMS42NzloMGE2Ni42MjgxLDY2LjYyODEsMCwwLDAsNjYuNjI4MSw2Ni42MjgzVjE3Mi42NUE1MC45Nyw1MC45NywwLDAsMSwxMTc4LjM5OSwxMjEuNjc5WiIvPgogICAgICAgICAgICA8cGF0aCBjbGFzcz0iYSIgZD0iTTEyNjMuODk4MSwxMjEuNjc5aC0uMDM1NlY1NS4wNUgxMjQ4LjI0VjEyMS42NzloMGE2Ni42Mjc5LDY2LjYyNzksMCwwLDAsNjYuNjI4MSw2Ni42MjgzVjE3Mi42NUE1MC45Nyw1MC45NywwLDAsMSwxMjYzLjg5ODEsMTIxLjY3OVoiLz4KICAgICAgICAgICAgPHBhdGggY2xhc3M9ImEiIGQ9Ik04MzMuMTkyOCw1NS4wNVY3OC43ODU2YTY2LjYyODQsNjYuNjI4NCwwLDEsMCwwLDg1Ljc4NjZ2MjMuNzM1MUg4NDguODVWNTUuMDVaTTc4Mi4yMjE5LDE3Mi42NWE1MC45NzA4LDUwLjk3MDgsMCwxLDEsNTAuOTcwOS01MC45NzA2QTUwLjk3LDUwLjk3LDAsMCwxLDc4Mi4yMjE5LDE3Mi42NVoiLz4KICAgICAgICAgICAgPHBhdGggY2xhc3M9ImEiIGQ9Ik0zOTAuMDUyMiw1NS4wNVY3OC43ODU2YTY2LjYyODQsNjYuNjI4NCwwLDEsMCwwLDg1Ljc4NjZ2MjMuNzM1MUg0MDUuNzFWNTUuMDVaTTMzOS4wODEzLDE3Mi42NWE1MC45NzA4LDUwLjk3MDgsMCwxLDEsNTAuOTcwOS01MC45NzA2QTUwLjk3LDUwLjk3LDAsMCwxLDMzOS4wODEzLDE3Mi42NVoiLz4KICAgICAgICAgICAgPHBhdGggY2xhc3M9ImEiIGQ9Ik01NTUuNDQsMTIxLjY3OUE2Ni42Njg1LDY2LjY2ODUsMCwxLDAsNTMwLjA1MTQsMTczLjk5bDE0LjMxNzIsMTQuMzE3MUw1NTUuNDQsMTc3LjIzNTgsNTQxLjEyMywxNjIuOTE4NkE2Ni4zMjEyLDY2LjMyMTIsMCwwLDAsNTU1LjQ0LDEyMS42NzlaTTQ4OC44MTE2LDE3Mi42NWE1MC45ODY4LDUwLjk4NjgsMCwxLDEsNDEuMTQ1NC0yMC44OTY5bC0xMi4yNzU5LTEyLjI3Nkw1MDYuNjEsMTUwLjU0ODNsMTIuMjc2LDEyLjI3NTlBNTAuNzMsNTAuNzMsMCwwLDEsNDg4LjgxMTYsMTcyLjY1WiIvPgogICAgICAgICAgICA8cGF0aCBjbGFzcz0iYSIgZD0iTTY4Ni41MjI5LDU1LjA1VjEyMS42NzloLS4wMzUzYTUwLjk3MDgsNTAuOTcwOCwwLDAsMS0xMDEuOTQxNiwwaC0uMDM1M1Y1NS4wNUg1NjguODg4NFYxMjEuNjc5YTY2LjYyODQsNjYuNjI4NCwwLDAsMCwxMzMuMjU2OCwwVjU1LjA1WiIvPgogICAgICAgICAgICA8cGF0aCBjbGFzcz0iYSIgZD0iTTkzMi44MzY0LDU1LjA1YTY2LjYyODQsNjYuNjI4NCwwLDAsMC02Ni42Mjg1LDY2LjYyODR2NjYuNjI4NUg4ODEuODNWMTIxLjY3ODhoLjAzNTNhNTAuOTcwNyw1MC45NzA3LDAsMCwxLDEwMS45NDE0LDBoMTUuNjU3NkE2Ni42MjgyLDY2LjYyODIsMCwwLDAsOTMyLjgzNjQsNTUuMDVaIi8+CiAgICAgICAgICAgIDxwYXRoIGNsYXNzPSJhIiBkPSJNMTA3OC43NSw1NS4wNTU1QTY2LjYyMzQsNjYuNjIzNCwwLDEsMCwxMTM0LjY1NiwxNTcuODk3aC0yMC4wNjg3YTUwLjk1Miw1MC45NTIsMCwxLDEsMTUuMTM1OS0zNi4yMTgxSDEwNzguNzV2MTUuNjVoNjQuNzYzOWE2NS45NTI3LDY1Ljk1MjcsMCwwLDAsMS44NTkzLTE1LjY1QTY2LjYyMzgsNjYuNjIzOCwwLDAsMCwxMDc4Ljc1LDU1LjA1NTVaIi8+CiAgICAgICAgICAgIDxwYXRoIGNsYXNzPSJhIiBkPSJNMTM4OS40NDcsNTUuMDU1NWE2Ni42MjM0LDY2LjYyMzQsMCwxLDAsNTUuOTA2NCwxMDIuODQxNWgtMjAuMDY4N2E1MC45NTIsNTAuOTUyLDAsMSwxLDE1LjEzNTktMzYuMjE4MUgxMzg5LjQ0N3YxNS42NWg2NC43NjM5YTY1Ljk1MjcsNjUuOTUyNywwLDAsMCwxLjg1OTMtMTUuNjVBNjYuNjIzOCw2Ni42MjM4LDAsMCwwLDEzODkuNDQ3LDU1LjA1NTVaIi8+CiAgICAgICAgICAgIDxwYXRoIGNsYXNzPSJhIiBkPSJNMTE3OC4zOTksMTIxLjY3OWgtLjAzNTZWNTUuMDVoLTE1LjYyMlYxMjEuNjc5aDBhNjYuNjI4MSw2Ni42MjgxLDAsMCwwLDY2LjYyODEsNjYuNjI4M1YxNzIuNjVBNTAuOTcsNTAuOTcsMCwwLDEsMTE3OC4zOTksMTIxLjY3OVoiLz4KICAgICAgICAgICAgPHBhdGggY2xhc3M9ImEiIGQ9Ik0xMjYzLjg5ODEsMTIxLjY3OWgtLjAzNTZWNTUuMDVIMTI0OC4yNFYxMjEuNjc5aDBhNjYuNjI3OSw2Ni42Mjc5LDAsMCwwLDY2LjYyODEsNjYuNjI4M1YxNzIuNjVBNTAuOTcsNTAuOTcsMCwwLDEsMTI2My44OTgxLDEyMS42NzlaIi8+CiAgICAgICAgPC9nPgogICAgICAgIDxwYXRoIGNsYXNzPSJhIiBkPSJNMjE5LjMzODksMTQ3LjEzMjFhMTA0Ljc0ODMsMTA0Ljc0ODMsMCwwLDAsMi45ODkyLTExLjQyLDExMy44MTA2LDExMy44MTA2LDAsMCwwLDIuNDIyOS0yMy4zOTZjMC0yNS43ODg0LTExLjcwNTEtMTA4LjIxLTEwNS40NjM0LTExMi4xNjM2LS4wOTA4LS4wMDQ3LS4xODE2LS4wMDc4LS4yNzI1LS4wMTI1LS4zNjA4LS4wMTQ0LS43MjEyLS4wMjg4LTEuMDg0NC0uMDQxMkMxMTYuNDE5NC4wMzkzLDExNC45MDI4LDAsMTEzLjM3NTUsMGMtLjE0MjEsMC0uMjgzMi4wMDQ2LS40MjUzLjAwNTRDODMuNTU1Ny0uMTIwOCw0Ni41NTIyLDcuMTY1OCwwLDI1LjU4MzdsLjEyNzkuMTg5NUMxMC42MjQsNDEuMjgyLDExLjE1NjIsNjAuNzM1OCw1LjQxMTYsNzguNTZBMTA0Ljg2NTQsMTA0Ljg2NTQsMCwwLDAsMi40MjI0LDg5Ljk4LDExMy44NDM4LDExMy44NDM4LDAsMCwwLDAsMTEzLjM3NTdjMCwyNS43ODgxLDExLjcwNTEsMTA4LjIxLDEwNS40NjI5LDExMi4xNjM0LjA5MDguMDA0Ni4xODIxLjAwOC4yNzI5LjAxMjRxLjU0MDYuMDIyMSwxLjA4NC4wNDFjMS41MTEzLjA2LDMuMDI4My4wOTkyLDQuNTU1Mi4wOTkyLjE0MjYsMCwuMjgzMi0uMDA0OS40MjUzLS4wMDU0LDI5LjM5NS4xMjYyLDY2LjM5ODQtNy4xNiwxMTIuOTUwNy0yNS41Nzg0bC0uMTI4NC0uMTg5NEMyMTQuMTI3LDE4NC40MSwyMTMuNTk0MiwxNjQuOTU1OCwyMTkuMzM4OSwxNDcuMTMyMVpNMzAuMTc0OCwxMzcuOTMwOWE3My4yODc5LDczLjI4NzksMCwwLDAsNC4zMTQ5LDYuNTUzNyw3Ni4yODc4LDc2LjI4NzgsMCwwLDAsNTQuNzQ5MSwzMC44MTQ1LDc4LjM3NTMsNzguMzc1MywwLDAsMCwxNi4xOTg3LS4yOWwyLjAwNTktLjI2MjdjLjY3ODItLjEwODQsMS4zODIzLS4yNjUxLDIuMDcxMi0uMzk4OWw0LjE0NzUtLjg2ODZjMS4zNzQ1LS4zMTg0LDIuNzE0OS0uOCw0LjA2ODktMS4yMDcxYTM1LjQ1NTUsMzUuNDU1NSwwLDAsMCw0LjAwMTktMS40MDkybDMuODk0NS0xLjY5NzdjLjMyMTgtLjE0NjUuNjQ4NS0uMjgyMi45NjU0LS40Mzg1bC45MzExLS41MSwxLjg1Ni0xLjAyODksMS44NDcyLTEuMDQxOS45MTk0LS41MjU5Ljg3NS0uNTk3MmMxLjE2Ny0uNzk1NCwyLjMyMDgtMS42MTA4LDMuNDY4Mi0yLjQzbC44NTg0LS42MTU3LjgwODYtLjY4MDcsMS42MDctMS4zNzIsMS41OTUyLTEuMzgxNC43OTMtLjY5NDMuNzM2My0uNzU0NCwyLjkxMzEtMy4wNDI1LjcxNDgtLjc3LjY1NDgtLjgyMzIsMS4zLTEuNjUxOWE2My4wNyw2My4wNywwLDAsMCwxMi44OTM2LTMwLjM5NzVjLjA1MzctLjM0MTMuMTE3Ni0uNjgwNi4xNjA2LTEuMDIyOWwuMDgyNS0xLjAzNDIuMTQ2LTIuMDY3OS4xMjg5LTIuMDY0NC4wNi0xLjAzYy4wMDI5LS4zNDQyLS4wMTQyLS42ODg1LS4wMjEtMS4wMzIyYTU5LjM3MjIsNTkuMzcyMiwwLDAsMC0uNTYzNS04LjE5NjNjLS4yMDQxLTEuMzU3OS0uMzU3NC0yLjY4NjUtLjYyNS00LjA1MzJMMTU5LjcyLDk1Ljc1NjFjLS4zMzY5LTEuMzc3OS0uODkzLTIuNzA1Ni0xLjM1NTktNC4wNDQ0LS4yNTMtLjY2NDEtLjQ2ODMtMS4zMzk0LS43NTkzLTEuOTg2NGwtLjkxLTEuOTI1N2E0OC43MTcxLDQ4LjcxNzEsMCwwLDAtOS41OTYyLTEzLjc1MDUsNTAuNTI5LDUwLjUyOSwwLDAsMC0xMy4yNjE3LTkuNzAzNiw0Ny44OTY0LDQ3Ljg5NjQsMCwwLDAtMzEuMTEtNC4xNzM5LDM4Ljc1MjcsMzguNzUyNywwLDAsMC0xNC40NjkzLDYuMTE2MkEzNi4yNzQ4LDM2LjI3NDgsMCwwLDAsNzcuOTAyOCw3Ny4zNTQyYTM0LjIxMywzNC4yMTMsMCwwLDAtNC43LDEzLjY4MjIsMzAuODMzNSwzMC44MzM1LDAsMCwwLDEuNDcxMiwxMy42MjMsMzMuNzQwOSwzMy43NDA5LDAsMCwxLDIuOTIwOS0xMi40NjUzLDMwLjcyNDQsMzAuNzI0NCwwLDAsMSw2LjkxNDEtOS43MTI0LDI4LjYwNzIsMjguNjA3MiwwLDAsMSw5LjQ2MTktNS45MjkyLDI2LjY5OSwyNi42OTksMCwwLDEsMTAuNDIzOC0xLjczMTVjLjkxMDcuMDY2LDEuODA3Mi4wMTQyLDIuNjk5My4xMTY3bDIuNjQ4OS4zNDA5YTMzLjAyNTUsMzMuMDI1NSwwLDAsMSw1LjA3NzYsMS4zNDQyLDMxLjg2MzQsMzEuODYzNCwwLDAsMSw5LjAwOTMsNC43MTI5LDM0LjUyNDYsMzQuNTI0NiwwLDAsMSw2Ljg2NjcsNy4wMzEyLDI4Ljk2NTQsMjguOTY1NCwwLDAsMSw0LjE4Niw4LjQ5MzdsLjM2MjgsMS4xMDU1YS4zOTcyLjM5NzIsMCwwLDEsLjAxMTcuMDQzMWwuNDc1NiwyLjIzMzJhNi4yODgxLDYuMjg4MSwwLDAsMSwuMjA5LDEuMTM3MnEuMTE3MiwxLjE2LjI2ODYsMi4yOTc5Yy4wNTQyLjc5ODMuMDI2OCwxLjY2MjYuMDU2NiwyLjQ4MjlhMzcuNDMsMzcuNDMsMCwwLDEtLjE5MTQsNC45MzI2Yy0uMDE1MS4yMDM2LS4wMTkuNDA4Mi0uMDQxNS42MTA5bC0uMTE0OC42MDQtLjIxODcsMS4yMDQ2LS4yMDE3LDEuMjAxMS0uMDkxMy42Yy0uMDQ0OS4xOTczLS4xMDkzLjM5MTYtLjE2MjYuNTg3NGEzNS4wNywzNS4wNywwLDAsMS0xLjQzNjUsNC42MjIxbC0uNDIyNCwxLjEyODRhNi41MDQ5LDYuNTA0OSwwLDAsMS0uNDYsMS4xMTA5bC0xLjA1MDgsMi4xNjNhMTcuMTgwOCwxNy4xODA4LDAsMCwxLTEuMTk1OCwyLjA3NzdsLS42MTcyLDEuMDI0NGE2Ljc2ODcsNi43Njg3LDAsMCwxLS42NTg3Ljk5NTYsMzQuOTg0NywzNC45ODQ3LDAsMCwxLTIuOTU5NCwzLjczbC0uNzg1Ny44ODg2LS4zODgyLjQ0NzMtLjQ0MDkuMzk4Yy0uNTg3NC41My0xLjE1NzcsMS4wNzIyLTEuNzI1MSwxLjYxNzFsLS40MjMzLjQxMDctLjQ3MjcuMzU0LS45MzY1LjcxNDgtLjkyNDguNzI1MS0uNDU5NS4zNjUzLS41MDI0LjMwNTFjLS42Njg1LjQwODMtMS4zMy44MjA4LTEuOTc4NSwxLjI1M2wtLjQ4NjQuMzIzNy0uNTI1NC4yNTc4LTEuMDQyOS41MjQ0LTEuMDM0Mi41MzY3LS41MTQyLjI3MzRjLS4xNzcyLjA3OTEtLjM2MzcuMTM4Mi0uNTQ0NC4yMDk1cS0xLjA5Mi40MDkzLTIuMTY4Ljg0NjJhMTYuMjUzNywxNi4yNTM3LDAsMCwxLTIuMjE1OC43MDQ1Yy0uNzUxNS4xOTU0LTEuNDc0Ni40ODMtMi4yNC42M2wtMi4zMDEzLjQxMzFjLS4zODcyLjA2OTQtLjc1MjkuMTYwNy0xLjE1NjMuMjE4M2wtMS4yNTc4LjEzMThhNTAuNzYwNiw1MC43NjA2LDAsMCwxLTI5LjIyMTYtNS41MDU4LDUyLjA2NjksNTIuMDY2OSwwLDAsMS0yNS41MTY2LTMwLjY4MzJsLS43MTc4LTIuNTE5NWMtLjE5MjktLjg1ODQtLjQxNDYtMS42OTM4LS42MDExLTIuNTc1N2wtLjQ5NTYtMi43MjdjLS4xNjYtLjkxMTEtLjI1LTEuODMtLjM5MTYtMi43NDcxYTc0Ljg5LDc0Ljg5LDAsMCwxLS41Ni0xMS4xNHEuMDI5MS0xLjA3MDcuMDkxNC0yLjE0MzFDNDYuMDYxNiw1OC41MDYyLDY1LjM3OTIsMzYuMjgzLDkxLjMsMjkuNDc4OGE4Ny4wNTczLDg3LjA1NzMsMCwwLDEsNjEuNTU1OSw2LjY1MDYsODYuNzE2LDg2LjcxNiwwLDAsMSw0NS4yNDQ1LDc1LjA0MTVjLjYwOTQsNDcuMDg1Ny0zNi45OTI4LDg2LjQyNzEtODQuMDYxMyw4Ny44Mzc1YTg2LjQ1ODMsODYuNDU4MywwLDAsMS00Mi4xNDQyLTkuNDQ2MUE4Ni45NDg5LDg2Ljk0ODksMCwwLDEsMzAuMTc0OCwxMzcuOTMwOVoiLz4KICAgIDwvZz4KPC9zdmc+';

//

var script$9 = {
    name: 'app-root',
    props: {
        user: {type: Object, required: true},
        options: {
            type: Object, default: () => ({
                firstDayOfWeek: 0,
                language: 'en'
            })
        }
    },
    data()
    {
        return {
            logo: Logo,
            status: null,
            ready: false
        }
    },
    created()
    {
        this.status = "Initialising...";

        this.user.refresh()
            .then(() => {
                this.status = "Loading locale...";
                const options = this.options;
                this.$intl.firstDayOfWeek = options.firstDayOfWeek || 0;
                this.$intl.language = options.language || 'en';
            })
            .then(() => {
                this.status = 'Enjoy!';
                this.$nextTick(() => {
                    this.ready = true;
                });
            });
    }
};

/* script */
            const __vue_script__$9 = script$9;
/* template */
var __vue_render__$9 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return (_vm.ready)?_c('router-view'):_c('v-app',[_c('v-container',{attrs:{"fluid":"","fill-height":""}},[_c('v-layout',{attrs:{"justify-center":"","align-center":""}},[_c('v-flex',{staticClass:"text-xs-center"},[_c('img',{staticStyle:{"max-width":"80%"},attrs:{"src":_vm.logo}}),_vm._v(" "),_c('v-progress-linear',{attrs:{"indeterminate":""}}),_vm._v(" "),_c('v-flex',[_vm._v(_vm._s(_vm.status))])],1)],1)],1)],1)};
var __vue_staticRenderFns__$9 = [];

  /* style */
  const __vue_inject_styles__$9 = undefined;
  /* scoped */
  const __vue_scope_id__$9 = undefined;
  /* module identifier */
  const __vue_module_identifier__$9 = undefined;
  /* functional template */
  const __vue_is_functional_template__$9 = false;
  /* component normalizer */
  function __vue_normalize__$9(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "AppRoot.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var AppRoot = __vue_normalize__$9(
    { render: __vue_render__$9, staticRenderFns: __vue_staticRenderFns__$9 },
    __vue_inject_styles__$9,
    __vue_script__$9,
    __vue_scope_id__$9,
    __vue_is_functional_template__$9,
    __vue_module_identifier__$9,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//

var script$a = {
    name: 'app-toolbar',
    props: {
        title: {
            type: String,
            default: ''
        },
        back: {
            type: String,
            default: ''
        },
        id: {
            type: String,
            default: 'app-toolbar'
        },
        showBack: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            titleSelector: '#app-title',
            toolbarSelector: '#app-actions',
        };
    },
    created() {
        this.updatePageTitle();
    },
    beforeDestroy() {
        if (document.title === this.title) {
            this.updatePageTitle('');
        }
    },
    watch: {
        title(val) {
            this.updatePageTitle(val);
        }
    },
    methods: {
        updatePageTitle(title = this.title) {
            document.title = title;
        }
    }
};

/* script */
            const __vue_script__$a = script$a;
            
/* template */
var __vue_render__$a = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{directives:[{name:"show",rawName:"v-show",value:(false),expression:"false"}]},[_c('span',{directives:[{name:"dom-portal",rawName:"v-dom-portal",value:(_vm.titleSelector),expression:"titleSelector"}]},[(_vm.showBack)?_c('v-btn',{directives:[{name:"show",rawName:"v-show",value:(_vm.back.length > 0),expression:"back.length > 0"}],staticClass:"ml-0 mr-0",attrs:{"exact":"","small":"","icon":"","to":_vm.back}},[_c('v-icon',[_vm._v("arrow_back")])],1):_vm._e(),_vm._v("\n        "+_vm._s(_vm.title)+"\n    ")],1),_vm._v(" "),_c('div',{directives:[{name:"dom-portal",rawName:"v-dom-portal",value:(_vm.toolbarSelector),expression:"toolbarSelector"}]},[_vm._t("default")],2)])};
var __vue_staticRenderFns__$a = [];

  /* style */
  const __vue_inject_styles__$a = undefined;
  /* scoped */
  const __vue_scope_id__$a = undefined;
  /* module identifier */
  const __vue_module_identifier__$a = undefined;
  /* functional template */
  const __vue_is_functional_template__$a = false;
  /* component normalizer */
  function __vue_normalize__$a(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "AppToolbar.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var AppToolbar = __vue_normalize__$a(
    { render: __vue_render__$a, staticRenderFns: __vue_staticRenderFns__$a },
    __vue_inject_styles__$a,
    __vue_script__$a,
    __vue_scope_id__$a,
    __vue_is_functional_template__$a,
    __vue_module_identifier__$a,
    undefined,
    undefined
  );

//
//
//
//
//
//
//
//
//
//
//
//

var script$b = {
    props: {
        multiLine: {
            type: Boolean,
            default: false,
        },
        vertical: {
            type: Boolean,
            default: false,
        },
        position: {
            type: Object,
            default() {
                return {bottom: true}
            }
        }
    },
    data() {
        return {
            type: '',
            snackbar: false,
            message: null,
            timeout: 3000
        };
    },
    methods: {
        showInfo(message, timeout = 3000)
        {
            this.show("info", message, timeout);
        },
        showSuccess(message, timeout = 3000)
        {
            this.show("success", message, timeout);
        },
        showError(message, timeout = 3000)
        {
            this.show("error", message, timeout);
        },
        show(type, message, timeout = 3000)
        {
            this.snackbar = false;
            this.$nextTick(() => {
                this.type = type;
                this.timeout = timeout;
                this.message = message;
                this.snackbar = true;
            });
        },
        hide()
        {
            this.snackbar = false;
        }
    }
};

/* script */
            const __vue_script__$b = script$b;
            
/* template */
var __vue_render__$b = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-snackbar',_vm._b({attrs:{"color":_vm.type,"timeout":_vm.timeout,"vertical":_vm.vertical,"multi-line":_vm.multiLine},model:{value:(_vm.snackbar),callback:function ($$v) {_vm.snackbar=$$v;},expression:"snackbar"}},'v-snackbar',_vm.position,false),[_vm._t("default",[_vm._v("\n        "+_vm._s(_vm.message)+"\n    ")],{message:_vm.message}),_vm._v(" "),_vm._t("actions",[_c('v-btn',{attrs:{"icon":"","flat":""},nativeOn:{"click":function($event){$event.stopPropagation();_vm.hide();}}},[_c('v-icon',[_vm._v("close")])],1)])],2)};
var __vue_staticRenderFns__$b = [];

  /* style */
  const __vue_inject_styles__$b = undefined;
  /* scoped */
  const __vue_scope_id__$b = undefined;
  /* module identifier */
  const __vue_module_identifier__$b = undefined;
  /* functional template */
  const __vue_is_functional_template__$b = false;
  /* component normalizer */
  function __vue_normalize__$b(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "AppNotifier.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var AppNotifier = __vue_normalize__$b(
    { render: __vue_render__$b, staticRenderFns: __vue_staticRenderFns__$b },
    __vue_inject_styles__$b,
    __vue_script__$b,
    __vue_scope_id__$b,
    __vue_is_functional_template__$b,
    __vue_module_identifier__$b,
    undefined,
    undefined
  );

//

var script$c = {
    name: 'app-page',
    components: {AppToolbar, AppNotifier},
    props: {
        title: {
            type: String,
            default: ''
        },
        back: {
            type: String,
            default: ''
        },
        loading: {
            type: Boolean,
            default: false
        },
        showBack: {
            type: Boolean,
            default: false
        }
    },
    data()
    {
        return {
            showLogin: false,
            processingLogin: false,
            loginCallback: null,
            loginError: false,

            email: '',
            emailRules: [
                v => !!v || 'E-mail is required',
                v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,32})+$/.test(v) || 'E-mail must be valid'
            ],

            pass: '',
            passRules: [
                v => !!v || 'Password is required',
                v => v.length >= 6 || 'Minimum 6 chars',
            ]
        }
    },
    computed: {
        notifier()
        {
            return this.$refs.notifier;
        },
        canLogin()
        {
            return this.emailRules.every(rule => rule(this.email) === true) && this.passRules.every(
                rule => rule(this.pass) === true);
        }
    },
    methods: {
        notify(type, message, timeout = 3000)
        {
            this.notifier.show(type, message, timeout);
        },
        doLogin(callback)
        {
            this.processingLogin = false;
            this.loginCallback = callback || null;
            this.email = this.$user.email || '';
            this.pass = '';
            this.showLogin = true;
        },
        tryLogin(email, pass)
        {
            if (!this.canLogin) {
                return;
            }
            this.processingLogin = true;
            this.loginError = false;

            this.$user.signIn(email, pass)
                .then(() => {
                    this.processingLogin = false;
                    this.showLogin = false;
                    const cb = this.loginCallback;
                    this.loginCallback = null;
                    if (typeof cb === 'function') {
                        this.$nextTick(cb);
                    }
                })
                .catch(error => {
                    this.processingLogin = false;
                    this.loginError = true;
                });

        }
    }
};

/* script */
            const __vue_script__$c = script$c;
            
/* template */
var __vue_render__$c = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-flex',{attrs:{"grow":""}},[_c('app-toolbar',{attrs:{"title":_vm.title,"back":_vm.back,"show-back":_vm.showBack}},[_vm._t("toolbar")],2),_vm._v(" "),(_vm.loading)?_c('v-layout',{attrs:{"fill-height":"","justify-center":"","align-center":""}},[_c('v-progress-circular',{attrs:{"indeterminate":"","color":"secondary"}})],1):_vm._t("default"),_vm._v(" "),_c('app-notifier',{ref:"notifier"}),_vm._v(" "),_c('v-dialog',{attrs:{"lazy":"","persistent":"","max-width":"320"},model:{value:(_vm.showLogin),callback:function ($$v) {_vm.showLogin=$$v;},expression:"showLogin"}},[_c('v-card',[_c('v-card-title',{staticClass:"headline"},[_vm._v("You are not signed in")]),_vm._v(" "),_c('v-card-text',[_c('v-text-field',{attrs:{"disabled":_vm.processingLogin,"rules":_vm.emailRules,"label":"E-mail","type":"email","prepend-icon":"email"},model:{value:(_vm.email),callback:function ($$v) {_vm.email=$$v;},expression:"email"}}),_vm._v(" "),_c('v-text-field',{attrs:{"disabled":_vm.processingLogin,"rules":_vm.passRules,"label":"Password","type":"password","prepend-icon":"lock"},model:{value:(_vm.pass),callback:function ($$v) {_vm.pass=$$v;},expression:"pass"}})],1),_vm._v(" "),_c('v-card-actions',[_c('span',{directives:[{name:"show",rawName:"v-show",value:(_vm.loginError),expression:"loginError"}],staticClass:"red--text"},[_c('v-icon',{attrs:{"color":"red"}},[_vm._v("error")]),_vm._v("Sign in failed\n                ")],1),_vm._v(" "),_c('v-spacer'),_vm._v(" "),_c('v-btn',{attrs:{"flat":"","disabled":_vm.processingLogin || !_vm.canLogin,"loading":_vm.processingLogin},on:{"click":function($event){$event.stopPropagation();_vm.tryLogin(_vm.email, _vm.pass);}}},[_vm._v("\n                    Sign in "),_c('v-icon',[_vm._v("navigate_next")])],1)],1)],1)],1)],2)};
var __vue_staticRenderFns__$c = [];

  /* style */
  const __vue_inject_styles__$c = undefined;
  /* scoped */
  const __vue_scope_id__$c = undefined;
  /* module identifier */
  const __vue_module_identifier__$c = undefined;
  /* functional template */
  const __vue_is_functional_template__$c = false;
  /* component normalizer */
  function __vue_normalize__$c(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "AppPage.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var AppPage = __vue_normalize__$c(
    { render: __vue_render__$c, staticRenderFns: __vue_staticRenderFns__$c },
    __vue_inject_styles__$c,
    __vue_script__$c,
    __vue_scope_id__$c,
    __vue_is_functional_template__$c,
    __vue_module_identifier__$c,
    undefined,
    undefined
  );

//

var script$d = {
    name: 'app-dashboard',
    components: {ImageIcon, AppUser, AppExtensions},
    props: {
        app: {type: Object, required: true}
    },
    methods: {
        vendors() {
            let vendors = [];
            const all = this.app.getAllVendors();

            for (const p in all) {
                if (!all.hasOwnProperty(p)) {
                    continue;
                }
                const vendor = all[p];
                if (!this.hasPermissions(vendor.permissions || [])) {
                    continue;
                }
                if (!this.hasExtPermissions(vendor.name)) {
                    continue;
                }
                vendors.push({
                    name: vendor.name,
                    title: vendor.title || vendor.name,
                    description: vendor.description || null,
                    icon: vendor.icon || null,
                    url: vendor.url,
                    extensions: this.app.getAllVendorExtensions(vendor.name)
                });
            }
            return vendors;
        },
        hasPermissions(perm) {
            return this.app.user.hasPermission(perm);
        },
        hasExtPermissions(vendor)
        {
            return this.app.getAllVendorExtensions(vendor).map(ext => {
                // Check permissions
                if (!this.hasPermissions(ext.permissions)) {
                    return;
                }
                if (ext.menu.length === 0) {
                    return true;
                }
                return ext.menu.some(region => {
                    if (!this.hasPermissions(region.permissions)) {
                        return false;
                    }
                    return region.items.some(item => this.hasPermissions(item.permissions));
                });
            });
        }
    }
};

/* script */
            const __vue_script__$d = script$d;
            
/* template */
var __vue_render__$d = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-app',[_c('v-card',{attrs:{"flat":""}},[_c('v-toolbar',{attrs:{"color":"primary","dark":""}},[_c('v-toolbar-title',[_vm._v("Welcome to Aquarelle")]),_vm._v(" "),_c('v-spacer'),_vm._v(" "),_c('v-menu',{attrs:{"offset-x":"","max-width":"320"}},[_c('v-btn',{attrs:{"slot":"activator","icon":""},slot:"activator"},[_c('v-icon',[_vm._v("person")])],1),_vm._v(" "),_c('app-user',{staticStyle:{"width":"320px"},attrs:{"user":_vm.app.user}})],1)],1),_vm._v(" "),_c('app-extensions',{attrs:{"app":_vm.app,"always-open":""}})],1)],1)};
var __vue_staticRenderFns__$d = [];

  /* style */
  const __vue_inject_styles__$d = undefined;
  /* scoped */
  const __vue_scope_id__$d = undefined;
  /* module identifier */
  const __vue_module_identifier__$d = undefined;
  /* functional template */
  const __vue_is_functional_template__$d = false;
  /* component normalizer */
  function __vue_normalize__$d(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "AppDashboard.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var AppDashboard = __vue_normalize__$d(
    { render: __vue_render__$d, staticRenderFns: __vue_staticRenderFns__$d },
    __vue_inject_styles__$d,
    __vue_script__$d,
    __vue_scope_id__$d,
    __vue_is_functional_template__$d,
    __vue_module_identifier__$d,
    undefined,
    undefined
  );

//

var script$e = {
    name: 'app-extension-route',
    components: {
        AppMenu,
        AppExtensions,
        AppUser,
        AppLayout
    },
    data() {
        return {
            contentHeight: '100%'
        };
    },
    props: {
        appInfo: {
            type: Object,
            required: true
        }
    },
    watch: {
        '$vuetify.breakpoint.height'(value) {
            this.refreshToolbarHeight(value);
        }
    },
    mounted() {
        this.refreshToolbarHeight(this.$vuetify.breakpoint.height);
    },
    methods: {
        refreshToolbarHeight(height)
        {
            const layout = this.$refs.layout;
            if (layout && layout.$refs.toolbar) {
                this.contentHeight = height - layout.$refs.toolbar.computedHeight;
            } else {
                this.contentHeight = height;
            }
        }
    }
};

/* script */
            const __vue_script__$e = script$e;
            
/* template */
var __vue_render__$e = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('app-layout',{ref:"layout"},[_c('app-menu',{attrs:{"slot":"app-left-drawer","user":_vm.appInfo.user,"app":_vm.appInfo.app,"vendor":_vm.appInfo.vendor,"extension":_vm.appInfo.extension},slot:"app-left-drawer"}),_vm._v(" "),_c('template',{slot:"app-right-drawer"},[_c('app-user',{attrs:{"user":_vm.appInfo.user}}),_vm._v(" "),_c('app-extensions',{attrs:{"user":_vm.appInfo.user,"app":_vm.appInfo.app,"current-vendor":_vm.appInfo.vendor}})],1),_vm._v(" "),_c('v-content',[_c('v-layout',{style:({height: _vm.contentHeight})},[_c('router-view')],1)],1)],2)};
var __vue_staticRenderFns__$e = [];

  /* style */
  const __vue_inject_styles__$e = undefined;
  /* scoped */
  const __vue_scope_id__$e = undefined;
  /* module identifier */
  const __vue_module_identifier__$e = undefined;
  /* functional template */
  const __vue_is_functional_template__$e = false;
  /* component normalizer */
  function __vue_normalize__$e(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "AppExtensionRoute.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var AppExtensionRoute = __vue_normalize__$e(
    { render: __vue_render__$e, staticRenderFns: __vue_staticRenderFns__$e },
    __vue_inject_styles__$e,
    __vue_script__$e,
    __vue_scope_id__$e,
    __vue_is_functional_template__$e,
    __vue_module_identifier__$e,
    undefined,
    undefined
  );

var EntityMixin = {
    methods: {
        entityLoader(name)
        {
            return Loaders.get(name);
        },
        entityTypes(name, cached = true)
        {
            const loader = this.entityLoader(name);
            let promise = null;
            if (cached) {
                promise = loader.cached('types');
            }
            else {
                promise = loader.getTypes();
            }
            return promise;
        },
        entityType(name, type, behavior = null, cached = true, type_field = 'type', behavior_field = 'behavior')
        {
            return this.entityTypes(name, cached)
                .then(types => this.entityTypeFromList(types, type, behavior, type_field, behavior_field));
        },
        entityTypeFields(
            name,
            type,
            prop = 'fields',
            fallback = [],
            type_field = 'type',
            behavior_field = 'behavior',
            cached = true
        )
        {
            let behavior = null;

            if (typeof type === 'object') {
                behavior = type[behavior_field] || null;
                type = type[type_field];
            }

            return this.entityType(name, type, behavior, cached, type_field, behavior_field)
                .then(type => type[prop] || fallback)
                .catch(() => fallback);
        },
        entityTypeFromList(types, type, behavior = null, type_field = 'type', behavior_field = 'behavior')
        {
            if (!types) {
                return null;
            }
            for (let i = 0; i < types.length; i++) {
                if (types[i][type_field] !== type) {
                    continue;
                }

                if (behavior == null) {
                    return types[i];
                }

                if (types[i][behavior_field] === behavior) {
                    return types[i];
                }
            }
            return null;
        }
    }
};

/**
 * Load records
 */
class BaseLoader extends Requestor
{

  /**
   * Create new record
   * @param data
   */
  create(data)
  {
    return this._sendData(data);
  }

  /**
   * Get all records
   * @param options
   */
  getAll(options)
  {
    let url = this._url;
    if (options) {
      url += '?' + (new URLSearchParams(options)).toString();
    }
    return this._fetch(url);
  }

  /**
   * Get record by id
   * @param id
   */
  get(id)
  {
    return this._fetch(this._url + '/' + id);
  }

  /**
   * Update record
   * @param id
   * @param data
   */
  update(id, data)
  {
    return this._sendData(data, id);
  }

  /**
   * Delete record
   * @param id
   */
  delete(id)
  {
    let url = this._url + '/' + id;
    return this._fetch(url, {
      method: "delete"
    });
  }

  /**
   *
   * @param {Object} data
   * @param {String} id
   * @param {String} append
   * @returns {Promise<Object|ServerError>}
   * @protected
   */
  _sendData(data, id, append = '')
  {
    let url = id ? this._url + '/' + id : this._url;
    return this._send(url + append, data, id ? 'put' : 'post');
  }
}

/**
 * Data loader class
 */
class DataLoader extends BaseLoader {

    constructor(url, hasTypes = true) {
        super(url);
        this._hasTypes = hasTypes;
    }

    /**
     * Checks if loader has types
     * @return {boolean}
     */
    hasTypes() {
        return this._hasTypes;
    }

    /**
     * Get types
     * @returns {*}
     */
    getTypes(){
        if (!this._hasTypes) {
            return null;
        }
        return this._fetch(this._url + '/types').then(data => data.collection);
    }
}

class Loader extends DataLoader
{
    constructor(url)
    {
        super(url, false);
    }

    whoAmI()
    {
        return this._fetch(this._url + '/whoami');
    }

    signOut(key = '')
    {
        return this._send(this._url + '/signout', {key}, 'post');
    }

    signIn(email, password)
    {
        return this._send(this._url + '/signin', {email, password}, 'post');
    }
}

function mapUser(user, data)
{
    ['id', 'name', 'email', 'avatar', 'roles', 'permissions', 'isAdmin', 'signOutKey'].map(p => {
        user[p] = data[p];
    });
    return user;
}

var User = {
    id: null,
    name: "Admin",
    email: "admin@example.com",
    avatar: null,
    isAdmin: true,
    permissions: [],
    roles: [],
    signOutKey: '',
    loader: new Loader('/api/aquarelle/users/users'),
    setLoaderUrl(url)
    {
        this.loader = new Loader(url);
    },
    hasPermission(permission)
    {
        if (permission === false) {
            return this.isAdmin;
        }
        if (this.isAdmin || !permission) {
            return true;
        }
        if (!Array.isArray(permission)) {
            permission = [permission];
        }
        else {
            if (permission.length === 0) {
                return true;
            }
        }
        if (this.permissions.length === 0) {
            return false;
        }
        return permission.every(p => this.permissions.indexOf(p) >= 0);
    },
    refresh()
    {
        return this.loader.whoAmI().then(data => mapUser(this, data));
    },
    signOut()
    {
        return this.loader.signOut(this.signOutKey).then(() => {
            this.id = null;
            this.name = null;
            this.email = null;
            this.avatar = null;
            this.isAdmin = false;
            this.permissions = [];
            this.roles = [];
            this.signOutKey = '';
            return true;
        });
    },
    signIn(email, pass)
    {
        return this.loader.signIn(email, pass).then(data => mapUser(this, data));
    }
};

function permissionHook(to, from, next)
{
    if (to.meta && to.meta.permissions && !User.hasPermission(to.meta.permissions)) {
        next(false);
    }
    else {
        next();
    }
}

function permissionRoute(route, permissions = [])
{
    if (!route.meta) {
        route.meta = {};
    }
    if (!route.component) {
        route.component = {
            template: '<router-view></router-view>'
        };
    }
    route.beforeEnter = permissionHook;
    route.meta.permissions = permissions;
    return route;
}

function onRouteLeave(control, method = 'onRouteLeave')
{
    if (!control || typeof control !== 'object') {
        return true;
    }

    if (Array.isArray(control)) {
        for (let i = 0; i < control.length; i++) {
            if (onRouteLeave(control[i]) === false) {
                return false;
            }
        }
        return true;
    }

    if (typeof control[method] === 'function') {
        return control[method](onRouteLeave);
    }

    return true;
}

var CloseDialogsBeforeLeave = {
    beforeRouteLeave(to, from, next) {
        if (this.$refs.page && this.$refs.page.showLogin === true) {
            next(false);
            return false;
        }
        if (onRouteLeave(this) === false) {
            next(false);
            return false;
        }

        if (onRouteLeave(this.$refs.form) === false) {
            next(false);
            return false;
        }

        next();
        return true;
    }
};

var PagerMixin = {
    props: {
        filterArgs: {
            type: Object,
            default: null
        },
    },
    data() {
        let page = this.$route.query.page;
        page = page ? parseInt(page) : 1;
        if (isNaN(page) || page < 1) {
            page = 1;
        }
        let filters = {...this.$route.query};
        delete filters.page;
        return {
            page,
            queryFilters: filters
        };
    },
    watch: {
        page(val) {
            const qp = this.$route.query.page || 1;
            if (val <= 1) {
                if (qp <= 1) {
                    return;
                }
            } else {
                if (qp == val) {
                    return;
                }
            }

            this.changeRouterQuery(this.queryFilters, val);
        },
        queryFilters(val) {
            this.changeRouterQuery(val, this.page);
        }
    },
    computed: {
        listPage() {
            if (!this.$route.query) {
                return 1;
            }
            let page = this.$route.query.page || null;
            if (page == null) {
                return 1;
            }
            page = parseInt(page);
            if (isNaN(page) || page < 1) {
                return 1;
            }
            return page;
        },
        filters()
        {
            let qs = {};
            if (this.$route && this.$route.query) {
                Object.assign(qs, this.$clone(this.$route.query));
            }
            delete qs.page;
            qs = this.clearFilters(qs);

            if (this.filterArgs) {
                if (qs == null) {
                    qs = {};
                }
                Object.assign(qs, this.filterArgs);
            }
            return qs;
        },
    },
    methods: {
        changeRouterQuery(queryFilters = null, page = 1)
        {
            let qs = null;
            if (queryFilters) {
                qs = {...queryFilters};
            }
            if (page && page > 1) {
                if (qs == null) {
                    qs = {page};
                } else {
                    qs.page = page;
                }
            }

            this.$router.push({query: qs});
        },
        clearFilters(obj) {
            if (obj == null || typeof obj !== 'object') {
                return obj;
            }
            const keys = Object.keys(obj);
            if (keys.length === 0) {
                return null;
            }
            keys.map(key => {
                if (obj[key] == null || obj[key] === '') {
                    delete obj[key];
                    return;
                }

                const type = typeof obj[key];

                if (type === 'string') {
                    obj[key] = obj[key].trim();
                    if (obj[key] === '') {
                        delete obj[key];
                    }
                    return;
                }
                if (type === 'number') {
                    if (isNaN(obj[key]) || !isFinite(obj[key])) {
                        delete obj[key];
                    }
                    return;
                }

                if (Array.isArray(obj[key])) {
                    obj[key] = obj[key].map(this.clearFilters(obj[key])).filter(Boolean);
                    if (obj[key].length === 0) {
                        delete obj[key];
                    }
                    return;
                }

                if (type !== 'object') {
                    delete obj[key];
                    return;
                }

                obj[key] = this.clearFilters(obj[key]);
                if (Object.keys(obj[key]).length === 0) {
                    delete obj[key];
                }
            });

            if (Object.keys(obj).length === 0) {
                return null;
            }

            return obj;
        },
        onItemDeleted(data) {
            if (data.list.length === 0 && this.page > 1) {
                this.page--;
            }
        }
    }
};

var PageNotifier = {
    computed: {
        notifier() {
            return this.$refs.page.notifier;
        }
    }
};

var ServerErrorMixin = {
    methods: {
        parseErrorObject(error, list = null)
        {
            if (error instanceof ServerError) {
                const r = error.response;
                switch (r.statusCode) {
                    case 401:
                        return {
                            text: 'You are not logged in',
                            key: null, // TODO
                        };
                    case 403:
                        return {
                            text: 'Permission denied',
                            key: null, // TODO
                        };
                    case 404:
                        return {
                            text: 'Entity no longer exists',
                            key: null, // TODO
                        };
                    case 422:
                        return r.json()
                            .then(json => json.errors ? json.errors[0] : null)
                            .then(error => {
                                // TODO: get key from list
                                return {
                                    text: "Invalid data",
                                    key: null
                                };
                            });

                    case 500:
                        return r.json()
                            .then(json => json.error)
                            .then(error => {
                                return {
                                    text: 'Internal Server Error: {{message}}',
                                    key: null, // TODO: add a key,
                                    params: {
                                        message: error || 'Unexpected Error',
                                    }
                                };
                            });
                }
            }

            return null;
        }
    }
};

var LoginMixin = {
    methods: {
        doLogin(callback) {
            if (this.$refs.page) {
                this.$refs.page.doLogin(callback);
            }
        }
    }
};

var FormMixin = {
    computed: {
        formTranslate()
        {
            return (a, b, c, d) => this.$intl.translate(a, b, c, d);
        },
        formOptions()
        {
            return {
                language: this.$intl.language,
                firstDayOfWeek: this.$intl.firstDayOfWeek || 0,
            }
        }
    },
};

//

var script$f = {
    components: {AppPage},
    mixins: [EntityMixin, CloseDialogsBeforeLeave, PageNotifier, ServerErrorMixin, LoginMixin, FormMixin],
    props: {
        // Page title
        title: {
            type: [String, Object],
            required: true
        },

        // Back button action
        back: {
            type: String,
            default: '../'
        },

        // Errors
        errors: {
            type: Object,
            required: false
        },

        // Custom error handler
        errorHandler: {
            type: Function,
            required: false,
        },

        // Entity name
        entity: {
            type: String,
            required: true
        },

        // Steps
        steps: {
            type: Array,
            required: true
        },

        // Initial model data
        initialModelData: {
            type: [Function, Object],
            required: false
        },

        // Function to pre-process data before saving
        // Or an array of allowed properties
        preProcessModelData: {
            type: [Function, Array],
            required: false
        },

        // Extra data that should be added before saving
        extraModelData: {
            type: Object,
            required: false
        },

        // Custom save handler
        saveHandler: {
            type: Function,
            required: false
        },

        // Method to call on loader
        loaderMethod: {
            type: String,
            default: 'create'
        },

        // Where to redirect after creation
        redirectPath: {
            type: [String, Function],
            default: 'list.html'
        },

        // Stepper settings
        nextButtonText: {
            type: [String, Object],
            required: false
        },

        finishButtonText: {
            type: [String, Object],
            required: false
        },

        fillHeight: {
            type: Boolean,
            default: true
        },

        afterSave: {
            type: Function,
            default: null
        }
    },
    data()
    {
        return {
            parsedSteps: null,
            loading: true,
            loaderError: false,
            model: {},
            processing: false,
        };
    },
    created()
    {
        if (!this.loader) {
            this.loading = false;
            this.loaderError = true;
            return;
        }

        if (this.initialModelData) {
            if (typeof this.initialModelData === 'function') {
                this.model = this.initialModelData(this);
            }
            else {
                this.model = {...this.initialModelData};
            }
        }

        const wrap = (step, prop, copy = true) => {
            if (copy) {
                step = {...step};
            }
            let f = step[prop];
            step[prop] = (model, step, form) => f(model, step, form, this);
            return step;
        };

        const parseType = (info) => {
            info = {
                entity: this.entity,
                field: '_entity_type',
                prop: 'fields',
                typeProp: 'type',
                behaviorProp: 'behavior',
                fallback: [],
                ...info
            };

            return model => {
                return this.entityTypeFields(info.entity, model[info.field], info.prop, info.fallback,
                    info.typeProp, info.behaviorProp);
            };
        };

        this.parsedSteps = this.steps.map(step => {
            if (typeof step.items !== 'function') {
                let copy = true;

                if (step.items && typeof step.items === 'object' && !Array.isArray(step.items)) {
                    copy = false;
                    step = {...step};
                    step.items = parseType(step.items);
                }

                if (typeof step.callback !== 'function') {
                    return step;
                }

                return wrap(step, 'callback', copy);
            }
            else {
                if (typeof step.callback !== 'function') {
                    return wrap(step, 'items');
                }
            }

            step = wrap(step, 'items');
            return wrap(step, 'callback', false);
        });

        this.loading = false;
    },
    computed: {
        loader()
        {
            return this.entityLoader(this.entity);
        }
    },
    methods: {
        onSubmit(originalData)
        {
            this.processing = true;

            let data = this.$clone(originalData);

            if (this.extraModelData) {
                data = {...data, ...this.extraModelData};
            }

            if (this.preProcessModelData) {
                if (Array.isArray(this.preProcessModelData)) {
                    for (let prop in data) {
                        if (!data.hasOwnProperty(prop)) {
                            continue;
                        }
                        if (this.preProcessModelData.indexOf(prop) === -1) {
                            delete data[prop];
                        }
                    }
                }
                else {
                    data = this.preProcessModelData(data, this);
                }
            }

            const promise = this.saveHandler
                ? this.saveHandler(this.loader, data, this.entity)
                : this.loader[this.loaderMethod](data);

            promise
                .then(result => {
                    this.processing = false;

                    if (this.afterSave) {
                        this.afterSave(data, result, this);
                    }

                    let path = this.redirectPath;
                    if (typeof path === 'function') {
                        path = path(result, data);
                    } else {
                        path = path.replace('{id}', result.id);
                    }

                    this.$nextTick(() => this.$router.push(path));
                })
                .catch(error => {
                    if (error.response && error.response.status === 401) {
                        this.doLogin(() => this.onSubmit(originalData));
                        return;
                    }
                    if (this.errorHandler) {
                        let err = this.errorHandler(error, this);
                        if (err != null) {
                            error = err;
                        }
                    } else {
                        error = this.parseErrorObject(error, this.errors);
                    }

                    if (error == null) {
                        error = {
                            text: "Cannot create entity " + this.entity,
                            key: null, // TODO
                        };
                    }

                    if (typeof error.then === 'function') {
                        error.then(error => {
                            this.notifier.showError(this.$intl.translate(error));
                            this.processing = false;
                        });
                    }
                    else {
                        this.notifier.showError(this.$intl.translate(error));
                        this.processing = false;
                    }
                });
        }
    }
};

/* script */
            const __vue_script__$f = script$f;
            
/* template */
var __vue_render__$f = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('app-page',{ref:"page",attrs:{"title":_vm.$intl.translate(_vm.title),"back":_vm.back,"loading":_vm.loading}},[(_vm.loaderError)?_c('div',[_vm._v("\n        Error! There is no such entity "+_vm._s(_vm.entity)+"\n    ")]):_c('stepper-form',{ref:"form",attrs:{"processing":_vm.processing,"steps":_vm.parsedSteps,"next-button-text":_vm.nextButtonText,"finishButtonText":_vm.finishButtonText,"fill-height":_vm.fillHeight,"translate":_vm.formTranslate,"options":_vm.formOptions},on:{"input":function($event){_vm.onSubmit($event);}},model:{value:(_vm.model),callback:function ($$v) {_vm.model=$$v;},expression:"model"}})],1)};
var __vue_staticRenderFns__$f = [];

  /* style */
  const __vue_inject_styles__$f = undefined;
  /* scoped */
  const __vue_scope_id__$f = undefined;
  /* module identifier */
  const __vue_module_identifier__$f = undefined;
  /* functional template */
  const __vue_is_functional_template__$f = false;
  /* component normalizer */
  function __vue_normalize__$f(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "EntityCreateForm.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var EntityCreateForm = __vue_normalize__$f(
    { render: __vue_render__$f, staticRenderFns: __vue_staticRenderFns__$f },
    __vue_inject_styles__$f,
    __vue_script__$f,
    __vue_scope_id__$f,
    __vue_is_functional_template__$f,
    __vue_module_identifier__$f,
    undefined,
    undefined
  );

//

var script$g = {
    components: {AppPage},
    mixins: [EntityMixin, CloseDialogsBeforeLeave, PageNotifier, ServerErrorMixin, LoginMixin, FormMixin],
    props: {
        // Page title
        title: {
            type: [String, Object],
            required: true
        },

        // Back button action
        back: {
            type: String,
            default: '../'
        },

        // Errors
        errors: {
            type: Object,
            required: false
        },

        // Custom error handler
        errorHandler: {
            type: Function,
            required: false,
        },

        // Entity name
        entity: {
            type: String,
            required: true
        },

        // Entity id
        id: {
            type: String,
            required: true
        },

        // Steps
        fields: {
            type: [String, Array, Function],
            default: null
        },

        modelFieldName: {
            type: String,
            default: 'settings'
        },

        // Function to pre-process data before saving
        // Or an array of allowed properties
        preProcessModelData: {
            type: [Function, Array],
            required: false
        },

        // Extra data that should be added before saving
        extraModelData: {
            type: Object,
            required: false
        },

        // Custom save handler
        saveHandler: {
            type: Function,
            required: false
        },

        // Method to call on loader
        loaderMethod: {
            type: String,
            default: 'update'
        },

        // Where to redirect after creation
        redirectPath: {
            type: [String, Function],
            required: false
        },

        submitButtonText: {
            type: [String, Object],
            default: 'Save'
        },

        successMessage: {
            type: [String, Object],
            default: 'Saved'
        },

        fillHeight: {
            type: Boolean,
            default: true
        },

        titleKey: {
            type: [String, Function],
            default: 'title'
        },

        contextActions: {
            type: Array,
            default: null
        },
        contextIcon: {
            type: String,
            default: 'edit'
        },

        afterSave: {
            type: Function,
            default: null
        }
    },
    data()
    {
        return {
            parsedFields: null,
            loading: true,
            loaderError: false,
            model: {},
            processing: false,
            instance: null
        };
    },
    created()
    {
        if (!this.loader) {
            this.loading = false;
            this.loaderError = true;
            return;
        }

        this.onInit();
    },
    computed: {
        loader()
        {
            return this.entityLoader(this.entity);
        },
        instanceTitle()
        {
            if (!this.instance) {
                return '';
            }
            if (typeof this.titleKey === 'function') {
                return this.titleKey(this.instance, this) || '';
            }
            return this.instance[this.titleKey] || '';
        }
    },
    methods: {
        onInit() {
            const initModel = (data, field) => {
                if (field == null) {
                    this.model = data;
                }
                else {
                    this.model = data[field];
                }
            };

            this.loader.get(this.id)
                .then(data => {
                    this.instance = data;
                    initModel(data, this.modelFieldName);
                    const fields = this.parseFormFields(this.fields, data);
                    if (fields instanceof Promise) {
                        fields.then(fields => {
                            this.parsedFields = fields;
                            this.loading = false;
                        });
                    }
                    else {
                        this.parsedFields = fields;
                        this.loading = false;
                    }
                })
                .catch(error => {
                    if (error.response && error.response.status === 401) {
                        this.doLogin(() => this.onInit());
                        return;
                    }
                    this.loaderError = true;
                    this.loading = false;
                });
        },
        contextItemAction(item) {
            if (this.isContextItemDisabled(item)) {
                return false;
            }
            if (item.action && typeof item.action === 'function') {
                return item.action(this, item);
            }
            return false;
        },
        isContextItemDisabled(item) {
            if (!item.hasOwnProperty('disabled')) {
                return false;
            }
            if (typeof item.disabled === 'boolean') {
                return item.disabled;
            }
            if (Array.isArray(item.disabled)) {
                return !this.$user.hasPermission(item.disabled)
            }
            if (typeof item.disabled === "function") {
                return item.disabled(this, item);
            }
            return false;
        },
        parseFormFields(fields, data)
        {
            if (Array.isArray(fields)) {
                return fields;
            }
            if (typeof fields === 'function') {
                return fields(data, this);
            }

            if (!fields) {
                fields = {prop: "fields"};
            }
            else if (typeof fields === "string") {
                fields = {prop: fields};
            }

            fields = {
                prop: 'fields',
                typeProp: 'type',
                behaviorProp: 'behavior',
                ...fields
            };

            let type = null;
            if (fields.behaviorProp == null) {
                type = data[fields.typeProp];
            } else {
                type = {
                    [fields.typeProp]: data[fields.typeProp],
                    [fields.behaviorProp]: data[fields.behaviorProp]
                };
            }

            return this.entityTypeFields(this.entity, type, fields.prop, [], this.typeProp, this.behaviorProp);
        },
        onSubmit(originalData)
        {
            this.processing = true;

            let data = this.$clone(originalData);

            if (this.modelFieldName) {
                data = {[this.modelFieldName]: data};
            }

            if (this.preProcessModelData) {
                if (Array.isArray(this.preProcessModelData)) {
                    for (let prop in data) {
                        if (!data.hasOwnProperty(prop)) {
                            continue;
                        }
                        if (this.preProcessModelData.indexOf(prop) === -1) {
                            delete data[prop];
                        }
                    }
                }
                else {
                    data = this.preProcessModelData(data);
                }
            }

            if (this.extraModelData) {
                data = {...data, ...this.extraModelData};
            }

            const promise = this.saveHandler
                ? this.saveHandler(this.loader, this.id, data, this.entity)
                : this.loader[this.loaderMethod](this.id, data);

            promise
                .then(result => {
                    this.processing = false;

                    if (this.afterSave) {
                        this.afterSave(data, result, this);
                    }

                    let path = this.redirectPath;

                    if (!path) {
                        this.notifier.showSuccess(this.$intl.translate(this.successMessage));
                        return;
                    }

                    if (typeof path === 'function') {
                        path = path(result, data);
                    } else {
                        path = path.replace('{id}', result.id);
                    }

                    this.$nextTick(() => this.$router.push(path));
                })
                .catch(error => {
                    if (error.response && error.response.status === 401) {
                        this.doLogin(() => this.onSubmit(originalData));
                        return;
                    }
                    if (this.errorHandler) {
                        let err = this.errorHandler(error, this);
                        if (err != null) {
                            error = err;
                        }
                    } else {
                        error = this.parseErrorObject(error, this.errors);
                    }

                    if (error == null) {
                        error = {
                            text: "Cannot save entity " + this.entity,
                            key: null, // TODO
                        };
                    }

                    if (typeof error.then === 'function') {
                        error.then(error => {
                            this.notifier.showError(this.$intl.translate(error));
                            this.processing = false;
                        });
                    }
                    else {
                        this.notifier.showError(this.$intl.translate(error));
                        this.processing = false;
                    }
                });
        }
    }
};

/* script */
            const __vue_script__$g = script$g;
            
/* template */
var __vue_render__$g = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('app-page',{ref:"page",attrs:{"title":_vm.$intl.translate(_vm.title),"back":_vm.back,"loading":_vm.loading}},[(_vm.loaderError)?_c('div',[_vm._v("\n        Error! Cannot load "+_vm._s(_vm.entity)+":"+_vm._s(_vm.id)+"\n    ")]):[(_vm.contextActions && _vm.contextActions.length)?_c('template',{slot:"toolbar"},[_c('v-menu',{attrs:{"offset-y":""}},[_c('v-btn',{attrs:{"slot":"activator","icon":""},slot:"activator"},[_c('v-icon',[_vm._v(_vm._s(_vm.$controlIcon(_vm.contextIcon)))])],1),_vm._v(" "),_c('v-list',_vm._l((_vm.contextActions),function(item){return _c('v-list-tile',{key:_vm.$uniqueObjectId(item),attrs:{"disabled":_vm.isContextItemDisabled(item)},on:{"click":function($event){_vm.contextItemAction(item);}}},[_c('v-list-tile-avatar',[_c('v-icon',[_vm._v(_vm._s(_vm.$controlIcon(item.icon || '')))])],1),_vm._v(" "),_c('v-list-tile-content',[_c('v-list-tile-title',[_vm._v("\n                                "+_vm._s(_vm.$intl.translate(item.title))+"\n                            ")])],1),_vm._v(" "),_c('v-list-tile-action')],1)}))],1)],1):_vm._e(),_vm._v(" "),_c('block-form',{ref:"form",attrs:{"fill-height":_vm.fillHeight,"processing":_vm.processing,"title":_vm.instanceTitle,"items":_vm.parsedFields,"submit-button":_vm.submitButtonText,"translate":_vm.formTranslate,"options":_vm.formOptions},on:{"submit":function($event){_vm.onSubmit($event);}},model:{value:(_vm.model),callback:function ($$v) {_vm.model=$$v;},expression:"model"}})]],2)};
var __vue_staticRenderFns__$g = [];

  /* style */
  const __vue_inject_styles__$g = undefined;
  /* scoped */
  const __vue_scope_id__$g = undefined;
  /* module identifier */
  const __vue_module_identifier__$g = undefined;
  /* functional template */
  const __vue_is_functional_template__$g = false;
  /* component normalizer */
  function __vue_normalize__$g(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "EntityEditForm.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var EntityEditForm = __vue_normalize__$g(
    { render: __vue_render__$g, staticRenderFns: __vue_staticRenderFns__$g },
    __vue_inject_styles__$g,
    __vue_script__$g,
    __vue_scope_id__$g,
    __vue_is_functional_template__$g,
    __vue_module_identifier__$g,
    undefined,
    undefined
  );

//

var script$h = {
    name: 'entity-list-template',
    mixins: [EntityMixin],
    props: {
        emptyText: {
            type: [Object, String],
            default: () => ({text: 'No items to display', key: 'ui:common.emptyList'})
        },
        loader: {
            type: [Object, String],
            required: true
        },
        handler: {
            type: Function,
            default: null
        },
        filterArgs: {
            type: Object,
            default: null
        },
        collectionKey: {
            type: String,
            default: 'collection'
        },
        typeCacheKey: {
            type: String,
            default: 'types'
        },
        typeKey: {
            type: String,
            default: 'type',
            required: false
        },
        behaviorKey: {
            type: String,
            default: 'behavior',
            required: false
        },
        dataLoader: {
            type: Function,
            default: null
        }
    },
    data()
    {
        return {
            items: [],
            types: null,
            ready: false
        };
    },
    watch: {
        filterArgs(val)
        {
            this.refreshList(val);
        }
    },
    computed: {
        loaderObject()
        {
            return typeof this.loader === 'string' ? this.entityLoader(this.loader) : this.loader;
        }
    },
    created()
    {
        this.refreshList();
    },
    methods: {
        refreshList(args = this.filterArgs)
        {
            this.$emit('refresh', args);
            this.ready = false;
            this.items = [];
            this.types = null;

            let promise = null;
            if (this.loaderObject.hasTypes()) {
                promise = this.loaderObject.cached(this.typeCacheKey).then(data => {
                    this.types = data;
                    return this.loaderObject.getAll(args);
                });
            }
            else {
                promise = this.dataLoader
                    ? this.dataLoader(this.loaderObject, args)
                    : this.loaderObject.getAll(args);
            }

            promise = promise.then(data => {
                this.$emit('dataloaded', data);
                return {
                    items: data[this.collectionKey] || [],
                    types: this.types,
                    setItems: (result) => {
                        this.items = result;
                        this.ready = true;
                        this.$emit('load', result);
                    }
                };
            });

            promise.catch(error => {
                if (error.response && error.response.status === 401) {
                    this.$emit('mustlogin', () => this.refreshList(args));
                }
            });

            if (this.handler) {
                promise = promise.then(this.handler);
            }
            else {
                promise = promise.then(data => {
                    data.setItems(data.items);
                });
            }
            return promise;
        },
        getItemType(item)
        {
            if (!Array.isArray(this.types)) {
                return null;
            }

            return this.entityTypeFromList(this.types, item[this.typeKey],
                this.behaviorKey ? item[this.behaviorKey] : null, this.typeKey, this.behaviorKey || null);
        }
    }
};

/* script */
            const __vue_script__$h = script$h;
            
/* template */
var __vue_render__$h = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return (_vm.ready && _vm.items.length > 0)?_c('v-flex',{attrs:{"align-center":""}},[_c('v-list',_vm._b({},'v-list',_vm.$attrs,false),[_vm._l((_vm.items),function(item,index){return _vm._t("item",null,{item:item,type:_vm.getItemType(item),index:index,itemList:_vm.items})})],2),_vm._v(" "),_vm._t("default")],2):_c('v-container',{attrs:{"fluid":"","fill-height":""}},[_c('v-layout',{attrs:{"column":"","justify-center":"","align-center":""}},[(!_vm.ready)?_c('v-progress-circular',{attrs:{"indeterminate":"","color":"secondary"}}):[_vm._t("empty",[_vm._v("\n                "+_vm._s(_vm.$intl.translate(this.emptyText))+"\n            ")]),_vm._v(" "),_vm._t("default")]],2)],1)};
var __vue_staticRenderFns__$h = [];

  /* style */
  const __vue_inject_styles__$h = undefined;
  /* scoped */
  const __vue_scope_id__$h = undefined;
  /* module identifier */
  const __vue_module_identifier__$h = undefined;
  /* functional template */
  const __vue_is_functional_template__$h = false;
  /* component normalizer */
  function __vue_normalize__$h(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "EntityListTemplate.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var EntityListTemplate = __vue_normalize__$h(
    { render: __vue_render__$h, staticRenderFns: __vue_staticRenderFns__$h },
    __vue_inject_styles__$h,
    __vue_script__$h,
    __vue_scope_id__$h,
    __vue_is_functional_template__$h,
    __vue_module_identifier__$h,
    undefined,
    undefined
  );

//

var script$i = {
    name: "entity-change-title-dialog",
    props: {
        title: {
            type: [Object, String],
            default: () => ({text: 'Change title', key: 'ui:common.changeTitle'})
        },
        titleLabel: {
            type: [Object, String],
            default: () => ({text: 'Title', key: 'ui:common.titleLabel'})
        },
        loader: {
            type: [String, DataLoader],
            required: true
        },
        item: {
            type: Object,
            required: true
        },
        showDialog: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            processingMode: false,
            itemTitle: null,
            error: null
        };
    },
    watch: {
        showDialog(value) {
            if (value) {
                this.processingMode = false;
                this.error = null;
                this.itemTitle = this.item.title;
            }
        }
    },
    computed: {
        saveDisabled() {
            return this.processingMode || this.itemTitle === this.item.title;
        },
        loaderObject() {
            return typeof this.loader === 'string' ? Loaders.get(this.loader) : this.loader;
        }
    },
    methods: {
        cancelDialog() {
            this.$emit('update:showDialog', false);
        },
        confirmDialog() {
            this.processingMode = true;
            this.loaderObject.update(this.item.id, {title: this.itemTitle}).then(() => {
                this.$emit('update:showDialog', false);
                this.$emit('changed', this.item, this.itemTitle);
            }).catch(error => {
                if (error.response && error.response.status === 401) {
                    this.$emit('mustlogin', () => {
                       this.confirmDialog();
                    });
                    return;
                }
                this.processingMode = false;
                this.error = error.toString();
            });
        },
        onRouteLeave(func)
        {
            if (this.showDialog) {
                if (this.processingMode) {
                    return false;
                }
                this.cancelDialog();
                return false;
            }

            return true;
        }
    }
};

/* script */
            const __vue_script__$i = script$i;
            
/* template */
var __vue_render__$i = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-dialog',_vm._b({attrs:{"persistent":""},model:{value:(_vm.showDialog),callback:function ($$v) {_vm.showDialog=$$v;},expression:"showDialog"}},'v-dialog',_vm.$attrs,false),[_c('v-card',[_c('v-card-title',{staticClass:"headline"},[_vm._v("\n            "+_vm._s(_vm.$intl.translate(_vm.title))+"\n        ")]),_vm._v(" "),(!_vm.processingMode)?_c('v-card-text',[_c('v-text-field',{attrs:{"label":_vm.$intl.translate(_vm.titleLabel),"error-messages":_vm.error === null ? undefined : [_vm.error],"required":""},model:{value:(_vm.itemTitle),callback:function ($$v) {_vm.itemTitle=$$v;},expression:"itemTitle"}})],1):_c('v-card-text',[_c('v-progress-linear',{attrs:{"indeterminate":""}})],1),_vm._v(" "),_c('v-card-actions',{directives:[{name:"show",rawName:"v-show",value:(!_vm.processingMode),expression:"!processingMode"}]},[_c('v-spacer'),_vm._v(" "),_c('v-btn',{attrs:{"color":"secondary","flat":"","disabled":_vm.processingMode},nativeOn:{"click":function($event){return _vm.cancelDialog($event)}}},[_vm._v("\n                "+_vm._s(_vm.$intl.translate({text: 'Cancel', key: 'ui:common.cancel'}))+"\n            ")]),_vm._v(" "),_c('v-btn',{attrs:{"color":"primary","flat":"","disabled":_vm.saveDisabled},nativeOn:{"click":function($event){return _vm.confirmDialog($event)}}},[_vm._v("\n                "+_vm._s(_vm.$intl.translate({text: 'Save', key: 'ui:common.save'}))+"\n            ")])],1)],1)],1)};
var __vue_staticRenderFns__$i = [];

  /* style */
  const __vue_inject_styles__$i = undefined;
  /* scoped */
  const __vue_scope_id__$i = undefined;
  /* module identifier */
  const __vue_module_identifier__$i = undefined;
  /* functional template */
  const __vue_is_functional_template__$i = false;
  /* component normalizer */
  function __vue_normalize__$i(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "EntityChangeTitleDialog.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var EntityChangeTitleDialog = __vue_normalize__$i(
    { render: __vue_render__$i, staticRenderFns: __vue_staticRenderFns__$i },
    __vue_inject_styles__$i,
    __vue_script__$i,
    __vue_scope_id__$i,
    __vue_is_functional_template__$i,
    __vue_module_identifier__$i,
    undefined,
    undefined
  );

//

var script$j = {
    name: "entity-delete-dialog",
    props: {
        title: {
            type: [Object, String],
            default: () => ({text: 'Delete item', key: 'ui:common.deleteItem'})
        },
        message: {
            type: [Object, String],
            default: () => ({
                text: 'Are you sure you want to delete this item?',
                key: 'ui:common.deleteItemMessage'
            })
        },
        loader: {
            type: [String, DataLoader],
            required: true
        },
        item: {
            type: Object,
            required: true
        },
        showDialog: {
            type: Boolean,
            required: true
        }
    },
    data() {
        return {
            deleteMode: false,
            error: null
        };
    },
    watch: {
        showDialog(show) {
            if (show) {
                this.error = null;
                this.deleteMode = false;
            }
        }
    },
    computed: {
        loaderObject() {
            return typeof this.loader === 'string' ? Loaders.get(this.loader) : this.loader;
        }
    },
    methods: {
        cancelDialog() {
            this.$emit('update:showDialog', false);
        },
        confirmDialog() {
            this.deleteMode = true;
            this.error = null;
            this.loaderObject.delete(this.item.id).then(() => {
                this.$emit('update:showDialog', false);
                this.$emit('delete', this.item);
            }).catch(error => {
                if (error.response && error.response.status === 401) {
                    this.$emit('mustlogin', () => {
                        this.confirmDialog();
                    });
                    return;
                }
                this.error = error.toString();
                this.deleteMode = false;
            });
        },
        onRouteLeave(func)
        {
            if (this.showDialog) {
                if (this.processingMode) {
                    return false;
                }
                this.cancelDialog();
                return false;
            }

            return true;
        }
    }
};

/* script */
            const __vue_script__$j = script$j;
            
/* template */
var __vue_render__$j = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-dialog',_vm._b({attrs:{"persistent":""},model:{value:(_vm.showDialog),callback:function ($$v) {_vm.showDialog=$$v;},expression:"showDialog"}},'v-dialog',_vm.$attrs,false),[_c('v-card',[_c('v-card-title',{staticClass:"headline"},[_vm._v(_vm._s(_vm.$intl.translate(_vm.title)))]),_vm._v(" "),(!_vm.deleteMode)?_c('v-card-text',[(_vm.error !== null)?_c('div',{staticClass:"red--text"},[_c('v-icon',{attrs:{"color":"red"}},[_vm._v("warning")]),_vm._v(" "+_vm._s(_vm.error))],1):[_vm._v("\n                "+_vm._s(_vm.$intl.translate(_vm.message))+"\n            ")]],2):_c('v-card-text',[_c('v-progress-linear',{attrs:{"indeterminate":""}})],1),_vm._v(" "),_c('v-card-actions',{directives:[{name:"show",rawName:"v-show",value:(!_vm.deleteMode),expression:"!deleteMode"}]},[_c('v-spacer'),_vm._v(" "),_c('v-btn',{attrs:{"color":"secondary","flat":"","disabled":_vm.deleteMode},nativeOn:{"click":function($event){return _vm.cancelDialog($event)}}},[_vm._v("\n                "+_vm._s(_vm.$intl.translate({text: 'Cancel', key: 'ui:common.cancel'}))+"\n            ")]),_vm._v(" "),_c('v-btn',{attrs:{"color":"red","flat":"","disabled":_vm.deleteMode},nativeOn:{"click":function($event){return _vm.confirmDialog($event)}}},[_vm._v("\n                "+_vm._s(_vm.$intl.translate({text: 'Delete', key: 'ui:common.delete'}))+"\n            ")])],1)],1)],1)};
var __vue_staticRenderFns__$j = [];

  /* style */
  const __vue_inject_styles__$j = undefined;
  /* scoped */
  const __vue_scope_id__$j = undefined;
  /* module identifier */
  const __vue_module_identifier__$j = undefined;
  /* functional template */
  const __vue_is_functional_template__$j = false;
  /* component normalizer */
  function __vue_normalize__$j(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "EntityDeleteDialog.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var EntityDeleteDialog = __vue_normalize__$j(
    { render: __vue_render__$j, staticRenderFns: __vue_staticRenderFns__$j },
    __vue_inject_styles__$j,
    __vue_script__$j,
    __vue_scope_id__$j,
    __vue_is_functional_template__$j,
    __vue_module_identifier__$j,
    undefined,
    undefined
  );

//

var script$k = {
    components: {
        EntityChangeTitleDialog,
        EntityDeleteDialog
    },
    data() {
        return {
            contextMenu: false,
            showTitleDialog: false,
            showDeleteDialog: false,
            item: null,
            x: 0,
            y: 0
        }
    },
    props: {
        showTitle: {
            type: Boolean,
            default: true,
        },
        isTitleDisabled: {
            type: Boolean,
            default: true
        },
        showDelete: {
            type: Boolean,
            default: true,
        },
        isDeleteDisabled: {
            type: Boolean,
            default: true
        },

        loader: {
            type: Object,
            required: true
        }
    },
    methods: {
        show(event, item) {
            this.x = event.x;
            this.y = event.y;
            this.item = item || null;
            this.contextMenu = true;
        },
        onTitleChanged(item, title) {
            this.$emit('titlechanged', item, title);
        },
        onDelete(item) {
           this.$emit('delete', item);
        },
        onRouteLeave(func)
        {
            if (this.showTitle) {
                if (!func(this.$refs.titleDialog)) {
                    return false;
                }
            }

            if (this.showDelete) {
                if (!func(this.$refs.deleteDialog)) {
                    return false;
                }
            }

            this.contextMenu = false;

            return true;
        }
    }
};

/* script */
            const __vue_script__$k = script$k;
            
/* template */
var __vue_render__$k = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('v-menu',{directives:[{name:"show",rawName:"v-show",value:(false),expression:"false"}],attrs:{"position-x":_vm.x,"position-y":_vm.y},model:{value:(_vm.contextMenu),callback:function ($$v) {_vm.contextMenu=$$v;},expression:"contextMenu"}},[(_vm.item !== null)?_c('v-list',[_vm._t("default"),_vm._v(" "),(_vm.showTitle)?[_c('v-list-tile',{attrs:{"disabled":_vm.isTitleDisabled},on:{"click":function($event){$event.stopPropagation();_vm.contextMenu = false; _vm.showTitleDialog = true;}}},[_c('v-list-tile-avatar',[_c('v-icon',[_vm._v("title")])],1),_vm._v(" "),_c('v-list-tile-content',[_c('v-list-tile-title',[_vm._v("\n                        "+_vm._s(_vm.$intl.translate({text: 'Change title', key: 'ui:common.changeTitle'}))+"\n                    ")])],1),_vm._v(" "),_c('v-list-tile-action',[_c('entity-change-title-dialog',{ref:"titleDialog",attrs:{"show-dialog":_vm.showTitleDialog,"item":_vm.item,"loader":_vm.loader,"max-width":"300"},on:{"update:showDialog":function($event){_vm.showTitleDialog=$event;},"changed":_vm.onTitleChanged,"mustlogin":function($event){_vm.$emit('mustlogin', $event);}}})],1)],1)]:_vm._e(),_vm._v(" "),(_vm.showDelete)?[_c('v-divider'),_vm._v(" "),_c('v-list-tile',{attrs:{"disabled":_vm.isDeleteDisabled},on:{"click":function($event){$event.stopPropagation();_vm.contextMenu = false; _vm.showDeleteDialog = true;}}},[_c('v-list-tile-avatar',[_c('v-icon',[_vm._v("delete")])],1),_vm._v(" "),_c('v-list-tile-content',[_c('v-list-tile-title',[_vm._v("\n                        "+_vm._s(_vm.$intl.translate({text: 'Delete', key: 'ui:common.delete'}))+"\n                    ")])],1),_vm._v(" "),_c('v-list-tile-action',[_c('entity-delete-dialog',{ref:"deleteDialog",attrs:{"show-dialog":_vm.showDeleteDialog,"item":_vm.item,"loader":_vm.loader,"max-width":"300"},on:{"update:showDialog":function($event){_vm.showDeleteDialog=$event;},"delete":_vm.onDelete,"mustlogin":function($event){_vm.$emit('mustlogin', $event);}}})],1)],1)]:_vm._e()],2):_vm._e()],1)};
var __vue_staticRenderFns__$k = [];

  /* style */
  const __vue_inject_styles__$k = undefined;
  /* scoped */
  const __vue_scope_id__$k = undefined;
  /* module identifier */
  const __vue_module_identifier__$k = undefined;
  /* functional template */
  const __vue_is_functional_template__$k = false;
  /* component normalizer */
  function __vue_normalize__$k(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "ContextMenu.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var ContextMenu = __vue_normalize__$k(
    { render: __vue_render__$k, staticRenderFns: __vue_staticRenderFns__$k },
    __vue_inject_styles__$k,
    __vue_script__$k,
    __vue_scope_id__$k,
    __vue_is_functional_template__$k,
    __vue_module_identifier__$k,
    undefined,
    undefined
  );

//

var script$l = {
    name: 'entity-list',
    components: {
        ContextMenu,
        EntityDeleteDialog,
        EntityChangeTitleDialog,
        ImageIcon,
        EntityListTemplate
    },
    mixins: [EntityMixin],
    props: {
        loader: {
            type: [Object, String],
            required: true
        },
        handler: {
            type: Function,
            default: null
        },
        deletable: {
            type: [Boolean, String, Array],
            default: false
        },
        editableTitle: {
            type: [Boolean, String, Array],
            default: false
        },
        hasIcon: {
            type: Boolean,
            default: true
        },
        page: {
            type: Number,
            default: 1
        },
        rows: {
            type: Number,
            default: 30
        },
        filterArgs: {
            type: Object,
            default: () => ({})
        },
        squaredIcon: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            currentItem: null,
            currentItemType: null
        }
    },
    methods: {
        showContextMenu(item, type, event) {
            this.currentItem = item;
            this.currentItemType = type;
            this.$refs.contextMenu.show(event, item);
        },
        onTitleChanged(item, title) {
            this.$set(item, 'title', title);
        },
        onDelete(item) {
            const list = this.$refs.list.items;
            const index = list.indexOf(item);
            if (index > -1) {
                list.splice(index, 1);
                this.$emit('itemdeleted', {item, list});
            }
        },
        refreshList(args) {
            const list = this.$refs.list;
            list.refreshList(args === undefined ? list.filterArgs : args);
        },
        onRouteLeave(func)
        {
            if (!func(this.$refs.contextMenu)) {
                return false;
            }

            return func(this.$refs.list);
        }
    },
    computed: {
        searchData() {
            return {...this.filterArgs, page: this.page, rows: this.rows};
        },
        loaderObject() {
            return typeof this.loader === 'string' ? this.entityLoader(this.loader) : this.loader;
        },
        isDeletable() {
            if (typeof this.deletable === 'boolean') {
                return this.deletable;
            }
            return this.$user.hasPermission(this.deletable);
        },
        isTitleEditable() {
            if (typeof this.editableTitle === 'boolean') {
                return this.editableTitle;
            }
            return this.$user.hasPermission(this.editableTitle);
        }
    }
};

/* script */
            const __vue_script__$l = script$l;
            
/* template */
var __vue_render__$l = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('entity-list-template',_vm._b({ref:"list",attrs:{"two-line":"","loader":_vm.loader,"handler":_vm.handler,"filterArgs":_vm.searchData},on:{"refresh":function($event){_vm.$emit('refresh', $event);},"load":function($event){_vm.$emit('load', $event);},"dataloaded":function($event){_vm.$emit('dataloaded', $event);},"mustlogin":function($event){_vm.$emit('mustlogin', $event);}},scopedSlots:_vm._u([{key:"item",fn:function(ref){
var item = ref.item;
var type = ref.type;
var index = ref.index;
return [(index > 0)?_c('v-divider'):_vm._e(),_vm._v(" "),_c('v-list-tile',{key:item.id,on:{"click":function($event){_vm.showContextMenu(item, type, $event);}}},[(_vm.hasIcon)?_c('v-list-tile-avatar',{staticClass:"avatar--tile"},[_vm._t("item-avatar",[(!!item.icon)?_c('image-icon',{attrs:{"squared":_vm.squaredIcon,"src":item.icon}}):_vm._e()],{item:item,type:type,loader:_vm.loaderObject})],2):_vm._e(),_vm._v(" "),_c('v-list-tile-content',[_vm._t("item-text",[_c('v-list-tile-title',[_vm._v(_vm._s(item.title))]),_vm._v(" "),(type !== null)?_c('v-list-tile-sub-title',[_vm._v("\n                        "+_vm._s(type.title)+"\n                        "),_c('small',[_vm._v("("+_vm._s(item.behavior ? item.type + ':' + item.behavior : item.type)+")")])]):_vm._e()],{item:item,type:type,loader:_vm.loaderObject})],2),_vm._v(" "),_c('v-list-tile-action',[_c('v-btn',{attrs:{"icon":"","ripple":""},on:{"click":function($event){_vm.showContextMenu(item, type, $event);}}},[_c('v-icon',[_vm._v("more_vert")])],1)],1)],1)]}}])},'entity-list-template',_vm.$attrs,false),[_c('context-menu',{ref:"contextMenu",attrs:{"loader":_vm.loaderObject,"show-title":_vm.editableTitle !== false,"show-delete":_vm.deletable !== false,"is-title-disabled":!_vm.isTitleEditable,"is-delete-disabled":!_vm.isDeletable},on:{"titlechanged":_vm.onTitleChanged,"delete":_vm.onDelete,"mustlogin":function($event){_vm.$emit('mustlogin', $event);}}},[(_vm.currentItem !== null)?_vm._t("item-actions",null,{item:_vm.currentItem,type:_vm.currentItemType,loader:_vm.loaderObject}):_vm._e()],2),_vm._v(" "),_vm._t("default")],2)};
var __vue_staticRenderFns__$l = [];

  /* style */
  const __vue_inject_styles__$l = undefined;
  /* scoped */
  const __vue_scope_id__$l = undefined;
  /* module identifier */
  const __vue_module_identifier__$l = undefined;
  /* functional template */
  const __vue_is_functional_template__$l = false;
  /* component normalizer */
  function __vue_normalize__$l(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "EntityList.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var EntityList = __vue_normalize__$l(
    { render: __vue_render__$l, staticRenderFns: __vue_staticRenderFns__$l },
    __vue_inject_styles__$l,
    __vue_script__$l,
    __vue_scope_id__$l,
    __vue_is_functional_template__$l,
    __vue_module_identifier__$l,
    undefined,
    undefined
  );

var EntityListLoadMixin = {
    data() {
        return {
            listLoaded: false,
            totalItems: 0,
            lastPage: 0
        }
    },
    methods: {
        onListDataLoaded(data) {
            this.totalItems = data.total;
            this.lastPage = data.rows > 0 ? Math.ceil(data.total / data.rows) : 0;
        },
        onListLoaded() {
            this.listLoaded = true;
        },
        onListRefresh() {
            this.listLoaded = false;
        }
    }
};

//

var script$m = {
    components: {
        EntityList,
        AppPage
    },
    mixins: [EntityListLoadMixin, EntityMixin, PagerMixin, CloseDialogsBeforeLeave, LoginMixin, FormMixin],
    props: {
        entity: {
            type: String,
            required: true
        },
        title: {
            type: [String, Object],
            required: true
        },
        back: {
            type: String,
            default: '../'
        },
        permissions: {
            type: Object,
            require: true
        },
        rows: {
            type: Number,
            default: 30
        },
        addHref: {
            type: String,
            default: 'add.html'
        },
        hasTitle: {
            type: Boolean,
            default: true
        },
        hasIcon: {
            type: Boolean,
            default: true
        },
        hasDelete: {
            type: Boolean,
            default: true
        },
        actions: {
            type: Array,
            default: () => ([])
        },
        idField: {
            type: String,
            default: 'id'
        },

        filterForm: {
            type: Array,
            default: null
        },
        collectionKey: {
            type: String,
            default: 'collection'
        },
        typeCacheKey: {
            type: String,
            default: 'types'
        },
        typeKey: {
            type: String,
            default: 'type',
            required: false
        },
        behaviorKey: {
            type: String,
            default: 'behavior',
            required: false
        },

        iconKey: {
            type: [String, Function],
            required: false,
            default: 'icon'
        },

        customText: {
            type: Object,
            default: null
        },

        visiblePages: {
            type: Number,
            default: 7
        },

        squaredIcon: {
            type: Boolean,
            default: false
        },
        contextIcon: {
            type: String,
            default: 'filter_list'
        },
        afterDelete: {
            type: Function,
            default: null
        },

        refreshButton: {
            type: Boolean,
            default: false
        }
    },
    data()
    {
        return {
            totalLoaded: 0,
            dialog: false,
            dialogModel: {}
        }
    },
    watch: {
        '$route.query'(val)
        {
            if (this.dialog) {
                this.dialog = false;
            }
            if (val.page) {
                this.page = parseInt(val.page) || 1;
            } else if (this.page > 1) {
                this.page = 1;
            }
        }
    },
    computed: {
        pageTitle()
        {
            return this.$intl.translate(this.title,
                {total: this.totalLoaded, page: this.listPage, last: this.lastPage || 1, rows: this.rows}, null,
                this.totalLoaded);
        },
        canAdd()
        {
            return this.checkPermission(this.permissions.add);
        },
        canEdit()
        {
            return this.checkPermission(this.permissions.edit);
        },
        canDelete()
        {
            return this.checkPermission(this.permissions.delete);
        }
    },
    methods: {
        makeDialogModel()
        {
            if (!this.$route || !this.$route.query) {
                this.dialogModel = {};
                return;
            }
            this.dialogModel = this.$clone(this.$route.query);
            delete this.dialogModel.page;
        },
        onListDataLoadedCheck(data)
        {
            this.totalLoaded = data.total || 0;
            this.onListDataLoaded(data);
        },
        onItemDeletedCheck(data)
        {
            if (this.afterDelete) {
                this.afterDelete(data, this);
            }
            this.onItemDeleted(data);
        },
        filterItems(data)
        {
            this.dialog = false;
            this.page = 1;
            this.queryFilters = this.clearFilters(this.$clone(data));
        },
        getCustomTitle(item, type)
        {
            return this.getCustomText(this.customText.title, item, type);
        },
        getCustomDescription(item, type)
        {
            return this.getCustomText(this.customText.description, item, type);
        },
        getCustomText(text, item, type)
        {
            if (!text) {
                return null;
            }
            if (typeof text === 'function') {
                return text(item, type, this);
            }

            return item[text] || null;
        },
        actionHref(action, item, type)
        {
            if (typeof action === 'function') {
                const href = action(item, type, this);
                return typeof href === 'string' ? href : undefined;
            }
            return action.replace('{id}', item[this.idField]);
        },
        actionTitle(action, item, type) {
            if (typeof action === 'function') {
                return action(item, type, this);
            }
            return this.$intl.translate(action, item);
        },
        checkPermission(perm)
        {
            if (typeof perm === 'boolean') {
                return perm;
            }
            return this.$user.hasPermission(perm);
        },
        loadHandler(data)
        {
            if (!this.hasIcon || !this.iconKey) {
                data.setItems(data.items);
                return;
            }

            const isFunc = typeof this.iconKey === 'function';

            if (!data.types) {
                data.items.map(item => {
                    if (isFunc) {
                        item.icon = this.iconKey(item, this);
                    }
                    else {
                        item.icon = item[this.iconKey] || null;
                    }
                });
                data.setItems(data.items);
                return;
            }

            data.items.map(item => {
                const type = this.entityTypeFromList(data.types, item[this.typeKey],
                    this.behaviorKey ? item[this.behaviorKey] : null, this.typeKey, this.behaviorKey || null);

                if (!type) {
                    item.icon = (isFunc ? this.iconKey(item, this) : item[this.iconKey]) || null;
                }
                else {
                    item.icon = (isFunc ? this.iconKey(type, this) : (type[this.iconKey] || type.title));
                }
            });

            data.setItems(data.items);
        },
        onRouteLeave(func)
        {
            if (this.dialog) {
                if (func(this.$refs.filterForm)) {
                    this.dialog = false;
                }
                return false;
            }

            return func(this.$refs.list);
        }
    }
};

/* script */
            const __vue_script__$m = script$m;
            
/* template */
var __vue_render__$m = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('app-page',{ref:"page",attrs:{"title":_vm.pageTitle,"back":_vm.back}},[_c('template',{slot:"toolbar"},[(_vm.refreshButton)?_c('v-btn',{attrs:{"dark":"","icon":""},on:{"click":function($event){$event.stopPropagation();_vm.$refs.list && _vm.$refs.list.refreshList();}}},[_c('v-icon',[_vm._v(_vm._s(_vm.$controlIcon('refresh')))])],1):_vm._e(),_vm._v(" "),(_vm.filterForm && _vm.filterForm.length)?[_c('v-dialog',{attrs:{"lazy":"","max-width":"500"},model:{value:(_vm.dialog),callback:function ($$v) {_vm.dialog=$$v;},expression:"dialog"}},[_c('v-btn',{attrs:{"slot":"activator","dark":"","icon":""},on:{"click":function($event){_vm.makeDialogModel();}},slot:"activator"},[_c('v-icon',[_vm._v(_vm._s(_vm.$controlIcon(_vm.contextIcon)))])],1),_vm._v(" "),_c('block-form',{ref:"filterForm",attrs:{"title":"Filter items","items":_vm.filterForm,"submit-button":"Filter","translate":_vm.formTranslate,"options":_vm.formOptions},on:{"submit":function($event){_vm.filterItems($event);}},model:{value:(_vm.dialogModel),callback:function ($$v) {_vm.dialogModel=$$v;},expression:"dialogModel"}})],1)]:_vm._e()],2),_vm._v(" "),_c('entity-list',{ref:"list",attrs:{"page":_vm.listPage,"loader":_vm.entity,"deletable":_vm.hasDelete && _vm.canDelete,"editable-title":_vm.hasTitle && _vm.canEdit,"has-icon":_vm.hasIcon,"handler":_vm.loadHandler,"filter-args":_vm.filters,"collection-key":_vm.collectionKey,"type-key":_vm.typeKey,"behavior-key":_vm.behaviorKey,"type-cache-key":_vm.typeCacheKey,"rows":_vm.rows,"squared-icon":_vm.squaredIcon},on:{"load":function($event){_vm.onListLoaded();},"refresh":function($event){_vm.onListRefresh();},"dataloaded":function($event){_vm.onListDataLoadedCheck($event);},"itemdeleted":function($event){_vm.onItemDeletedCheck($event);},"mustlogin":function($event){_vm.doLogin($event);}},scopedSlots:_vm._u([{key:"item-text",fn:function(ref){
var item = ref.item;
var type = ref.type;
return _vm.customText != null?[_c('v-list-tile-title',{domProps:{"innerHTML":_vm._s(_vm.getCustomTitle(item, type) || '')}}),_vm._v(" "),_c('v-list-tile-sub-title',{domProps:{"innerHTML":_vm._s(_vm.getCustomDescription(item, type) || '')}})]:undefined}},{key:"item-actions",fn:function(ref){
var item = ref.item;
var type = ref.type;
return _vm.actions.length > 0?_vm._l((_vm.actions),function(action){return _c('v-list-tile',{key:_vm.$uniqueObjectId(action),attrs:{"to":action.callback ? undefined : _vm.actionHref(action.href, item, type),"disabled":!_vm.canEdit || (action.disabled && action.disabled(item, type))},on:{"click":function($event){action.callback && _vm.canEdit && !(action.disabled && action.disabled(item, type)) && action.callback(item, type);}}},[_c('v-list-tile-avatar',[(action.icon)?_c('v-icon',[_vm._v(_vm._s(action.icon))]):_vm._e()],1),_vm._v(" "),_c('v-list-tile-content',[_c('v-list-tile-title',{domProps:{"innerHTML":_vm._s(_vm.actionTitle(action.title, item, type))}})],1),_vm._v(" "),_c('v-list-tile-action')],1)}):undefined}}])}),_vm._v(" "),(_vm.lastPage > 1)?_c('v-layout',{directives:[{name:"show",rawName:"v-show",value:(_vm.listLoaded),expression:"listLoaded"}],staticClass:"white",attrs:{"align-center":"","justify-center":""}},[_c('v-pagination',{attrs:{"circle":"","length":_vm.lastPage,"total-visible":_vm.visiblePages},model:{value:(_vm.page),callback:function ($$v) {_vm.page=$$v;},expression:"page"}})],1):_vm._e(),_vm._v(" "),_c('v-fab-transition',[(_vm.canAdd && _vm.listLoaded)?_c('v-btn',{attrs:{"fixed":"","fab":"","bottom":"","right":"","color":"accent","to":_vm.addHref}},[_c('v-icon',[_vm._v("add")])],1):_vm._e()],1)],2)};
var __vue_staticRenderFns__$m = [];

  /* style */
  const __vue_inject_styles__$m = undefined;
  /* scoped */
  const __vue_scope_id__$m = undefined;
  /* module identifier */
  const __vue_module_identifier__$m = undefined;
  /* functional template */
  const __vue_is_functional_template__$m = false;
  /* component normalizer */
  function __vue_normalize__$m(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "EntityListForm.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var EntityListForm = __vue_normalize__$m(
    { render: __vue_render__$m, staticRenderFns: __vue_staticRenderFns__$m },
    __vue_inject_styles__$m,
    __vue_script__$m,
    __vue_scope_id__$m,
    __vue_is_functional_template__$m,
    __vue_module_identifier__$m,
    undefined,
    undefined
  );

//

const TEXT_COLORS = [
    'black', 'dark', 'light', 'white',
    'primary', 'secondary', 'info', 'success', 'warning', 'danger'
];

const BG_COLORS = [
    'black', 'dark', 'light', 'white',
    'primary', 'secondary', 'info', 'success', 'warning', 'danger'
];

const syntax = {
    highlight(text)
    {
        if (!hljs) {
            return text;
        }
        return hljs.highlightAuto(text).value;
    }
};

const MODES = {
    minimal: {
        syntax: false,
        formula: false,
        toolbar: [
            [{'header': [1, 2, 3, false]}],
            [{'align': []}],
            ['bold', 'italic', 'underline', 'strike'],

            [{'list': 'ordered'}, {'list': 'bullet'}],

            ['blockquote', 'link'],
            ['clean']
        ]
    },
    simple: {
        syntax: false,
        formula: false,
        toolbar: [
            [{'header': [1, 2, 3, 4, 5, 6, false]}],
            [{'align': []}],
            ['bold', 'italic', 'underline', 'strike'],

            [{'list': 'ordered'}, {'list': 'bullet'}],
            [{'indent': '-1'}, {'indent': '+1'}],

            ['blockquote', 'code-block', 'link', 'image', 'video'],
            ['clean']
        ]
    },
    full: {
        syntax: syntax,
        formula: false,
        toolbar: [
            [{'header': [1, 2, 3, 4, 5, 6, false]}],
            [{'align': []}],
            ['bold', 'italic', 'underline', 'strike', {'script': 'sub'}, {'script': 'super'}],

            [{'list': 'ordered'}, {'list': 'bullet'}, {'list': 'check'}],
            [{'indent': '-1'}, {'indent': '+1'}],

            [{'color': TEXT_COLORS.concat([false])}, {'background': BG_COLORS.concat([false])}],

            ['blockquote', 'code-block', 'link', 'image', 'video'],
            ['clean']
        ]
    }
};

// Setup quill
(function (Quill$$1) {

    if (!Quill$$1) {
        return;
    }

    const setup = (cls, props) => {
        cls = Quill$$1.import(cls);
        for (let p in props) {
            if (props.hasOwnProperty(p)) {
                cls[p] = props[p];
            }
        }
        Quill$$1.register(cls, true);
    };

    // Background color
    setup('attributors/class/background', {
        keyName: 'bg',
        whitelist: BG_COLORS
    });

    // Text color
    setup('attributors/class/color', {
        keyName: 'text-color',
        whitelist: TEXT_COLORS
    });

    // Text align
    setup('attributors/class/align', {
        keyName: 'text-align'
    });

    // Strike format
    setup('formats/strike', {
        tagName: ['DEL', 'S']
    });

    // Indent format
    setup('formats/indent', {
        keyName: 'text-indent'
    });

    // Indent format
    setup('formats/list', {
        className: 'indent-list'
    });

    // Indent format
    setup('formats/code-block', {
        className: 'hljs'
    });

})(Quill);


var script$n = {
    name: 'quill-editor',

    props: {
        value: {type: String, required: false, default: ''},
        placeholder: {type: String, default: '', required: false},
        disabled: {type: Boolean, default: false, required: false},
        useCustomImageHandler: {type: Boolean, default: false, required: false},
        editorModules: {type: [Object, String], default: 'full', required: false},
        editorTheme: {type: String, default: 'snow', required: false}
    },

    data()
    {
        return {
            quill: null,
            editor: null
        }
    },

    mounted()
    {
        let modules = MODES.full;
        if (this.editorModules) {
            if (typeof this.editorModules === 'string') {
                modules = MODES.hasOwnProperty(this.editorModules) ? MODES[this.editorModules] : MODES.full;
            }
            else {
                modules = this.editorModules;
            }
        }

        // Quill element
        this.quill = new Quill(this.$refs.quillContainer, {
            modules: modules,
            placeholder: this.placeholder,
            theme: this.editorTheme,
            readOnly: this.disabled,
        });

        // Editor element
        this.editor = this.$refs.quillContainer.querySelector('.ql-editor');

        // Set initial content
        this.editor.innerHTML = this.value || '';

        // Check for custom image handler
        if (this.useCustomImageHandler) {
            let toolbar = this.quill.getModule('toolbar');
            toolbar.addHandler('image', (image, callback) => {
                this.$refs.fileInput.click();
            });
        }

        // Watch text
        this.quill.on('text-change', () => {
            let text = this.editor.innerHTML;
            if (text === '<p><br></p>') {
                text = '';
            }
            this.$emit('input', text);
        });
    },

    watch: {
        value(val)
        {
            if (val !== this.editor.innerHTML && !this.quill.hasFocus()) {
                this.editor.innerHTML = val;
            }
        },
        disabled(status)
        {
            this.quill.enable(!status);
        }
    },

    methods: {
        emitImageInfo($event)
        {
            let file = $event.target.files[0];
            let Editor = this.quill;
            let range = Editor.getSelection();
            let cursorLocation = range.index;
            this.$emit('imageAdded', file, Editor, cursorLocation);
        }
    }
};

/* script */
            const __vue_script__$n = script$n;
/* template */
var __vue_render__$n = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"quillWrapper"},[_c('div',{ref:"quillContainer"}),_vm._v(" "),(_vm.useCustomImageHandler)?_c('input',{ref:"fileInput",staticStyle:{"display":"none"},attrs:{"type":"file"},on:{"change":function($event){_vm.emitImageInfo($event);}}}):_vm._e()])};
var __vue_staticRenderFns__$n = [];

  /* style */
  const __vue_inject_styles__$n = undefined;
  /* scoped */
  const __vue_scope_id__$n = undefined;
  /* module identifier */
  const __vue_module_identifier__$n = undefined;
  /* functional template */
  const __vue_is_functional_template__$n = false;
  /* component normalizer */
  function __vue_normalize__$n(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "QuillEditor.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var QuillEditor = __vue_normalize__$n(
    { render: __vue_render__$n, staticRenderFns: __vue_staticRenderFns__$n },
    __vue_inject_styles__$n,
    __vue_script__$n,
    __vue_scope_id__$n,
    __vue_is_functional_template__$n,
    __vue_module_identifier__$n,
    undefined,
    undefined
  );

//

var script$o = {
    name: 'ace-editor',
    props: {
        value: {type: String, default: '', required: false},
        lang: {type: String, default: 'html', required: false},
        theme: {type: String, default: 'chrome', required: false},
        options: {type: Object, default: () => ({minLines: 5, maxLines: 20}), required: false}
    },
    data()
    {
        return {
            editor: null,
            hasSyntaxError: false,
            check: () => {
                this.hasSyntaxError = this.editor.getSession().getAnnotations().some(annot => {
                    return annot.type === 'error';
                });
            },
            onChange: () => {
                this.$emit('input', this.editor.getValue());
            }
        };
    },
    mounted()
    {
        const editor = this.editor = ace.edit(this.$el);
        editor.$blockScrolling = Infinity;
        editor.getSession().setMode('ace/mode/' + this.lang);
        editor.setTheme('ace/theme/' + this.theme);
        editor.setOptions(this.options);
        editor.setValue(this.value || '', 1);

        editor.on('change', this.onChange);
        editor.on('blur', this.check);
        editor.getSession().on('changeAnnotation', this.check);
    },

    beforeDestroy()
    {
        const editor = this.editor;

        editor.getSession().off('changeAnnotation', this.check);
        editor.off('blur', this.check);
        editor.off('change', this.onChange);

        editor.getSession().destroy();
        editor.destroy();

        const el = this.$el;

        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }

        this.hasSyntaxError = false;
        this.editor = null;
    },

    watch: {
        theme(theme)
        {
            const editor = this.editor;
            editor && editor.setTheme('ace/theme/' + theme);
        },
        value(val)
        {
            const editor = this.editor;
            if (!editor) {
                return;
            }

            const cursor = editor.selection.getCursor();
            editor.setValue(val || '');
            editor.clearSelection();
            editor.gotoLine(cursor.row + 1, cursor.column);
        },
        lang(val)
        {
            const editor = this.editor;
            editor && editor.getSession().setMode('ace/mode/' + val);
        },
        options(val)
        {
            const editor = this.editor;
            editor && editor.setOptions(val);
        },
        hasSyntaxError(value) {
            this.$emit('syntax-error', value);
        }
    }
};

/* script */
            const __vue_script__$o = script$o;
/* template */
var __vue_render__$o = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"ace-editor"})};
var __vue_staticRenderFns__$o = [];

  /* style */
  const __vue_inject_styles__$o = undefined;
  /* scoped */
  const __vue_scope_id__$o = undefined;
  /* module identifier */
  const __vue_module_identifier__$o = undefined;
  /* functional template */
  const __vue_is_functional_template__$o = false;
  /* component normalizer */
  function __vue_normalize__$o(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "AceEditor.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var AceEditor = __vue_normalize__$o(
    { render: __vue_render__$o, staticRenderFns: __vue_staticRenderFns__$o },
    __vue_inject_styles__$o,
    __vue_script__$o,
    __vue_scope_id__$o,
    __vue_is_functional_template__$o,
    __vue_module_identifier__$o,
    undefined,
    undefined
  );

//

var script$p = {
    components: {AceEditor, BlockError, ControlLabel},
    mixins: [JsonFormElementMixin],
    data() {
        return {hasSyntaxError: false};
    },
    created()
    {
        this.addValidation('syntax', () => !this.hasSyntaxError, {
            text: 'Syntax error',
            key: 'ui:validation.code-syntax'
        });
    },
    beforeDestroy()
    {
        this.addValidation('syntax', null);
    }
};

/* script */
            const __vue_script__$p = script$p;
            
/* template */
var __vue_render__$p = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('control-label',{attrs:{"text":_vm.wrapper.translate(_vm.display.title),"has-error":_vm.allErrors.length > 0,"required":_vm.config.required}}),_vm._v(" "),_c('ace-editor',{ref:"editor",attrs:{"options":_vm.config.editor,"lang":_vm.config.lang},on:{"input":function($event){_vm.validate();},"syntax-error":function($event){_vm.hasSyntaxError = $event;}},model:{value:(_vm.model[_vm.name]),callback:function ($$v) {_vm.$set(_vm.model, _vm.name, $$v);},expression:"model[name]"}}),_vm._v(" "),_c('block-error',{attrs:{"error":_vm.allErrors.length > 0 ? _vm.allErrors[0] : undefined}})],1)};
var __vue_staticRenderFns__$p = [];

  /* style */
  const __vue_inject_styles__$p = undefined;
  /* scoped */
  const __vue_scope_id__$p = undefined;
  /* module identifier */
  const __vue_module_identifier__$p = undefined;
  /* functional template */
  const __vue_is_functional_template__$p = false;
  /* component normalizer */
  function __vue_normalize__$p(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "control.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var CodeControl = __vue_normalize__$p(
    { render: __vue_render__$p, staticRenderFns: __vue_staticRenderFns__$p },
    __vue_inject_styles__$p,
    __vue_script__$p,
    __vue_scope_id__$p,
    __vue_is_functional_template__$p,
    __vue_module_identifier__$p,
    undefined,
    undefined
  );

CodeControl.install = function () {
    JsonForm.addControl('code', new StringControlParser(CodeControl));
};

//

var script$q = {
    mixins: [JsonFormElementMixin],
    components: {ControlLabel, QuillEditor, BlockError}
};

/* script */
            const __vue_script__$q = script$q;
            
/* template */
var __vue_render__$q = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('control-label',{attrs:{"text":_vm.wrapper.translate(_vm.display.title),"has-error":_vm.allErrors.length > 0,"required":_vm.config.required}}),_vm._v(" "),_c('quill-editor',{attrs:{"placeholder":_vm.wrapper.translate(_vm.display.placeholder),"editor-modules":_vm.config.mode},model:{value:(_vm.model[_vm.name]),callback:function ($$v) {_vm.$set(_vm.model, _vm.name, $$v);},expression:"model[name]"}}),_vm._v(" "),_c('block-error',{attrs:{"error":_vm.allErrors.length > 0 ? _vm.allErrors[0] : undefined}})],1)};
var __vue_staticRenderFns__$q = [];

  /* style */
  const __vue_inject_styles__$q = undefined;
  /* scoped */
  const __vue_scope_id__$q = undefined;
  /* module identifier */
  const __vue_module_identifier__$q = undefined;
  /* functional template */
  const __vue_is_functional_template__$q = false;
  /* component normalizer */
  function __vue_normalize__$q(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "control.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var RichtextControl = __vue_normalize__$q(
    { render: __vue_render__$q, staticRenderFns: __vue_staticRenderFns__$q },
    __vue_inject_styles__$q,
    __vue_script__$q,
    __vue_scope_id__$q,
    __vue_is_functional_template__$q,
    __vue_module_identifier__$q,
    undefined,
    undefined
  );

RichtextControl.install = function () {
    JsonForm.addControl('richtext', new StringControlParser(RichtextControl));
};

const RouterRenderComponent = {
    render(h) {
        return h('router-view');
    }
};

var AppComponent = {
    props: {
        loaders: {type: Object, required: true},
        user: {type: Object, required: true},
        router: {type: VueRouter, required: true},
        options: {type: Object, default: () => ({})}
    },
    data() {
        return {
            extensions: {},
            vendors: {},
            vendorRoutes: {}
        };
    },
    render(h) {
        return h(AppRoot, {
            props: {
                user: this.user,
                options: this.options
            }
        });
    },
    methods: {
        setOptions(options)
        {
            if (!options || typeof options !== 'object') {
                return;
            }
            for (const p in options) {
                if (options.hasOwnProperty(p)) {
                    this.setOption(p, options[p]);
                }
            }
        },
        setOption(name, value)
        {
            this.$set(this.options, name, value);
            return this;
        },
        deleteOption(name)
        {
            this.$delete(this.options, name);
            return this;
        },
        register(vendor, extensions = [], defaultExtension = null)
        {
            const routes = [];
            if (typeof vendor === 'string') {
                vendor = {name: vendor, title: vendor};
            }

            this.vendors[vendor.name] = vendor;

            const mapped = extensions.map(ext => {
                if (defaultExtension === null) {
                    defaultExtension = ext.name;
                }
                return this._mapExtension(routes, ext, vendor.name);
            });

            if (!this.extensions.hasOwnProperty(vendor.name)) {
                this.extensions[vendor.name] = [];
            }
            this.extensions[vendor.name] = this.extensions[vendor.name].concat(mapped);

            if (routes.length > 0) {
                this.vendorRoutes[vendor.name] = true;
                this.router.addRoutes([this._vendorRoute(vendor.name, defaultExtension, routes)]);
            }

            return this;
        },

        registerExtension(vendor, extension)
        {
            const routes = [];
            const ext = this._mapExtension(routes, extension, vendor);

            if (routes.length > 0 && this.vendorRoutes[vendor]) {
                this.router.addRoutes([this._vendorRoute(vendor, null, routes)]);
            }

            if (!this.extensions.hasOwnProperty(vendor)) {
                this.extensions[vendor] = [];
            }
            this.extensions[vendor].push(ext);

            return ext;
        },

        getAllVendors()
        {
            return this.vendors;
        },

        getVendor(name)
        {
            return this.vendors[name];
        },

        getAllExtensions()
        {
            return this.extensions;
        },

        getAllVendorExtensions(vendor)
        {
            if (!this.extensions.hasOwnProperty(vendor)) {
                return null;
            }
            return this.extensions[vendor];
        },

        getVendorExtension(vendor, name)
        {
            const extensions = this.getAllVendorExtensions(vendor);
            if (!extensions) {
                return null;
            }
            for (let i = 0; i < extensions.length; i++) {
                if (name === extensions[i].name) {
                    return extensions[i];
                }
            }
            return null;
        },

        _mapExtension(routes, ext, vendor)
        {
            if (ext.routes && Array.isArray(ext.routes)) {
                let defaultRoute = ext.defaultRoute || null;
                if (defaultRoute === null) {
                    ext.routes.some(route => {
                        if (typeof route.path === 'string') {
                            defaultRoute = route.path;
                            return true;
                        }
                        return false;
                    });
                }
                routes.push(this._extensionRoute(ext.name, defaultRoute, ext.routes));
            }

            return {
                vendor: vendor,
                name: ext.name || null,
                title: ext.title || null,
                description: ext.description || null,
                icon: ext.icon || null,
                permissions: ext.permissions || [],
                menu: ext.menu || []
            };
        },

        _vendorRoute(vendor, defaultExtension, children = [], options = {})
        {
            children = [
                {
                    path: '',
                    redirect()
                    {
                        return {
                            path: defaultExtension,
                            params: {
                                vendor: vendor,
                                extension: defaultExtension
                            }
                        }
                    }
                }
            ].concat(children);
            return {
                path: '/:vendor(' + vendor + ')',
                alias: '/' + vendor,
                component: RouterRenderComponent,
                children,
                ...options
            };
        },

        _extensionPermissionHook(to, from, next)
        {
            const app = this.getVendorExtension(to.params.vendor, to.params.extension);

            if (app && !this.user.hasPermission(app.permissions)) {
                next(false);
            }
            else {
                next();
            }
        },

        _extensionRoute(extension, url, children = [], options = {})
        {
            children = [
                {
                    path: '',
                    redirect(route)
                    {
                        return {
                            path: url,
                            params: {
                                vendor: route.params.vendor,
                                extension: extension,
                            }
                        }
                    }
                }
            ].concat(children);
            return {
                path: ':extension(' + extension + ')',
                alias: extension,
                component: AppExtensionRoute,
                props: this._extensionProps,
                beforeEnter: this._extensionPermissionHook,
                children,
                ...options
            };
        },

        _extensionProps(route)
        {
            const info = {
                vendor: route.params.vendor || null,
                extension: route.params.extension || null,
                app: this,
                user: this.user
            };
            return {appInfo: info};
        },
    }
};

const Router = new VueRouter();

const App = new Vue({
    router: Router,
    propsData: {
        user: User,
        router: Router,
        loaders: Loaders
    },
    ...AppComponent
});


Router.addRoutes([
    {
        path: '/',
        component: AppDashboard,
        props()
        {
            return {app: App}
        }
    }
]);

function entityCreateRoute(name, props, permissions = [], options = {})
{
    return permissionRoute({
        path: name,
        component: EntityCreateForm,
        props()
        {
            return props;
        },
        ...options
    }, permissions);
}

function entityEditRoute(name, props, permissions = [], idParam = 'entityInstanceId', options = {})
{
    return permissionRoute({
        path: ':' + idParam + '([a-zA-Z0-9-:]{3,32})' + '/' + name,
        component: EntityEditForm,
        props(route)
        {
            return {...props, id: route.params[idParam]};
        },
        ...options
    }, permissions);
}

function entityListRoute(name, props, permissions = [], options = {})
{
    return permissionRoute({
        path: name,
        component: EntityListForm,
        props()
        {
            return props;
        },
        ...options
    }, permissions);
}

class CacheLoader {

  constructor() {
    this._registry = {};
    this._cache = {};
  }

  async load(key) {
    let checked = false;
    let now = Date.now();
    if (this._cache.hasOwnProperty(key)) {
      let cache = this._cache[key];
      if (cache.ttl === 0 || cache.ttl > now) {
        return cache.data;
      }
      checked = true;
    }

    if (!checked && !this._registry.hasOwnProperty(key)) {
      throw new Error('Unknown cache key "' + key + '"');
    }

    let entry = this._registry[key];
    let callback = entry.loader;
    let ttl = entry.ttl === 0 ? 0 : entry.ttl + now;

    let data = await callback();
    this._cache[key] = {data, ttl};
    return data;
  }

  register(key, loader, ttl = 0) {
    ttl = ttl <= 0 ? 0 : ttl * 1000;
    this._registry[key] = {loader, ttl};
  }

  isRegistered(key) {
    return this._registry.hasOwnProperty(key);
  }

  clear(key) {
    delete this._cache[key];
  }

  clearAll() {
    this._cache = {};
  }
}

const Cache = new CacheLoader();

class CachedDataLoader extends DataLoader {
    constructor(url, key, hasTypes = true, loaders = {}, ttl = 300) {
        super(url, hasTypes);
        this._key = key;
        loaders = {
            types: () => this.getTypes(),
            instances: () => this.getAll(),
            ...loaders
        };
        for (const name in loaders) {
            if (!loaders.hasOwnProperty(name) || typeof loaders[name] !== 'function') {
                continue;
            }
            Cache.register(key + '/' + name, loaders[name], ttl);
        }
    }

    create(data)
    {
        return super.create(data).then(r => this._clearCache(r));
    }

    update(id, data)
    {
        return super.update(id, data).then(r => this._clearCache(r));
    }

    delete(id)
    {
        return super.delete(id).then(r => this._clearCache(r));
    }

    cached(what) {
        return Cache.load(this._key + '/' + what);
    }

    _clearCache(data) {
        Cache.clear(this._key + '/instances');
        return data;
    }

    static cacheStorage() {
        return Cache;
    }
}

Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.component(ImageIcon.name, ImageIcon);
Vue.component(LetterAvatar.name, LetterAvatar);
Vue.component(ContentLoader.name, ContentLoader);
Vue.use(Intl);
Vue.use(VuetifyJsonForm);

Vue.component(BlockForm.name, BlockForm);
Vue.component(StepperForm.name, StepperForm);
Vue.component(DialogForms.name, DialogForms);

Vue.use(install$1);
Vue.use(install);

Vue.use(Control);
Vue.use(Control$1);
Vue.use(CodeControl);
Vue.use(RichtextControl);


Vue.prototype.$app = App;
Vue.prototype.$user = User;

export { App, Router, Loaders, permissionHook, permissionRoute, onRouteLeave, entityCreateRoute, entityEditRoute, entityListRoute, AppLayout, AppMenu, AppExtensions, AppUser, AppRoot, AppToolbar, AppPage, AppDashboard, AppNotifier, AppExtensionRoute, EntityChangeTitleDialog, EntityDeleteDialog, QuillEditor, AceEditor, EntityList, EntityListTemplate, EntityListLoadMixin, ContextMenu as EntityListContextMenu, LetterAvatar, ImageIcon, ContentLoader, EntityCreateForm, EntityEditForm, EntityListForm, CodeControl, RichtextControl, Parser as EntityTypeParser, Control as EntityTypeControl, Parser$1 as EntityInstanceParser, Control$1 as EntityInstanceControl, ExtendableError, ServerError, BaseLoader, DataLoader, CacheLoader, CachedDataLoader, Requestor, EntityMixin, CloseDialogsBeforeLeave, PagerMixin, PageNotifier, ServerErrorMixin, LoginMixin, FormMixin, install as DOMPortalDirective, install$1 as DocumentTitleDirective };
