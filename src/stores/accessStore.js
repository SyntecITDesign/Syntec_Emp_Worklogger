import { defineStore, storeToRefs } from 'pinia'
import { ref,onBeforeMount,h } from "vue";
import { useLogInStore } from "../stores/logInStore.js";
import axios from "axios";
import { useApiStore } from "../stores/apiStore.js";
import { createDiscreteApi, NSelect } from "naive-ui";
import { useFormStore } from "../stores/formStore.js";


export const useAccessStore = defineStore('accessStore', () => {
  const { dialog } = createDiscreteApi(["dialog"]);
  const logInStore = useLogInStore();
  const { getEmpInfo } = logInStore;
  const { viewersTags, newViewers, viewerManagedInfo} = storeToRefs(logInStore);
  const apiStore = useApiStore();
  const { apiUrl } = apiStore;
  const formStore = useFormStore();
  const { getProjectTags } = formStore;
  const isEmpListLoading = ref(false);
  const isViewersSaving = ref(false);
  
  const handleSearch = (query) => {
    if (!query.length) {
      viewersTags.value = [{label:"請輸入工號查詢",value:"empty"}];
      return;
    }
    if ((query.length < 6) && !isNaN(query)) {
      viewersTags.value = [{label:"請輸入工號查詢",value:"empty"}];
      return;
    }
    isEmpListLoading.value = true;
    window.setTimeout(() => {
      getEmpInfo("%"+query+"%");
      isEmpListLoading.value = false;
    }, 1e3);
  };

  const addProjectTag = (infoIndex) => {
    viewerManagedInfo.value[infoIndex][3].push({tag:"NewTag"+viewerManagedInfo.value[infoIndex][3].length,group:Array.from(viewerManagedInfo.value[infoIndex][2])[0]});
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
      dialog.info({ title: "完成" });

    } catch (err) {
      console.log(err);
    }
  };

  return { isViewersSaving,isEmpListLoading,handleSearch,saveViewers,addProjectTag}
})
