import { ref,watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia';
import { createDiscreteApi } from "naive-ui";

import { useApiStore } from "../stores/apiStore.js";
import axios from "axios";
import { encode } from "js-base64";


export const useLogInStore = defineStore('logInStore', () => {
    const { dialog } = createDiscreteApi(["dialog"]);
    const apiStore = useApiStore();
    const { apiUrl } = apiStore;
    const formRef = ref(null);
    const devList = ["10101707","10190441","10101435"];
    const model = ref({
        Username: null,
        Password: null,
    });
    const access = ref({
        isLogIn:false,
        isViewer:false,
        isViewersManager:false,
        basicAuth:null,
        isChecking:false,
    });
    const viewerManagedInfo = ref([]);
    const projectKeyManagedSet = ref(new Set());

    const welcomeText = ref("");    
    const rules = {
        Username: [
            {
                required: true,
                trigger: ["blur", "change"],
                message: "請輸入帳號",
            },
        ],
        Password: [
            {
                required: true,
                trigger: ["blur", "change"],
                message: "請輸入密碼",
            },
        ],
    };

    const handleValidateButtonClick = (e) => {
        e.preventDefault();
        formRef.value?.validate((errors) => {
            if (!errors) {
                jiraLogin();
            } else {
                console.log("未輸入帳號密碼");
            }
        });
    };

    const checkLogInTime = () => {
        if((access.value.isLogIn)&&(access.value.basicAuth === null || new Date().getTime() - localStorage.getItem("loginTime") > 3600000 /*一小時候登出*/ )){
            access.value = {
                isLogIn:false,
                isViewer:false,
                isViewersManager:false,
                basicAuth:null,
                isChecking:false,
            };
            dialog.info({ title: "逾時請重新登入" });
        }
    };
    
    const jiraLogin = async () => {
        try {
            access.value.isChecking = true;
            const res = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/JiraLogIn",
                model.value
            );
            //console.log(res.data.content);

            if (Object.prototype.hasOwnProperty.call(res.data.content, 'errorMessages')) {
                model.value.Username = '';
                model.value.Password = '';
                dialog.error({ title: "登入失敗" });
            } else {
                access.value.basicAuth = encode(model.value.Username + ":" + model.value.Password);
                localStorage.setItem("loginTime", new Date().getTime());
                localStorage.setItem("empID", model.value.Username);
                welcomeText.value = "Hi," + model.value.Username;
                access.value.isLogIn = true;
                dialog.info({ title: "登入成功" });
                getJiraWorkLoggerAccess("checkViewer",{
                    Viewers:model.value.Username,                    
                });
                getJiraWorkLoggerAccess("checkManager",{
                    Managers:"%"+model.value.Username+"%",                    
                });
            }
            access.value.isChecking = false;

        } catch (err) {
            console.log(err);
        }
    };

    const getJiraWorkLoggerAccess = async (usage,data) => {
        try {
            const res = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/GetJiraWorkLoggerAccess",
                data
            );
            //console.log(res.data);
            if(usage === "checkViewer"){
                access.value.isViewer = (devList.includes(localStorage.getItem("empID")))||(res.data.code === 0);
                if(res.data.code === 0){
                    let superDeptViewSet = new Set();
                    let projectKeyViewSet = new Set();
                    res.data.content.forEach((item) => {
                        //console.log("checkViewer",item);
                        superDeptViewSet.add(item.SuperDeptName);
                        projectKeyViewSet.add(item.ProjectKey);
                    });
                    localStorage.setItem("superDeptsView",Array.from(superDeptViewSet).join('\',\''));
                    localStorage.setItem("projectKeysView",Array.from(projectKeyViewSet).join('\',\''));

                    //console.log(localStorage.getItem("superDeptsView"),localStorage.getItem("projectKeysView"));
                }
            }
            if(usage === "checkManager"){
                access.value.isViewersManager = (devList.includes(localStorage.getItem("empID")))||(res.data.code === 0);
                
                if(res.data.code === 0){
                    res.data.content.forEach((item) => {
                        //console.log(item);
                        projectKeyManagedSet.value.add(item.ProjectKey);
                    });
                    // viewerManagedInfo.value = res.data.content;
                    
                    //console.log("checkManager",Array.from(projectKeyManagedSet.value));
                    Array.from(projectKeyManagedSet.value).forEach((projectKeyManagedSetItem)=>{
                        const viewerTags = res.data.content.map((item)=>{
                            if (item.ProjectKey === projectKeyManagedSetItem) {
                            return item.EmpID+"_"+item.EmpName;
                            }
                        }).filter((el)=>{return el !== undefined});
                        viewerManagedInfo.value.push([projectKeyManagedSetItem,viewerTags]);
                    });
                    //console.log(viewerManagedInfo.value);
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    const getEmpInfo = (empIDs) => {
        try {
            let empNames = [];
            empIDs.forEach(async (item) => {
                const res = await axios.post(
                    apiUrl + "/Open/JIRA_Related/Worklogger/GetEmpInfo",
                    {empID:item}
                );
                //console.log([item,res.data.content[0].EmpName]);
                empNames.push(item+" "+res.data.content[0].EmpName);
            });
            console.log(empNames);

            return empNames
        } catch (err) {
            console.log(err);
        }
    };

    watch(() =>  viewerManagedInfo.value,(newValue) => {
        console.log("watch",newValue);
    },{deep: true,});

    return { welcomeText, access,formRef, model, rules, viewerManagedInfo, projectKeyManagedSet, handleValidateButtonClick, checkLogInTime, getJiraWorkLoggerAccess, getEmpInfo}
})
