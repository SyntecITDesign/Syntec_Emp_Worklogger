import { ref} from "vue";
import { defineStore, storeToRefs } from 'pinia'
import { useApiStore } from "../stores/apiStore.js";
import { useLogInStore } from "../stores/logInStore.js";
import axios from "axios";

export const useDashboardStroe = defineStore('dashboardStroe', () => {  
    const apiStore = useApiStore();
    const { apiUrl } = apiStore;
    const logInStore = useLogInStore();
    const { access } = storeToRefs(logInStore);
    const isUpdateLatestIssueInfo = ref(false);
    const isGettingSuperDeptOfWorkLogs = ref(false);
    
    const CheckIssueUpdateTime = async () => {
        isUpdateLatestIssueInfo.value = true;
        try {
            const res = await axios.post(
            apiUrl + "/Open/JIRA_Related/Worklogger/CheckIssueUpdateTime",
            { BasicAuth: access.value.basicAuth }
            );
            console.log(res.data);

            isUpdateLatestIssueInfo.value = false;
        } catch (err) {
            console.log(err);
        }
    };

    const GetSuperDeptOfWorkLogs = async () => {
        if(localStorage.getItem("superDeptsView") === null) {
            isGettingSuperDeptOfWorkLogs.value = true;
            try {
                const res = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/GetSuperDeptOfWorkLogs",
                { projectKey: localStorage.getItem("projectKeysView") }
                );
                console.log("GetSuperDeptOfWorkLogs",res.data);
                let superDeptViewSet = new Set();
                res.data.content.forEach((item) => {
                    superDeptViewSet.add(item.SuperDeptName);
                });
                localStorage.setItem("superDeptsView",Array.from(superDeptViewSet).join('\',\''));
                isGettingSuperDeptOfWorkLogs.value = false;
            } catch (err) {
                console.log(err);
            }
        }else{
            isGettingSuperDeptOfWorkLogs.value = true;
            isGettingSuperDeptOfWorkLogs.value = false;
        }
    };

    
    return { CheckIssueUpdateTime, isUpdateLatestIssueInfo, GetSuperDeptOfWorkLogs, isGettingSuperDeptOfWorkLogs}
})
