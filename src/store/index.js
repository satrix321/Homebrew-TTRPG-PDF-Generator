import Vue from 'vue';
import Vuex from 'vuex';
import editor from './modules/editor';
import document from './modules/document';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    editor,
    document
  },
  strict: true
});
