import { defineStore, storeToRefs } from 'pinia'
import { ref } from "vue";
import { useLogInStore } from "../stores/logInStore.js";
import axios from "axios";
import { useApiStore } from "../stores/apiStore.js";


export const useAccessStore = defineStore('accessStore', () => {
  const logInStore = useLogInStore();
  const { getEmpInfo } = logInStore;
  const { viewersTags, newViewers} = storeToRefs(logInStore);
  const apiStore = useApiStore();
  const { apiUrl } = apiStore;
  const isEmpListLoading = ref(false);
  const isViewersSaving = ref(false);
  
  
  const handleSearch = (query) => {
    if (!query.length) {
      viewersTags.value = [];
      return;
    }
    if (query.length < 6) {
      viewersTags.value = [];
      return;
    }
    isEmpListLoading.value = true;
    window.setTimeout(() => {
      getEmpInfo(query+"%");
      isEmpListLoading.value = false;
    }, 1e3);
  };

  const saveViewers = () => {
    console.log("saveViewers",newViewers.value);
    isViewersSaving.value = true;
    try {
      newViewers.value.forEach(async (item)=>{
        const resUpdateJiraWorkLoggerAccess = await axios.post(
          apiUrl + "/Open/JIRA_Related/Worklogger/UpdateJiraWorkLoggerAccess",
          item
        );
        console.log(resUpdateJiraWorkLoggerAccess.data);
      });
      isViewersSaving.value = false;
    } catch (err) {
      console.log(err);
    }
  };

  return { isViewersSaving,isEmpListLoading,handleSearch,saveViewers }
})
