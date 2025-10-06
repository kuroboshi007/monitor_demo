import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import AppShell from '../layouts/AppShell.vue';

// 引入页面组件
import Dashboard from '../pages/Dashboard.vue';
import LicenseManager from '../pages/LicenseManager.vue';
import UserManager from '../pages/UserManager.vue';
import CompanyManager from '../pages/CompanyManager.vue';
import ConstructionManager from '../pages/ConstructionManager.vue';
import ConstructionStatus from '../pages/ConstructionStatus.vue';
import WallView from '../pages/WallView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppShell,
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', component: Dashboard },
      { path: 'license', component: LicenseManager },
      { path: 'users', component: UserManager },
      { path: 'companies', component: CompanyManager },
      { path: 'constructions', component: ConstructionManager },
      { path: 'status', component: ConstructionStatus }
    ]
  },
  // WallView 独立路由，不使用主布局
  { path: '/wall', component: WallView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;