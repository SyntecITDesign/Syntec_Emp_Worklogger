import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AddWorklogFormView from '../views/AddWorklogForm.vue'
import WorklogDetailsView from '../views/WorklogDetails.vue'
import WorkloadStatisticsView from '../views/WorkloadStatistics.vue'
import IssueSummaryView from '../views/IssueSummary.vue'
import HRInvestmentsView from '../views/HRInvestments.vue'
import DashboardAccessManagementView from '../views/DashboardAccessManagement.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/addWorklogForm',
      name: 'addWorklogForm',
      component: AddWorklogFormView
    },
    {
      path: '/worklogDetails',
      name: 'worklogDetails',
      component: WorklogDetailsView
    },
    {
      path: '/workloadStatistics',
      name: 'workloadStatistics',
      component: WorkloadStatisticsView
    },
    {
      path: '/HRInvestments',
      name: 'HRInvestments',
      component: HRInvestmentsView
    },
    {
      path: '/issueSummary',
      name: 'issueSummary',
      component: IssueSummaryView
    },
    {
      path: '/dashboardAccessManagement',
      name: 'dashboardAccessManagement',
      component: DashboardAccessManagementView
    }
  ]
})

export default router
