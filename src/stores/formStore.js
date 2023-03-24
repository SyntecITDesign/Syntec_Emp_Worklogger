import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useFormStore = defineStore('formStore', () => {

    const formRef = ref(null);
    const size = ref("medium");
    const model = ref({
        descriptionValue: null,
        selectFilterValue: null,
        selectIssueValue: null,
        startDateValue: null,
        spendDayValue: null,
        spendHourValue: null,
        spendMinuteValue: null,
        tags: ["需求討論"],
    });

    const issueOptions = ref(["issue1", "issue2", "issue3", "issue4"].map(
        (v) => ({
            label: v,
            value: v,
        })
    ));
    const filterOptions = [["負責的議題", "byAssignee"], ["報告的議題", "byReporter"], ["監看的議題", "byWatcher"], ["指定議題", "byIssueKey"], ["非議題工時", "nonIssue"]].map(
        (v) => ({
            label: v[0],
            value: v[1],
        })
    );

    const rules = {
        descriptionValue: {
            required: true,
            trigger: ["blur", "input"],
            message: "descriptionValue",
        },
        selectFilterValue: {
            required: true,
            trigger: ["blur", "change"],
            message: "selectValue",
        },
        selectIssueValue: {
            required: true,
            trigger: ["blur", "change"],
            message: "selectValue",
        },
        startDateValue: {
            type: "number",
            required: true,
            trigger: ["blur", "change"],
            message: "startDateValue",
        },
        spendDayValue: {
            type: "number",
            required: true,
            trigger: ["blur", "change"],
            message: "spendDayValue",
        },
        spendHourValue: {
            type: "number",
            required: true,
            trigger: ["blur", "change"],
            message: "spendHourValue",
        },
        spendMinuteValue: {
            type: "number",
            required: true,
            trigger: ["blur", "change"],
            message: "spendMinuteValue",
        },
        tags: {
            type: "array",
            required: true,
            trigger: ["blur", "change"],
            message: "tags",
        },
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
    return { formRef, size, model, filterOptions, issueOptions, rules, Options, handleValidateButtonClick, handleClose }
})
