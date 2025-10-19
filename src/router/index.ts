import { createRouter, createWebHistory } from "vue-router";

const Dashboard = () => import("../pages/Dashboard.vue");
const LicenseManager = () => import("../pages/LicenseManager.vue");
const ConstructionManager = () => import("../pages/ConstructionManager.vue");
const ConstructionStatus = () => import("../pages/ConstructionStatus.vue");
const WallView = () => import("../pages/WallView.vue");
const UserManager = () => import("../pages/UserManager.vue");
const QQUserManager = () => import("../pages/QQUserManager.vue");
const CompanyManager = () => import("../pages/CompanyManager.vue");
const CompanyUserManager = () => import("../pages/CompanyUserManager.vue");

const routes = [
  {
    path: "/dashboard",
    redirect: "/",
  },
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
    meta: { title: "Dashboard" },
  },
  {
    path: "/license",
    name: "LicenseManager",
    component: LicenseManager,
    meta: { title: "License Manager" },
  },
  {
    path: "/construction",
    name: "ConstructionManager",
    component: ConstructionManager,
    meta: { title: "Construction Manager" },
  },
  {
    path: "/construction-status",
    name: "ConstructionStatus",
    component: ConstructionStatus,
    meta: { title: "Construction Status" },
  },
  {
    path: "/users",
    name: "UserManager",
    // We do not specify a component here since /users acts as a parent for
    // nested routes. When a child route is matched, its component will be
    // rendered in the router‑view of the parent layout.
    component: UserManager,
    children: [
      {
        path: "/users",
        // When navigating to /users without a specific child, default to the
        // QQ user manager. This ensures that clicking the parent menu shows
        // meaningful content instead of a blank page.
        redirect: "/users/qq",
      },
    ],
  },
  {
    path: "/users/qq",
    name: "QQUserManager",
    component: QQUserManager,
    meta: { title: "QQ User Manager" },
  },
  {
    path: "/users/company",
    name: "UserCompanyManager",
    // Reuse the existing CompanyManager component for managing companies.
    component: CompanyManager,
    meta: { title: "Company Manager" },
  },
  {
    path: "/users/company-users",
    name: "CompanyUserManager",
    component: CompanyUserManager,
    meta: { title: "Company User Manager" },
  },
  // WallView is retained as a child route under /users for demonstration.
  { path: "/wall", component: WallView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
