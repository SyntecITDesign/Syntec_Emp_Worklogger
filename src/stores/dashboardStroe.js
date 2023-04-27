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
    return { CheckIssueUpdateTime, isUpdateLatestIssueInfo}
})
