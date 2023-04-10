import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia';
import { createDiscreteApi } from "naive-ui";
import { useSiderStore } from "../stores/siderStore.js";
import { useApiStore } from "../stores/apiStore.js";
import axios from "axios";
import { encode } from "js-base64";


export const useLogInStore = defineStore('logInStore', () => {
    const { dialog } = createDiscreteApi(["dialog"]);
    const siderStore = useSiderStore();
    const { isLogIn,empID,isManager } = storeToRefs(siderStore);
    const apiStore = useApiStore();
    const { apiUrl } = apiStore;
    const formRef = ref(null);
    const qualifiedTitleList = ["計時員"];
    const model = ref({
        Username: null,
        Password: null,
    });
    const isChecking=ref(false);
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
        if((isLogIn.value)&&(localStorage.getItem("token") === null || new Date().getTime() - localStorage.getItem("loginTime") > 600000 * 5)){
            isLogIn.value = false;
            dialog.info({ title: "逾時請重新登入" });
        }
    };
    
    const jiraLogin = async () => {
        try {
            isChecking.value = true;
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
                localStorage.setItem(
                    "token",
                    encode(model.value.Username + ":" + model.value.Password)
                );
                localStorage.setItem("loginTime", new Date().getTime());
                localStorage.setItem("empID", model.value.Username);
                empID.value = model.value.Username;
                getEmpInfo();
            }
            isChecking.value = false;

        } catch (err) {
            console.log(err);
        }
    };

    const getEmpInfo = async () => {
        try {
            const res = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/GetEmpInfo",
                {empID:localStorage.getItem("empID")}
            );
            console.log(res.data.content[0]);
            localStorage.setItem("deptNo", res.data.content[0].DeptNo);
            localStorage.setItem("superDeptName", res.data.content[0].SuperDeptName);
            localStorage.setItem("title", res.data.content[0].Title);
            localStorage.setItem("BjDept", res.data.content[0].BjDept);
            isManager.value = qualifiedTitleList.includes(localStorage.getItem("title"));
            isLogIn.value = true;
            console.log(isManager.value);
            dialog.info({ title: "登入成功" });
        } catch (err) {
            console.log(err);
        }
    };

    return { formRef, model, rules, isChecking, isManager, handleValidateButtonClick, checkLogInTime}
})
