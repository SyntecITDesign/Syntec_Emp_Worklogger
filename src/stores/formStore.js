import { ref, watchEffect, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApiStore } from "../stores/apiStore.js";
import axios from "axios";

export const useFormStore = defineStore('formStore', () => {
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
        startDateValue: null,
        spendValue: computed(() => (spendValue.value.spendDayValue * 24 * 60 * 60 + spendValue.value.spendHourValue * 60 * 60 + spendValue.value.spendMinuteValue * 60)),
        tags: ["需求討論"],
    });

    const spendValue = ref({
        spendDayValue: null,
        spendHourValue: null,
        spendMinuteValue: null,
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
            type: "number",
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
        tags: {
            type: "array",
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
            res.data.content.map((v) => ({ label: v, value: v, })).forEach(element => {
                issueOptions.value.push(element);
            });

            console.log(issueOptions.value);
            IsIssueOptionsChange.value = false;

        } catch (err) {
            console.log(err);
        }
    };


    const handleValidateButtonClick = (e) => {
        e.preventDefault();
        formRef.value?.validate((errors) => {
            if (!errors) {
                console.log("ok");
            } else {
                console.log(errors);
                console.log("no");
                console.log(model);
            }
        });
    };


    const Options = ref([
        "aaa",
        "ccc",
        "eee",
    ]);

    const handleClose = (index) => {
        Options.value[index] = "test"
        console.log(Options.value[index]);
    };





    watchEffect(() => {
        switch (model.value.selectFilterValue) {
            case "nonIssue":
                JQL.value.JQL = "watcher = " + localStorage.getItem("empID") + " AND summary ~ 非議題*";
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
                JQL.value.JQL = "key = " + model.value.selectFilterValue;
                //console.log(JQL.value);
                getJiraIssues();
                break;
        }
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




    return { formRef, size, model, spendValueStatus, spendValue, filterOptions, issueOptions, rules, Options, IsIssueOptionsChange, handleValidateButtonClick, handleClose }
})
