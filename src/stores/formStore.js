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
    const isTagOptionsChange = ref(false);    
    const spendValueStatus = ref({ init: false, status: "error" });
    const size = ref("medium");
    
    const model = ref({
        descriptionValue: null,
        selectFilterValue: null,
        selectIssueValue: null,
        tagValue: null,
        startDateValue: null,
        spendValue: computed(() => (spendValue.value.spendHourValue * 60 * 60 + spendValue.value.spendMinuteValue * 60)),
    });
    const models = ref([]);
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
    const filterOptions = [["負責的議題", "byAssignee"], ["報告的議題", "byReporter"], ["監看的議題", "byWatcher"], ["非議題", "nonIssue"]].map(
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
        startDateValue: {
            type: "date",
            required: true,
            trigger: ["blur", "change"],
            message: "",
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
            

            console.log(issueOptions.value);
            isIssueOptionsChange.value = false;

        } catch (err) {
            console.log(err);
        }
    };

    const getProjectTags = async () => {
        try {
            isTagOptionsChange.value = true;
            tagOptions.value = [].map((v) => ({ label: v, value: v, }));
            model.value.tagValue = null;
            const res = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/GetProjectTags",
                {
                    projectKey : model.value.selectFilterValue==="nonIssue"?"nonIssue":model.value.selectIssueValue.split("-")[0],
                }
            );
            console.log(res.data.content);

            if(res.data.content === null){
                dialog.info({ title: "無相關標籤" });
            }else{
                res.data.content.map((v) => ({ label: v.TagName, value: v.TagName, })).forEach(element => {
                    tagOptions.value.push(element);
                });
            }
            console.log(tagOptions.value);
            isTagOptionsChange.value = false;

        } catch (err) {
            console.log(err);
        }
    };

    const addJiraWorklog = async () => {
        try {
            isAddingJiraWorklog.value = true;
            let isSuccess = true;
            for (var i = 0;i<models.value.length;i++) {
                const v = models.value[i];
                //新增Jira Worklog
                const resAddWorklog = await axios.post(
                    apiUrl + "/Open/JIRA_Related/Worklogger/AddWorklog",
                    v[1]
                );
                console.log(resAddWorklog.data);
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
                    console.log(resUpsertJiraWorkLogRelatedIssue.data);
                }
            };

            if(isSuccess){
                dialog.info({ title: "新增完成" });
                initData();
                models.value = [];
            }else{
                dialog.error({ title: "新增失敗" });
            }
            isAddingJiraWorklog.value = false;
            
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
                    started:model.value.startDateValue+" 08:00:00",
                }
            );
            res.data.content !== null ? spendValue.value.sumSpendSecond = res.data.content[0].sumSpentSeconds: spendValue.value.sumSpendSecond = 0;

            models.value.forEach((item, index, array)=>{
                if(item[0].started === model.value.startDateValue){
                    spendValue.value.sumSpendSecond += item[0].timeSpentSeconds;
                }
            });
            console.log(spendValue.value.sumSpendSecond);

        } catch (err) {
            console.log(err);
        }
    };


    const handleValidateButtonClick = (e) => {        
        e.preventDefault();
        formRef.value?.validate((errors) => {
            if (!errors) {
                const modelForJiraAddWorkLogApi = {
                    issueID: model.value.selectIssueValue.split(" ")[0],
                    started: model.value.startDateValue+"T00:00:00.000+0000",
                    comment: (model.value.selectFilterValue === "nonIssue"? "[分類：非議題":"[分類：一般議題")+"] [標籤："+model.value.tagValue +"] [工作內容："+ model.value.descriptionValue+"]",                    
                    timeSpentSeconds: model.value.spendValue,
                    BasicAuth:access.value.basicAuth,
                }
                const modelForJiraWorkLogRecord = {
                    issueID: model.value.selectIssueValue.split(" ")[0],
                    empID: localStorage.getItem("empID"),
                    workLogID: "",
                    timeSpentSeconds: model.value.spendValue,
                    created: "",
                    started: model.value.startDateValue,
                    type:model.value.selectFilterValue === "nonIssue"? "非議題":"一般議題",
                    tags: model.value.tagValue,
                    comment: model.value.descriptionValue,
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
            model.value.selectFilterValue=null,
            model.value.selectIssueValue=null,
            model.value.tagValue=null,
            model.value.startDateValue=null,
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
        switch (newValue) {
            case "nonIssue":
                JQL.value.JQL = "watcher = " + localStorage.getItem("empID") + " AND type = 非議題 AND status != Closed";
                getJiraIssues();
                break;
            case "byAssignee":
                JQL.value.JQL = "assignee = " + localStorage.getItem("empID") + " AND type != 非議題 AND status != Closed";
                getJiraIssues();
                break;
            case "byReporter":
                JQL.value.JQL = "reporter = " + localStorage.getItem("empID") + " AND type != 非議題 AND status != Closed";
                getJiraIssues();
                break;
            case "byWatcher":
                JQL.value.JQL = "watcher = " + localStorage.getItem("empID") + " AND type != 非議題 AND status != Closed";
                getJiraIssues();
                break;
            case null:
                break;
            default:
                JQL.value.JQL = "key = " + newValue+" AND status != Closed";
                //console.log(JQL.value);
                getJiraIssues();
                break;
        }
    },{deep: true,});

    watch(() => model.value.selectIssueValue,(newValue) => {
        if(newValue!== null) getProjectTags();
    },{deep: true,});

    watch(() => model.value.startDateValue,(newValue) => {
        //console.log(newValue);        
        if(newValue!== null) getSumSpentSeconds();
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

    return { formRef, size, model, models, spendValueStatus, spendValue, filterOptions, issueOptions, tagOptions, rules, isIssueOptionsChange, isAddingJiraWorklog, isTagOptionsChange, handleValidateButtonClick, handleClose, addJiraWorklog}
})
