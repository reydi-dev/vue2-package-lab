import Vue from 'vue'
import VueRouter from 'vue-router'
import OverviewPage from './pages/OverviewPage.vue'
import LocalTablePage from './pages/LocalTablePage.vue'
import ServerTablePage from './pages/ServerTablePage.vue'
import ScenariosPage from './pages/ScenariosPage.vue'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: OverviewPage, meta: { title: 'Overview' } },
    { path: '/local', component: LocalTablePage, meta: { title: 'Local Table' } },
    { path: '/server', component: ServerTablePage, meta: { title: 'Server Table' } },
    { path: '/scenarios', component: ScenariosPage, meta: { title: 'States & Features' } },
    { path: '*', redirect: '/' },
  ],
  scrollBehavior: () => ({ x: 0, y: 0 }),
})
