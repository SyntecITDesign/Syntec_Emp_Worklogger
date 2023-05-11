import { ref,watch,h } from 'vue'
import { defineStore, storeToRefs } from 'pinia';
import { createDiscreteApi,NSelect } from "naive-ui";

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
    const viewersTags = ref([{label:"請輸入工號查詢",value:"empty"}]);
    const newViewers = ref([]);
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
                // getJiraWorkLoggerAccess("checkManager",{
                //     Managers:"%"+model.value.Username+"%",                    
                // });
                
                // getJiraWorkLoggerAccess("checkViewer",{
                //     Viewers:model.value.Username,
                // });
                getJiraWorkLoggerAccess(model.value.Username);
            }
            access.value.isChecking = false;

        } catch (err) {
            console.log(err);
        }
    };

    const getJiraWorkLoggerAccess = async (data) => {
        try {
            const resManagers = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/GetJiraWorkLoggerAccess",
                {Managers:"%"+data+"%",}
            );
            console.log("checkManagers",resManagers.data);
            
            access.value.isViewersManager = (devList.includes(localStorage.getItem("empID")))||(resManagers.data.code === 0);
            access.value.isViewer = access.value.isViewersManager;
            console.log(resManagers.data);
            
            if(resManagers.data.code === 0){
                resManagers.data.content.forEach((item) => {
                    //console.log(item);
                    projectKeyManagedSet.value.add(item.ProjectKey);
                });
                
                //console.log("checkManager",Array.from(projectKeyManagedSet.value));
                Array.from(projectKeyManagedSet.value).forEach(async (projectKeyManagedSetItem,index)=>{
                    const viewerTags = resManagers.data.content.map((item)=>{
                        //console.log(item);
                        if ((item.ProjectKey === projectKeyManagedSetItem) && (!item.Managers.includes(item.EmpID)) && (item.Viewers.includes(item.EmpID))) {
                            return item.EmpID+"_"+item.EmpName;
                        }
                    }).filter((el)=>{return el !== undefined});
                    
                    const resProjectTags = await axios.post(
                        apiUrl + "/Open/JIRA_Related/Worklogger/GetProjectTags",
                        {
                            projectKey : projectKeyManagedSetItem,
                        }
                    );
                    
                    let tagGroups = new Set();
                    let tags = [];

                    resProjectTags.data.content.forEach((tagGroup) => {
                        tagGroups.add(tagGroup.TagGroup);
                        tags.push({tag:tagGroup.TagName,group:tagGroup.TagGroup});
                    });

                    viewerManagedInfo.value.push([projectKeyManagedSetItem,viewerTags,tagGroups,tags,[]]);
                    
                });
                //console.log(viewerManagedInfo.value);

                console.log(viewerManagedInfo.value);
            }
        
            const resViewer = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/GetJiraWorkLoggerAccess",
                {Viewers:data,}
            );
            console.log("checkViewer",resViewer.data);
        
            if(!access.value.isViewer){
                access.value.isViewer = (devList.includes(localStorage.getItem("empID")))||(resViewer.data.code === 0);
            }
            console.log("access.value.isViewer",access.value.isViewer);
            if(resViewer.data.code === 0){
                let superDeptViewSet = new Set();
                let projectKeyViewSet = new Set();
                resViewer.data.content.forEach((item) => {
                    //console.log("checkViewer",item);
                    superDeptViewSet.add(item.SuperDeptName);
                    projectKeyViewSet.add(item.ProjectKey);
                });
                localStorage.setItem("superDeptsView",Array.from(superDeptViewSet).join('\',\''));
                localStorage.setItem("projectKeysView",Array.from(projectKeyViewSet).join('\',\''));

                //console.log(localStorage.getItem("superDeptsView"),localStorage.getItem("projectKeysView"));
            }
            

        } catch (err) {
            console.log(err);
        }
    };

    const getEmpInfo = async (query) => {
        try {
            const res = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/GetEmpInfo",
                { empID:query }
            );
            viewersTags.value = res.data.content.map((item)=>{return item.EmpID+"_"+item.EmpName;}).map(
            (v) => ({
                label: v,
                value: v,
            }));
        } catch (err) {
            console.log(err);
        }
    };

    watch(() =>  viewerManagedInfo.value,(newValue) => {
        console.log("watch",newValue);
        newViewers.value = newValue.map((item)=>({
            projectKey: item[0],
            Viewers: item[1].map((i)=>{return i.split("_")[0]}).join(','),
        }));
        //console.log("newViewers",newViewers.value);
    },{deep: true,});

    return { newViewers, viewersTags, welcomeText, access,formRef, model, rules, viewerManagedInfo, projectKeyManagedSet, handleValidateButtonClick, checkLogInTime, getJiraWorkLoggerAccess, getEmpInfo}
})
