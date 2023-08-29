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
    const projectTagManagedInfo = ref([]);
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
        console.log("checkLogInTime");
        if(localStorage.getItem("basicAuth")!==null){
            access.value.basicAuth = localStorage.getItem("basicAuth");
        }
        if(localStorage.getItem("empID")!==null){
            access.value.isLogIn = true;
            welcomeText.value = "嗨，" + localStorage.getItem("empID");
            if(!access.value.isCheckedAccess && access.value.isLogIn){
            //console.log("getJiraWorkLoggerAccess",localStorage.getItem("empID"));
                getJiraWorkLoggerAccess(localStorage.getItem("empID"));
            }
        }
        if(access.value.isLogIn&&(new Date().getTime() - localStorage.getItem("loginTime") > 3600000 /*一小時候登出*/ )){
            dialog.info({
                title: "逾時登入",
                content: "已登入逾一小時，是否保持登入？",
                positiveText: "是",
                negativeText: "否",
                maskClosable: false,
                closeOnEsc: false,
                onPositiveClick: () => {
                    localStorage.setItem("loginTime", new Date().getTime());
                },
                onNegativeClick: () => {
                    access.value = {
                        isLogIn:false,
                        isViewer:false,
                        isViewersManager:false,
                        basicAuth:null,
                        isChecking:false,
                    };
                    dialog.info({ title: "逾時請重新登入" });
                    localStorage.clear();
                }
            });
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
                localStorage.setItem("basicAuth", access.value.basicAuth);
                localStorage.setItem("loginTime", new Date().getTime());
                localStorage.setItem("empID", model.value.Username);
                welcomeText.value = "嗨，" + model.value.Username;
                access.value.isLogIn = true;
                dialog.info({ title: "登入成功" });
                
            }
            access.value.isChecking = false;

        } catch (err) {
            console.log(err);
        }
    };

    const getJiraWorkLoggerAccess = async (data) => {
        // 將 access.value.isCheckedAccess 設為 true，表示正在進行存取權限檢查
        access.value.isCheckedAccess = true;
        try {
            // 透過 axios 發送 POST 請求，以獲取管理者的資訊
            const resManagers = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/GetJiraWorkLoggerAccess",
                { Managers: "%" + data + "%", }
            );
            console.log("checkManagers", resManagers.data);
            
            // 判斷是否為查看者的管理者，或者是否有特定的管理者名單，設定對應的存取狀態
            access.value.isViewersManager = (devList.includes(localStorage.getItem("empID"))) || (resManagers.data.code === 0);
            // 預設查看者的管理者必有查看權限
            access.value.isViewer = access.value.isViewersManager;
            
            // 如果成功獲取管理者資訊（code 為 0），處理管理的專案相關資訊
            if (resManagers.data.code === 0) {
                resManagers.data.content.forEach((item) => {
                    // 將目前有被管理的 ProjectKey (ICT、CMTEST...) 添加至 projectKeyManagedSet後續會用到
                    projectKeyManagedSet.value.add(item.ProjectKey);
                });
                
                // 對每個目前有被管理的專案進行處理
                Array.from(projectKeyManagedSet.value).forEach(async (projectKeyManagedSetItem) => {
                    // 透過 POST 請求獲取每個有被管理專案的標籤資訊
                    const resProjectTags = await axios.post(
                        apiUrl + "/Open/JIRA_Related/Worklogger/GetProjectTags",
                        {
                            projectKey : projectKeyManagedSetItem,
                        }
                    );
                    
                    let projectTagGroups = new Set();
                    let projectTags = [];
    
                    // 將每個專案標籤分組添加至 projectTagGroups，並將各個標籤詳細資訊添加至 projectTags
                    resProjectTags.data.content.forEach((projectTagGroup) => {
                        projectTagGroups.add(projectTagGroup.TagGroup);
                        projectTags.push({ No: projectTagGroup.No, tag: projectTagGroup.TagName, group: projectTagGroup.TagGroup });
                    });
    
                    // 根據管理者資訊，建立各專案的查看者清單
                    const viewerTags = resManagers.data.content.map((item) => {
                        // 如果是查看者，將查看者的資訊添加至 viewerTags(查看者清單)
                        if ((item.ProjectKey === projectKeyManagedSetItem) && (!item.Managers.includes(item.EmpID)) && (item.Viewers.includes(item.EmpID))) {
                            return item.EmpID + "_" + item.EmpName;
                        }
                    }).filter((el) => { return el !== undefined; });
    
                    // 將 ProjectKey 和 查看者清單 添加至 viewerManagedInfo (被管理的查看者資訊)
                    viewerManagedInfo.value.push([projectKeyManagedSetItem, viewerTags]);
                    // 將專案標籤分組、標籤詳細資訊以及空陣列添加至 projectTagManagedInfo
                    projectTagManagedInfo.value.push([projectTagGroups, projectTags, []]);
                });
            }
            
            // 透過另一個 POST 請求，以獲取查看者的資訊
            const resViewer = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/GetJiraWorkLoggerAccess",
                { Viewers: "%" + data + "%", }
            );
            console.log("checkViewer", resViewer.data);
            console.log("checkViewer", resViewer.data.content.map((IsViewer) => { return IsViewer.IsViewer }).includes(1));
    
            // 如果不是查看者，判斷是否有查看權限
            if (!access.value.isViewer) {
                access.value.isViewer = (devList.includes(localStorage.getItem("empID"))) || (resViewer.data.content.map((IsViewer) => { return IsViewer.IsViewer }).includes(1));
            }
            console.log("access.value.isViewer", access.value.isViewer);
    
            // 如果成功獲取查看者資訊（code 為 0），處理查看者相關專案存取資訊
            if (resViewer.data.code === 0) {
                let projectKeyViewSet = new Set();
                let projectKeyIsViewerSet = new Set();
                resViewer.data.content.forEach((item) => {
                    // 將專案關鍵字添加至 projectKeyViewSet
                    projectKeyViewSet.add(item.ProjectKey);
                    // 如果 IsViewer 為 1，將專案關鍵字添加至 projectKeyIsViewerSet
                    if (item.IsViewer == 1) projectKeyIsViewerSet.add(item.ProjectKey);
                });
                // 將 projectKeyViewSet 和 projectKeyIsViewerSet 中的專案關鍵字存儲至本地存儲
                localStorage.setItem("projectKeysView", Array.from(projectKeyViewSet).join('\',\''));
                localStorage.setItem("projectKeysIsViewer", Array.from(projectKeyIsViewerSet).join('\',\''));
            }
        } catch (err) {
            console.log(err);
        }
    
        // 如果 viewerManagedInfo 是空陣列，將 access.value.isCheckedAccess 設為 false
        if (Array.from(viewerManagedInfo) === []) {
            access.value.isCheckedAccess = false;
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
        //console.log("watch",newValue);
        newViewers.value = newValue.map((item)=>({
            projectKey: item[0],
            Viewers: item[1].map((i)=>{return i.split("_")[0]}).join(','),
        }));
        //console.log("newViewers",newViewers.value);
    },{deep: true,});

    return { newViewers, viewersTags, welcomeText, access,formRef, model, rules, viewerManagedInfo,projectTagManagedInfo, projectKeyManagedSet, handleValidateButtonClick, checkLogInTime, getJiraWorkLoggerAccess, getEmpInfo}
})
