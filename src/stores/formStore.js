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
    const spendValueStatus = ref({ init: false, status: "error" });
    const size = ref("medium");
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
    });

    const issueOptions = ref([].map(
        (v) => ({
            label: v,
            value: v,
        })
    ));
    const tagOptions = ref(["tag1","tag2","tag3"].map(
        (v) => ({
            label: v,
            value: v,
        })
    ));
    const filterOptions = [["負責的議題", "byAssignee"], ["報告的議題", "byReporter"], ["監看的議題", "byWatcher"], ["非議題工時", "nonIssue"]].map(
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

    const addJiraWorklog = () => {
        try {
            //IsIssueOptionsChange.value = true;
            models.value.forEach( async (v) => {
                const res = await axios.post(
                    apiUrl + "/Open/JIRA_Related/Worklogger/AddWorklog",
                    v[1]
                );
    
                // if(res.data.content === null){
                //     dialog.info({ title: "查無相關議題" });
                // }else{
                //     res.data.content.map((v) => ({ label: v, value: v, })).forEach(element => {
                //         issueOptions.value.push(element);
                //     });
                // }
                
    
                console.log(res.data);
                //IsIssueOptionsChange.value = false;
            })
            

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
                    comment: model.value.selectIssueValue === "nonIssue"? "[分類：非議題工時":"[分類：一般議題"+"] [標籤："+model.value.tagValue +"] [工作內容："+ model.value.descriptionValue+"]",                    
                    timeSpentSeconds: model.value.spendValue,
                    "BasicAuth":localStorage.getItem("token"),
                }
                const modelForJiraWorkLogRecord = {
                    descriptionValue: model.value.descriptionValue,
                    selectFilterValue:model.value.selectIssueValue === "nonIssue"? "非議題工時":"一般議題",
                    selectIssueValue: model.value.selectIssueValue,
                    tagValue: model.value.tagValue,
                    startDateValue: model.value.startDateValue,
                    spendDayValue:spendValue.value.spendDayValue,
                    spendHourValue:spendValue.value.spendHourValue,
                    spendMinuteValue:spendValue.value.spendMinuteValue,
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


    watch(() => model.value.selectFilterValue,(newValue, oldValue) => {
        switch (newValue) {
            case "nonIssue":
                JQL.value.JQL = "watcher = " + localStorage.getItem("empID") + " AND summary ~ 非議題";
                getJiraIssues();
                break;
            case "byAssignee":
                JQL.value.JQL = "assignee = " + localStorage.getItem("empID");
                getJiraIssues();
                break;
            case "byReporter":
                JQL.value.JQL = "reporter = " + localStorage.getItem("empID");
                getJiraIssues();
                break;
            case "byWatcher":
                JQL.value.JQL = "watcher = " + localStorage.getItem("empID");
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

    return { formRef, size, model, models, spendValueStatus, spendValue, filterOptions, issueOptions, tagOptions, rules, IsIssueOptionsChange, handleValidateButtonClick, handleClose,addJiraWorklog }
})
