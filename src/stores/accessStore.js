// 匯入所需的模組和庫
import { defineStore, storeToRefs } from 'pinia'; // 匯入 Pinia 的相關功能
import { ref, onBeforeMount, h } from 'vue'; // 匯入 Vue 3 的相關功能
import { useLogInStore } from '../stores/logInStore.js'; // 匯入自定義的 logInStore 模組
import axios from 'axios'; // 匯入 Axios 庫，用於發送 HTTP 请求
import { useApiStore } from '../stores/apiStore.js'; // 匯入自定義的 apiStore 模組
import { createDiscreteApi, NSelect } from 'naive-ui'; // 匯入 naive-ui 庫的相關功能
import { useFormStore } from '../stores/formStore.js'; // 匯入自定義的 formStore 模組

// 定義名為 useAccessStore 的儲存區（Store）
export const useAccessStore = defineStore('accessStore', () => {
  // 創建 dialog 對象以顯示對話框
  const { dialog } = createDiscreteApi(['dialog']);

  // 使用 useLogInStore 函数取得 logInStore 模組的實例
  const logInStore = useLogInStore();
  // 從 logInStore 中取得相關的狀態和方法
  const { getEmpInfo, viewersTags, newViewers, viewerManagedInfo, projectTagManagedInfo } = storeToRefs(logInStore);

  // 使用 useApiStore 函数取得 apiStore 模組的實例
  const apiStore = useApiStore();
  // 從 apiStore 中取得 apiUrl 和 InsertActionLog 方法
  const { apiUrl, InsertActionLog } = apiStore;

  // 使用 useFormStore 函数取得 formStore 模組的實例
  const formStore = useFormStore();
  // 從 formStore 中取得 getProjectTags 方法
  const { getProjectTags } = formStore;

  // 定義用於標記資料是否正在載入的 ref 變數
  const isEmpListLoading = ref(false);

  // 定義用於標記是否正在儲存設定的 ref 變數
  const isSaving = ref(false);

  // 定義一個用於存儲要刪除的專案標籤的 ref 陣列
  const deleteProjectTags = ref([]);

  // 定義處理搜索的函數，根據輸入的 query 執行搜索操作
  const handleSearch = (query) => {
    if (!query.length) {
      // 如果輸入為空，則顯示提示訊息並返回
      viewersTags.value = [{ label: '請輸入工號查詢', value: 'empty' }];
      return;
    }
    if (query.length < 6 && !isNaN(query)) {
      // 如果輸入少於 6 個字符且為數字，則顯示提示訊息並返回
      viewersTags.value = [{ label: '請輸入工號查詢', value: 'empty' }];
      return;
    }
    isEmpListLoading.value = true; // 標記資料正在載入
    window.setTimeout(() => {
      getEmpInfo('%' + query + '%'); // 發起資料查詢
      isEmpListLoading.value = false; // 標記資料載入完成
    }, 1000); // 設定 1 秒後執行
  };

  // 定義用於新增專案標籤的函數
  const addProjectTag = (infoIndex) => {
    // 在指定的專案資訊中新增一個專案標籤
    projectTagManagedInfo.value[infoIndex][1].push({ No: -1, tag: 'NewTag' + projectTagManagedInfo.value[infoIndex][1].length, group: Array.from(projectTagManagedInfo.value[infoIndex][0])[0] });
  };

  // 定義用於刪除專案標籤的函數
  const deleteProjectTag = (infoIndex, tagIndex) => {
    // 將要刪除的專案標籤添加到 deleteProjectTags 陣列中
    deleteProjectTags.value.push({
      No: projectTagManagedInfo.value[infoIndex][1][tagIndex].No,
    });
    // 從專案標籤陣列中刪除指定的專案標籤
    projectTagManagedInfo.value[infoIndex][1] = projectTagManagedInfo.value[infoIndex][1].filter((value, index) => index !== tagIndex);
    console.log('deleteProjectTag', deleteProjectTags.value);
  };

  // 定義用於保存設定的函數
  const saveSetting = () => {
    isSaving.value = true; // 標記正在儲存設定

    try {
      // 遍歷 newViewers 陣列，對每個項目執行保存操作
      newViewers.value.forEach(async (item) => {
        const resUpdateJiraWorkLoggerAccess = await axios.post(
          apiUrl + '/Open/JIRA_Related/Worklogger/UpdateJiraWorkLoggerAccess',
          item
        );
        console.log('saveViewers', resUpdateJiraWorkLoggerAccess.data);

        // 紀錄增刪改操作Log
        InsertActionLog({
          Action: 'UpdateJiraWorkLoggerAccess',
          ActionContent: JSON.stringify(resUpdateJiraWorkLoggerAccess.data) + JSON.stringify(item),
          Memo: 'Auto',
          EmpID: localStorage.getItem('empID'),
        });
      });

      // 遍歷 deleteProjectTags 陣列，對每個要刪除的專案標籤執行刪除操作
      deleteProjectTags.value.forEach(async (item) => {
        if (item.No > 0) {
          const resDeleteProjectTag = await axios.post(
            apiUrl + '/Open/JIRA_Related/Worklogger/DeleteProjectTag',
            item
          );
          console.log('DeleteProjectTag', resDeleteProjectTag.data);

          // 紀錄增刪改操作Log
          InsertActionLog({
            Action: 'DeleteProjectTag',
            ActionContent: JSON.stringify(resDeleteProjectTag.data) + JSON.stringify(item),
            Memo: 'Auto',
            EmpID: localStorage.getItem('empID'),
          });
        }
      });

      // 遍歷 projectTagManagedInfo 陣列，對每個專案標籤執行新增或更新操作
      projectTagManagedInfo.value.forEach((projectTagInfo, projectInfoIndex) => {
        projectTagInfo[1].forEach(async (item) => {
          const resUpsertProjectTag = await axios.post(
            apiUrl + '/Open/JIRA_Related/Worklogger/UpsertProjectTag',
            {
              No: item.No,
              projectKey: viewerManagedInfo.value[projectInfoIndex][0],
              tagName: item.tag,
              tagGroup: item.group,
            }
          );
          console.log('UpsertProjectTag', resUpsertProjectTag.data);

          // 紀錄增刪改操作Log
          InsertActionLog({
            Action: 'UpsertProjectTag',
            ActionContent: JSON.stringify(resUpsertProjectTag.data) + JSON.stringify({
              No: item.No,
              projectKey: viewerManagedInfo.value[projectInfoIndex][0],
              tagName: item.tag,
              tagGroup: item.group,
            }),
            Memo: 'Auto',
            EmpID: localStorage.getItem('empID'),
          });
        });
      });

      isSaving.value = false; // 標記儲存設定完成
      dialog.info({ title: '完成' }); // 顯示完成訊息對話框

    } catch (err) {
      console.log(err); // 處理錯誤情況
    }
  };

  // 返回需要在頁面中使用的變數和方法
  return { isSaving, isEmpListLoading, handleSearch, saveSetting, addProjectTag, deleteProjectTag };
});
