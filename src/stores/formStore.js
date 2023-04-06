import { ref, watchEffect, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useApiStore } from "../stores/apiStore.js";
import axios from "axios";
import { createDiscreteApi } from "naive-ui";

export const useFormStore = defineStore('formStore', () => {
    const { dialog } = createDiscreteApi(["dialog"]);
    const apiStore = useApiStore();
    const { apiUrl } = apiStore;
    const formRef = ref(null);
    const IsIssueOptionsChange = ref(false);
    const IsTagOptionsChange = ref(false);    
    const spendValueStatus = ref({ init: false, status: "error" });
    const size = ref("medium");
    const modelInit = {
        descriptionValue: null,
        selectFilterValue: null,
        selectIssueValue: null,
        tagValue: null,
        startDateValue: null,
        spendValue: computed(() => (spendValue.value.spendDayValue * 24 * 60 * 60 + spendValue.value.spendHourValue * 60 * 60 + spendValue.value.spendMinuteValue * 60)),
    }
    const spendValueInit = {
        spendDayValue: 0,
        spendHourValue: 0,
        spendMinuteValue: 0,
    }
    const model = ref({
        descriptionValue: null,
        selectFilterValue: null,
        selectIssueValue: null,
        tagValue: null,
        startDateValue: null,
        spendValue: computed(() => (spendValue.value.spendDayValue * 24 * 60 * 60 + spendValue.value.spendHourValue * 60 * 60 + spendValue.value.spendMinuteValue * 60)),
    });
    const models = ref([]);
    const spendValue = ref({
        spendDayValue: 0,
        spendHourValue: 0,
        spendMinuteValue: 0,
    });

    const JQL = ref({
        JQL: "",
        BasicAuth:localStorage.getItem("token"),
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
                return model.value.spendValue > 0;
            },
            trigger: ["blur", "change"],
            message: "總工作時間至少大於0",
        },
        tagValue: {
            required: true,
            trigger: ["blur", "change"],
            message: "",
        },
    };



    const getJiraIssues = async () => {
        try {
            IsIssueOptionsChange.value = true;
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
            IsIssueOptionsChange.value = false;

        } catch (err) {
            console.log(err);
        }
    };

    const getProjectTags = async () => {
        try {
            IsTagOptionsChange.value = true;
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
            IsTagOptionsChange.value = false;

        } catch (err) {
            console.log(err);
        }
    };

    const addJiraWorklog = () => {
        try {            
            models.value.forEach( async (v) => {
                //新增Jira Worklog
                const resAddWorklog = await axios.post(
                    apiUrl + "/Open/JIRA_Related/Worklogger/AddWorklog",
                    v[1]
                );
                console.log(resAddWorklog.data);
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
                        BasicAuth:localStorage.getItem("token"),
                    }
                );
                console.log(resUpsertJiraWorkLogRelatedIssue.data);
            });
            
            model.value = modelInit;
            models.value = [];
            spendValue.value = spendValueInit;
            spendValueStatus.value.init = false;
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
                    comment: model.value.selectIssueValue === "nonIssue"? "[分類：非議題":"[分類：一般議題"+"] [標籤："+model.value.tagValue +"] [工作內容："+ model.value.descriptionValue+"]",                    
                    timeSpentSeconds: model.value.spendValue,
                    BasicAuth:localStorage.getItem("token"),
                }
                const modelForJiraWorkLogRecord = {
                    issueID: model.value.selectIssueValue.split(" ")[0],
                    empID: localStorage.getItem("empID"),
                    workLogID: "",
                    timeSpentSeconds: model.value.spendValue,
                    created: "",
                    started: model.value.startDateValue,
                    type:model.value.selectIssueValue === "nonIssue"? "非議題":"一般議題",
                    tags: model.value.tagValue,
                    comment: model.value.descriptionValue,
                    spendDay:spendValue.value.spendDayValue,
                    spendHour:spendValue.value.spendHourValue,
                    spendMinute:spendValue.value.spendMinuteValue,
                    BasicAuth:localStorage.getItem("token"),
                };
                models.value.push([modelForJiraWorkLogRecord,modelForJiraAddWorkLogApi]);
                console.log(models.value);
                console.log("ok");

            } else {
                console.log(errors);
                console.log("no");
            }
        });
    };

    const handleClose = (index) => {
        //console.log(models.value[index]);
        models.value.splice(index, 1);
        console.log(models.value);
    };


    watch(() => model.value.selectFilterValue,(newValue) => {
        switch (newValue) {
            case "nonIssue":
                JQL.value.JQL = "watcher = " + localStorage.getItem("empID") + " AND summary ~ 非議題 AND status != Closed";
                getJiraIssues();
                break;
            case "byAssignee":
                JQL.value.JQL = "assignee = " + localStorage.getItem("empID") + " AND status != Closed";
                getJiraIssues();
                break;
            case "byReporter":
                JQL.value.JQL = "reporter = " + localStorage.getItem("empID") + " AND status != Closed";
                getJiraIssues();
                break;
            case "byWatcher":
                JQL.value.JQL = "watcher = " + localStorage.getItem("empID") + " AND summary !~ 非議題 AND status != Closed";
                getJiraIssues();
                break;
            case null:
                break;
            default:
                JQL.value.JQL = "key = " + newValue;
                //console.log(JQL.value);
                getJiraIssues();
                break;
        }
    },{deep: true,});

    watch(() => model.value.selectIssueValue,(newValue) => {
        if(newValue!== null) getProjectTags();
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
    });

    return { formRef, size, model, models, spendValueStatus, spendValue, filterOptions, issueOptions, tagOptions, rules, IsIssueOptionsChange, IsTagOptionsChange, handleValidateButtonClick, handleClose,addJiraWorklog}
})
