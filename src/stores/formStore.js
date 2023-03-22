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
        switchToGeneralValue: false,
        spendDayValue: null,
        spendHourValue: null,
        spendMinuteValue: null,
        tags: ["需求討論"],
    });
    const filterOptions = ["groode", "veli good", "emazing", "lidiculous"].map(
        (v) => ({
            label: v,
            value: v,
        })
    );

    const issueOptions = ["issue1", "issue2", "issue3", "issue4"].map(
        (v) => ({
            label: v,
            value: v,
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
            }
        });
    };
    return { formRef, size, model, filterOptions, issueOptions, rules, handleValidateButtonClick}
})
