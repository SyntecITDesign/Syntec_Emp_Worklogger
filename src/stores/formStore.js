import { ref, watchEffect, computed, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useApiStore } from "../stores/apiStore.js";
import { useLogInStore } from "../stores/logInStore.js";
import axios from "axios";
import { createDiscreteApi } from "naive-ui";

export const useFormStore = defineStore('formStore', () => {
    const { dialog } = createDiscreteApi(["dialog"]);
    const apiStore = useApiStore();
    const { apiUrl } = apiStore;
    const logInStore = useLogInStore();
    const { access } = storeToRefs(logInStore);

    
    const formRef = ref(null);
    const isIssueOptionsChange = ref(false);
    const isAddingJiraWorklog = ref(false);
    const isDeletingJiraWorklog = ref(false);
    const isTagOptionsChange = ref(false);    
    const spendValueStatus = ref({ init: false, status: "error" });
    const size = ref("medium");
    const today = new Date();

    const model = ref({
        descriptionValue: null,
        selectFilterValue: null,
        selectIssueValue: null,
        tagValue: null,
        startDateValue: today.getFullYear()+ "-" + ((today.getMonth()+1)<10?"0"+(today.getMonth()+1):(today.getMonth()+1))+ "-" + (today.getDate()<10?"0"+today.getDate():today.getDate()),
        startTimeValue: "08:00:00",
        spendValue: computed(() => (spendValue.value.spendHourValue * 60 * 60 + spendValue.value.spendMinuteValue * 60)),
    });

    const deleteModel = ref({
        issueID:null,
        workLogID:null,
        BasicAuth:access.value.basicAuth,
    })

    const models = ref([]);
    const successCount = ref(0);
    const spendValue = ref({
        spendHourValue: 0,
        spendMinuteValue: 0,
        sumSpendSecond: 0,
    });

    const JQL = ref({
        JQL: "",
        BasicAuth:access.value.basicAuth,
    });

    const issueOptions = ref([].map(
        (v) => ({
            label: v,
            value: v,
        })
    ));
    const tagOptions = ref([].map(
        (v) => ({
            label: v,
            value: v,
        })
    ));
    const filterOptions = [["負責的議題", "byAssignee"], ["報告的議題", "byReporter"], ["監看的議題", "byWatcher"], ["管理議題", "managedIssue"], ["非議題", "nonIssue"]].map(
        (v) => ({
            label: v[0],
            value: v[1],
        })
    );

    const rules = {
        descriptionValue: {
            required: true,
            trigger: ["blur", "input"],            
            message: "",
        },
        selectFilterValue: {
            required: true,
            trigger: ["blur", "change"],
            message: "",
        },
        selectIssueValue: {
            required: true,
            trigger: ["blur", "change"],
            message: "",
        },        
        startDateTimeValue: {
            required: true,
            validator(value) {
                return (model.value.startDateValue !== null ) && (model.value.startTimeValue !== null );
            },
            trigger: ["blur", "change"],
            message: "請選擇日期及時間",
        },
        spendValue: {
            type: "number",
            required: true,
            validator(value) {
                return (model.value.spendValue > 0 ) && ((model.value.spendValue + spendValue.value.sumSpendSecond) <= 24*60*60);
            },
            trigger: ["blur", "change"],
            message: "總工作時間至少大於0 且 當日報工總時數不得超過24小時",
        },
        tagValue: {
            required: true,
            trigger: ["blur", "change"],
            message: "",
        },
    };



    const getJiraIssues = async () => {
        //console.log(JQL.value);
        try {
            isIssueOptionsChange.value = true;
            issueOptions.value = [].map((v) => ({ label: v, value: v, }));
            model.value.selectIssueValue = null;            
            const res = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/GetJiraIssues",
                JQL.value
            );

            if(res.data.content === null){
                dialog.info({ title: "查無相關議題" });
            }else{
                res.data.content.map((v) => ({ label: v, value: v, })).forEach(element => {
                    issueOptions.value.push(element);
                });
            }
            
            if(issueOptions.value.length === 1){
                model.value.selectIssueValue = issueOptions.value[0].value;
            }

            //console.log(issueOptions.value);
            isIssueOptionsChange.value = false;

        } catch (err) {
            console.log(err);
        }
    };

    const getProjectTags = async (projectKey,usage) => {
        try {
            isTagOptionsChange.value = true;
            tagOptions.value = [].map((v) => ({ label: v, value: v, }));
            model.value.tagValue = null;
            const res = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/GetProjectTags",
                {
                    projectKey : projectKey,
                }
            );
            //console.log(res.data.content);

            if(res.data.content === null){
                dialog.info({ title: "無相關標籤" });
            }else{
                if(usage ==="forFillForm"){
                    res.data.content.map((v) => ({ label: v.TagName, value: v.TagName, })).forEach(element => {
                        tagOptions.value.push(element);
                    });
                }else{
                    //console.log(res.data.content);
                    return res.data.content;
                }
            //console.log(tagOptions.value);

            }
            isTagOptionsChange.value = false;

        } catch (err) {
            console.log(err);
        }
    };

    const addJiraWorklog = async () => {
        try {
            isAddingJiraWorklog.value = true;
            let isSuccess = true;

            successCount.value = 0;

            for (var i = 0;i<models.value.length;i++) {
                const v = models.value[i];
                //新增Jira Worklog
                const resAddWorklog = await axios.post(
                    apiUrl + "/Open/JIRA_Related/Worklogger/AddWorklog",
                    v[1]
                );
                //console.log(resAddWorklog.data);
                if (Object.prototype.hasOwnProperty.call(resAddWorklog.data.content, 'errorMessages')) {
                    isSuccess = false;
                    break;
                }else{
                    //紀錄Jira回傳的worklog ID
                    v[0].workLogID = resAddWorklog.data.content.id;
                    v[0].created = resAddWorklog.data.content.created.split("+")[0];
                    v[0].started = resAddWorklog.data.content.started.split("+")[0];
                    //console.log(v[0]);
                    
                    //新增報工紀錄到DB同步看板資料
                    const resInsertWorkLogs = await axios.post(
                        apiUrl + "/Open/JIRA_Related/Worklogger/InsertWorkLogs",
                        v[0]
                    );
                    console.log(resInsertWorkLogs.data);
                    
                    //新增或更新報工紀錄的相關議題欄位到DB同步看板資料
                    const resUpsertJiraWorkLogRelatedIssue = await axios.post(
                        apiUrl + "/Open/JIRA_Related/Worklogger/UpsertJiraWorkLogRelatedIssue",
                        {
                            issueID:v[0].issueID,
                            BasicAuth:access.value.basicAuth,
                        }
                    );

                    if(resUpsertJiraWorkLogRelatedIssue.data.code == 0){
                        successCount.value++;
                        if(isSuccess && (successCount.value == models.value.length)){
                            dialog.info({ title: "新增完成" });
                            initData();
                            models.value = [];
                        }
                    }else{
                        isSuccess=false;
                    }
                    console.log(resUpsertJiraWorkLogRelatedIssue.data);
                    console.log(successCount.value,models.value.length);

                }
            };

            if(!isSuccess){
                dialog.error({ title: "新增失敗" });
            }
            isAddingJiraWorklog.value = false;
            
        } catch (err) {
            console.log(err);
        }
    };

    const deleteJiraWorklog = async () => {
        try {
            isDeletingJiraWorklog.value = true;
            const resDeleteWorklog = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/DeleteJiraWorkLog",
                deleteModel.value
            );
            console.log(resDeleteWorklog.data);
            if(resDeleteWorklog.data.code == 0){
                dialog.info({ title: "刪除成功" });                    
            }else{
                dialog.error({ title: "刪除失敗，請再次確認議題編號及WorklogID正確" });
            }
            isDeletingJiraWorklog.value = false;
            
        } catch (err) {
            console.log(err);
        }
    };


    const getSumSpentSeconds = async () => {
        try {            
            const res = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/GetSumSpentSeconds",
                {
                    empID:localStorage.getItem("empID"),
                    started:model.value.startDateValue,
                }
            );
            res.data.content !== null ? spendValue.value.sumSpendSecond = res.data.content[0].sumSpentSeconds: spendValue.value.sumSpendSecond = 0;

            models.value.forEach((item, index, array)=>{
                if(item[0].started.split(" ")[0] === model.value.startDateValue){
                    spendValue.value.sumSpendSecond += item[0].timeSpentSeconds;
                }
            });
            console.log(spendValue.value.sumSpendSecond);

        } catch (err) {
            console.log(err);
        }
    };

    const dateDisabled = (ts) => {
        const date = new Date(ts);
        return date >= new Date();
}

    const handleValidateButtonClick = (e) => {        
        e.preventDefault();
        formRef.value?.validate((errors) => {
            if (!errors) {
                const modelForJiraAddWorkLogApi = {
                    issueID: model.value.selectIssueValue.split(" ")[0],
                    started: model.value.startDateValue+"T"+model.value.startTimeValue+".000+0800",
                    comment: (model.value.selectFilterValue === "nonIssue"? "[分類：非議題":(model.value.selectFilterValue === "managedIssue"? "[分類：管理議題":"[分類：一般議題"))+"] [標籤："+model.value.tagValue +"] [工作內容："+ model.value.descriptionValue.replaceAll("\\","/") +"]",                    
                    timeSpentSeconds: model.value.spendValue,
                    BasicAuth:access.value.basicAuth,
                }
                const modelForJiraWorkLogRecord = {
                    issueID: model.value.selectIssueValue.split(" ")[0],
                    empID: localStorage.getItem("empID"),
                    workLogID: "",
                    timeSpentSeconds: model.value.spendValue,
                    created: "",
                    started: model.value.startDateValue+" "+model.value.startTimeValue,
                    type:(model.value.selectFilterValue === "nonIssue"? "非議題":(model.value.selectFilterValue === "managedIssue"? "管理議題":"一般議題")),
                    tags: model.value.tagValue,
                    comment: model.value.descriptionValue.replaceAll("\\","/"),                    
                    spendHour:spendValue.value.spendHourValue,
                    spendMinute:spendValue.value.spendMinuteValue,
                    BasicAuth:access.value.basicAuth,
                };
                
                models.value.push([modelForJiraWorkLogRecord,modelForJiraAddWorkLogApi]);

                initData();
                console.log(models.value);                
                console.log(spendValue.value);                
                console.log(model.value);
                console.log("ok");
            } else {
                console.log(errors);
                console.log("no");
            }
        });
    };

    const initData = () =>{
            model.value.descriptionValue=null,
            model.value.tagValue=null,
            spendValue.value.spendHourValue = 0,
            spendValue.value.spendMinuteValue = 0,
            spendValue.value.sumSpendSecond = 0,
            spendValueStatus.value.init = false;
    }

    const handleClose = (index) => {
        //console.log(models.value[index]);
        models.value.splice(index, 1);
        console.log(models.value);
    };


    watch(() => model.value.selectFilterValue,(newValue) => {
        //console.log(JQL.value);
        switch (newValue) {
            case "managedIssue":
                JQL.value.JQL = "(reporter = " + localStorage.getItem("empID")+" or assignee = " + localStorage.getItem("empID")+" or creator  = " + localStorage.getItem("empID")+" or watcher = " + localStorage.getItem("empID") + ") AND type = 管理議題 AND status != Closed order by created DESC";
                getJiraIssues();
                break;
            case "nonIssue":
                JQL.value.JQL = "(reporter = " + localStorage.getItem("empID")+" or assignee = " + localStorage.getItem("empID")+" or creator  = " + localStorage.getItem("empID")+" or watcher = " + localStorage.getItem("empID") + ") AND type = 非議題 AND status != Closed order by created DESC";
                getJiraIssues();
                break;
            case "byAssignee":
                JQL.value.JQL = "assignee = " + localStorage.getItem("empID") + " AND type != 非議題 AND type != 管理議題 AND (status != Closed) AND project != R2DEVICE order by created DESC";
                getJiraIssues();
                break;
            case "byReporter":
                JQL.value.JQL = "reporter = " + localStorage.getItem("empID") + " AND type != 非議題 AND type != 管理議題 AND (status != Closed) order by created DESC";
                getJiraIssues();
                break;
            case "byWatcher":
                JQL.value.JQL = "watcher = " + localStorage.getItem("empID") + " AND type != 非議題 AND type != 管理議題 AND (status != Closed) order by created DESC";
                getJiraIssues();
                break;
            case null:
                break;
            default:
                JQL.value.JQL = "key = " + newValue+" AND type != 非議題 AND type != 管理議題";
                
                getJiraIssues();
                break;
        }
    },{deep: true,});

    watch(() => model.value.selectIssueValue,(newValue) => {
        if(newValue!== null) getProjectTags((model.value.selectFilterValue==="nonIssue"?"nonIssue":(model.value.selectFilterValue==="managedIssue"?"managedIssue":model.value.selectIssueValue.split("-")[0])),"forFillForm");
    },{deep: true,});

    watch(() => [model.value.startDateValue,model.value.startTimeValue],([newDateValue,newTimeValue]) => {
        console.log(newDateValue,newTimeValue);        
        if((newDateValue!== null) || (newTimeValue!== null)) getSumSpentSeconds();
    },{deep: true,});

    watchEffect(() => {        
        if ((model.value.spendValue <= 0) && (spendValueStatus.value.init)) {
            spendValueStatus.value.status = "error";
            spendValue.value.spendDayValue = 0;
            spendValue.value.spendHourValue = 0;
            spendValue.value.spendMinuteValue = 0;

        } else {
            spendValueStatus.value.status = "success";
            spendValueStatus.value.init = true;
        }
        console.log(model.value.spendValue/(60*60),spendValue.value.sumSpendSecond/(60*60));
    });

    return { isDeletingJiraWorklog,successCount,formRef, size, model, deleteModel, models, spendValueStatus, spendValue, filterOptions, issueOptions, tagOptions, rules, isIssueOptionsChange, isAddingJiraWorklog, isTagOptionsChange, handleValidateButtonClick, handleClose, addJiraWorklog, getProjectTags,dateDisabled, deleteJiraWorklog}

})
