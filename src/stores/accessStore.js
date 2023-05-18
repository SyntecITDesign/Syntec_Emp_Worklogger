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
  const { viewersTags, newViewers, viewerManagedInfo,projectTagManagedInfo} = storeToRefs(logInStore);
  const apiStore = useApiStore();
  const { apiUrl,InsertActionLog } = apiStore;
  const formStore = useFormStore();
  const { getProjectTags } = formStore;
  const isEmpListLoading = ref(false);
  const isSaving = ref(false);
  const deleteProjectTags = ref([]);
  
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
    projectTagManagedInfo.value[infoIndex][1].push({No:-1,tag:"NewTag"+projectTagManagedInfo.value[infoIndex][1].length,group:Array.from(projectTagManagedInfo.value[infoIndex][0])[0]});
  };
  const deleteProjectTag = (infoIndex,tagIndex) => {
    deleteProjectTags.value.push({
      No: projectTagManagedInfo.value[infoIndex][1][tagIndex].No,
    });
    projectTagManagedInfo.value[infoIndex][1] = projectTagManagedInfo.value[infoIndex][1].filter((value, index) => index !== tagIndex);
    console.log("deleteProjectTag",deleteProjectTags.value);
  };


  const saveSetting = () => {
    
    isSaving.value = true;
    try {
      newViewers.value.forEach(async (item)=>{        
        const resUpdateJiraWorkLoggerAccess = await axios.post(
          apiUrl + "/Open/JIRA_Related/Worklogger/UpdateJiraWorkLoggerAccess",
          item
        );
        console.log("saveViewers",resUpdateJiraWorkLoggerAccess.data);
        InsertActionLog({
          Action:"UpdateJiraWorkLoggerAccess",
          ActionContent:JSON.stringify(resUpdateJiraWorkLoggerAccess.data)+JSON.stringify(item),
          Memo:"Auto",
          EmpID:localStorage.getItem("empID")
        });
      });

      deleteProjectTags.value.forEach(async (item)=>{
        if(item.No >0){
          const resDeleteProjectTag = await axios.post(
            apiUrl + "/Open/JIRA_Related/Worklogger/DeleteProjectTag",
            item
          );
          console.log("DeleteProjectTag",resDeleteProjectTag.data);
          InsertActionLog({
            Action:"DeleteProjectTag",
            ActionContent:JSON.stringify(resDeleteProjectTag.data)+JSON.stringify(item),
            Memo:"Auto",
            EmpID:localStorage.getItem("empID")
          })
        }
      });

      projectTagManagedInfo.value.forEach((projectTagInfo,projectInfoIndex)=>{
        projectTagInfo[1].forEach(async (item)=>{
          const resUpsertProjectTag = await axios.post(
            apiUrl + "/Open/JIRA_Related/Worklogger/UpsertProjectTag",
            {
              No:item.No,
              projectKey:viewerManagedInfo.value[projectInfoIndex][0],
              tagName:item.tag,
              tagGroup:item.group
            }
          );
          console.log("UpsertProjectTag",resUpsertProjectTag.data);
          InsertActionLog({
            Action:"UpsertProjectTag",
            ActionContent:JSON.stringify(resUpsertProjectTag.data)+JSON.stringify({
              No:item.No,
              projectKey:viewerManagedInfo.value[projectInfoIndex][0],
              tagName:item.tag,
              tagGroup:item.group
            }),
            Memo:"Auto",
            EmpID:localStorage.getItem("empID")
          });
        });
      });
      isSaving.value = false;
      dialog.info({ title: "完成" });

    } catch (err) {
      console.log(err);
    }
  };

  return { isSaving,isEmpListLoading,handleSearch,saveSetting,addProjectTag, deleteProjectTag}
})
