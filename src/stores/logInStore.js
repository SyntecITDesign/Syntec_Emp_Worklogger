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
    const { isLogIn } = storeToRefs(siderStore);
    const apiStore = useApiStore();
    const { apiUrl } = apiStore;
    const formRef = ref(null);
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
                isLogIn.value = true;
                dialog.info({ title: "登入成功" });
            }
            isChecking.value = false;

        } catch (err) {
            console.log(err);
        }
    };


    return { formRef, model, rules, isChecking, handleValidateButtonClick }
})
