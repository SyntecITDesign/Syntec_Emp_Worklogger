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
    const isUsingJQL = ref(false);
    const model = ref({
        descriptionValue: null,
        selectFilterValue: null,
        selectIssueValue: null,
        tagValue: null,
        startDateValue: today.getFullYear() + "-" + ((today.getMonth() + 1) < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1)) + "-" + (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()),
        startTimeValue: "08:00:00",
        spendValue: computed(() => (spendValue.value.spendHourValue * 60 * 60 + spendValue.value.spendMinuteValue * 60)),
    });
    const isModify = ref(false);
    const deleteModel = ref({
        issueID: null,
        workLogID: null,
        BasicAuth: access.value.basicAuth,
    })

    const models = ref([]);
    const successCount = ref(0);
    const failCount = ref(0);
    const spendValue = ref({
        spendHourValue: 0,
        spendMinuteValue: 0,
        sumSpendSecond: 0,
    });

    let customJQL = "";

    const JQL = ref({
        JQL: "",
        BasicAuth: access.value.basicAuth,
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
    const filterOptions = [["負責的議題", "byAssignee"], ["審核的議題", "byReviewer"], ["報告的議題", "byReporter"], ["監看的議題", "byWatcher"], ["管理議題", "managedIssue"], ["非議題", "nonIssue"]].map(
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
            required: !isUsingJQL,
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
                return (model.value.startDateValue !== null) && (model.value.startTimeValue !== null);
            },
            trigger: ["blur", "change"],
            message: "請選擇日期及時間",
        },
        spendValue: {
            type: "number",
            required: true,
            validator(value) {
                return (spendValue.spendMinuteValue !== null) && (spendValue.spendHourValue !== null) && (model.value.spendValue > 0) && ((model.value.spendValue + spendValue.value.sumSpendSecond) <= 24 * 60 * 60);
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


    // 定義 async 函式 getJiraIssues，用於從 Jira 獲取議題列表
    const getJiraIssues = async () => {
        // 檢查是否正在使用 JQL 查詢且 JQL 查詢語句為空或為 null
        if (isUsingJQL.value && (JQL.value.JQL === "" || JQL.value.JQL === null)) {
            // 若條件成立，則顯示提示對話框要求輸入 JQL 查詢語句
            dialog.info({ title: "請輸入JQL查詢一般議題" });
        } else {
            try {
                // 檢查是否正在使用 JQL 查詢且 JQL 查詢語句中不包含特定條件
                if (isUsingJQL.value && !JQL.value.JQL.includes("type != 非議題 AND type != 管理議題 AND ")) {
                    // 若條件成立，則在 JQL 查詢語句前加入特定條件
                    JQL.value.JQL = "type != 非議題 AND type != 管理議題 AND " + JQL.value.JQL;
                }

                // 設定 isIssueOptionsChange 為 true，表示議題選項正在更改
                isIssueOptionsChange.value = true;
                // 清空 issueOptions，準備存放新的議題選項
                issueOptions.value = [].map((v) => ({ label: v, value: v }));
                // 將 model 中的 selectIssueValue 設為 null
                model.value.selectIssueValue = null;

                // 使用 Axios 庫發送 POST 請求，獲取符合 JQL 查詢語句的議題
                const res = await axios.post(
                    apiUrl + "/Open/JIRA_Related/Worklogger/GetJiraIssues",
                    JQL.value
                );

                // 輸出從伺服器返回的資料到控制台
                console.log(res.data.content);

                // 檢查伺服器返回的資料是否為空
                if (res.data.content === null) {
                    // 若資料為空，顯示警告對話框，指示查無相關議題
                    dialog.info({ title: "查無相關議題" });
                } else {
                    // 若資料不為空，則遍歷資料並轉換成選項的格式，添加到 issueOptions 中
                    res.data.content.map((v) => ({ label: v, value: v })).forEach(element => {
                        issueOptions.value.push(element);
                    });
                }

                // 檢查 issueOptions 的長度，若為 1，則將 model 中的 selectIssueValue 設為唯一的議題選項值
                if (issueOptions.value.length === 1) {
                    model.value.selectIssueValue = issueOptions.value[0].value;
                }

                // 完成議題選項的更新，設定 isIssueOptionsChange 為 false
                isIssueOptionsChange.value = false;

            } catch (err) {
                // 若發生錯誤，輸出錯誤訊息到控制台
                console.log(err);
            }
        }
    };

    // 定義 async 函式 getProjectTags，用於獲取特定專案的標籤列表
    const getProjectTags = async (projectKey, usage) => {
        try {
            // 設定 isTagOptionsChange 為 true，表示標籤選項正在更改
            isTagOptionsChange.value = true;
            // 清空 tagOptions，準備存放新的標籤選項
            tagOptions.value = [].map((v) => ({ label: v, value: v }));
            // 將 model 中的 tagValue 設為 null，用於選擇標籤的初始化
            model.value.tagValue = null;

            // 使用 Axios 庫發送 POST 請求，獲取指定專案的標籤
            const res = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/GetProjectTags",
                {
                    projectKey: projectKey,
                }
            );
            //console.log(res.data.content);

            // 檢查伺服器返回的資料是否為空
            if (res.data.content === null) {
                // 若資料為空，顯示警告對話框，指示無相關標籤
                dialog.info({ title: "無相關標籤" });
            } else {
                if (usage === "forFillForm") {
                    // 若使用情境為 "forFillForm"，則準備標籤選項用於填寫表單
                    tagOptions.value = [].map(
                        (v) => ({
                            label: v,
                            value: v,
                        })
                    );
                    // 將伺服器返回的標籤資料轉換成選項的格式，並添加到 tagOptions 中
                    res.data.content.map((v) => ({ label: v.TagName, value: v.TagName, })).forEach(element => {
                        tagOptions.value.push(element);
                    });
                } else {
                    // 若使用情境不是 "forFillForm"，則返回標籤資料而不修改 tagOptions
                    //console.log(res.data.content);
                    return res.data.content;
                }
                //console.log(tagOptions.value);
            }

            // 完成標籤選項的更新，設定 isTagOptionsChange 為 false
            isTagOptionsChange.value = false;

        } catch (err) {
            // 若發生錯誤，輸出錯誤訊息到控制台
            console.log(err);
        }
    };


    // 定義 async 函式 addJiraWorklog，用於新增 Jira 工作日誌
    const addJiraWorklog = async () => {
        try {
            // 設定 isAddingJiraWorklog 為 true，表示正在新增 Jira 工作日誌
            isAddingJiraWorklog.value = true;
            let isSuccess = true;
            // 初始化成功計數器
            successCount.value = 0;
            // 儲存新增失敗的資料
            const failData = [];

            // 遍歷 models.value 中的每個工作日誌模型
            for (var i = 0; i < models.value.length; i++) {
                const v = models.value[i];
                // 新增 Jira 工作日誌，發送 POST 請求到指定的 API 端點
                const resAddWorklog = await axios.post(
                    apiUrl + "/Open/JIRA_Related/Worklogger/AddWorklog",
                    v[1]
                );
                //console.log(resAddWorklog.data);

                // 檢查回傳的資料中是否有 'errorMessages' 屬性，判斷是否成功
                if (Object.prototype.hasOwnProperty.call(resAddWorklog.data.content, 'errorMessages')) {
                    // 若有錯誤訊息，表示新增失敗，將 isSuccess 設為 false
                    isSuccess = false;
                    // 儲存失敗的資料對
                    failData.push([v[0], v[1]]);
                } else {
                    // 若新增成功，記錄 Jira 回傳的工作日誌 ID 等資訊
                    v[0].workLogID = resAddWorklog.data.content.id;
                    v[0].created = resAddWorklog.data.content.created.split("+")[0];
                    v[0].started = resAddWorklog.data.content.started.split("+")[0];
                    v[0].issueID = v[0].issueID.split(" ")[0];
                    //console.log(v[0]);

                    // 將報工紀錄新增到資料庫，同步看板資料
                    const resInsertWorkLogs = await axios.post(
                        apiUrl + "/Open/JIRA_Related/Worklogger/InsertWorkLogs",
                        v[0]
                    );
                    console.log(resInsertWorkLogs.data);

                    // 新增或更新報工紀錄的相關議題欄位到資料庫，同步看板資料
                    const resUpsertJiraWorkLogRelatedIssue = await axios.post(
                        apiUrl + "/Open/JIRA_Related/Worklogger/UpsertJiraWorkLogRelatedIssue",
                        {
                            issueID: v[0].issueID,
                            BasicAuth: access.value.basicAuth,
                        }
                    );

                    if ((resUpsertJiraWorkLogRelatedIssue.data.code == 0) && (resInsertWorkLogs.data.code == 0)) {
                        // 若成功新增報工紀錄和相關議題欄位，增加成功計數器
                        successCount.value++;
                        // 若所有工作日誌都成功新增，顯示提示訊息，並初始化表單資料和 models
                        if (isSuccess && (successCount.value == models.value.length)) {
                            dialog.info({ title: "新增完成" });
                            initData();
                            models.value = [];
                        }
                    } else {
                        // 若新增或更新失敗，準備刪除之前新增的工作日誌
                        deleteModel.value.issueID = v[0].issueID;
                        deleteModel.value.workLogID = v[0].workLogID;
                        deleteJiraWorklog();
                        console.log("deleteJiraWorklog", deleteModel.value);
                        failData.push([v[0], v[1]]);
                        isSuccess = false;
                    }
                    console.log(resUpsertJiraWorkLogRelatedIssue.data);
                    console.log(successCount.value, models.value.length);
                }
            }

            if (!isSuccess) {
                // 若有新增失敗的工作日誌，顯示錯誤訊息，列出失敗資料，並初始化表單資料和 models
                dialog.error({ title: failData.length + "筆新增失敗" });
                console.log(failData);
                initData();
                models.value = failData;
            }
            // 完成新增 Jira 工作日誌，設定 isAddingJiraWorklog 為 false
            isAddingJiraWorklog.value = false;

        } catch (err) {
            // 若發生錯誤，輸出錯誤訊息到控制台
            console.log(err);
        }
    };

    // 定義 async 函式 deleteJiraWorklog，用於刪除 Jira 工作日誌
    const deleteJiraWorklog = async () => {
        try {
            // 設定 isDeletingJiraWorklog 為 true，表示正在刪除 Jira 工作日誌
            isDeletingJiraWorklog.value = true;
            // 發送 POST 請求到指定的 API 端點，以刪除 Jira 工作日誌
            const resDeleteWorklog = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/DeleteJiraWorkLog",
                deleteModel.value
            );
            console.log(resDeleteWorklog.data);

            // 檢查回傳的資料中的 code 屬性，判斷刪除是否成功
            if (resDeleteWorklog.data.code == 0) {
                if (!isAddingJiraWorklog.value) {
                    // 若刪除成功並且不是在新增 Jira 工作日誌過程中執行，顯示刪除成功的提示訊息
                    dialog.info({ title: "刪除成功" });
                }
            } else {
                if (!isAddingJiraWorklog.value) {
                    // 若刪除失敗並且不是在新增 Jira 工作日誌過程中執行，顯示刪除失敗的錯誤訊息
                    dialog.error({ title: "刪除失敗，請再次確認議題編號及 Worklog ID 正確" });
                }
            }
            // 完成刪除 Jira 工作日誌，設定 isDeletingJiraWorklog 為 false
            isDeletingJiraWorklog.value = false;

        } catch (err) {
            // 若發生錯誤，輸出錯誤訊息到控制台
            console.log(err);
        }
    };


    // 定義 async 函式 getSumSpentSeconds，用於獲取已花費的總秒數
    const getSumSpentSeconds = async () => {
        try {
            // 發送 POST 請求到指定的 API 端點，以獲取已花費的總秒數
            const res = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/GetSumSpentSeconds",
                {
                    empID: localStorage.getItem("empID"), // 從本地儲存中獲取員工ID
                    started: model.value.startDateValue, // 使用指定的開始日期
                }
            );
            // 檢查回傳的資料是否為 null
            if (res.data.content !== null) {
                // 若資料不為 null，則將總花費秒數存入 spendValue.value.sumSpendSecond
                spendValue.value.sumSpendSecond = res.data.content[0].sumSpentSeconds;
            } else {
                // 若資料為 null，則將總花費秒數設定為 0
                spendValue.value.sumSpendSecond = 0;
            }

            // 遍歷 models.value 陣列，計算符合指定開始日期的工作日誌總秒數
            models.value.forEach((item, index, array) => {
                if (item[0].started.split(" ")[0] === model.value.startDateValue) {
                    spendValue.value.sumSpendSecond += item[0].timeSpentSeconds;
                }
            });
            // 輸出計算後的總花費秒數到控制台
            console.log(spendValue.value.sumSpendSecond);

        } catch (err) {
            // 若發生錯誤，輸出錯誤訊息到控制台
            console.log(err);
        }
    };


    // 定義 handleValidateButtonClick 函式，處理驗證按鈕的點擊事件
    const handleValidateButtonClick = (e) => {
        e.preventDefault(); // 阻止表單提交的預設行為

        formRef.value?.validate((errors) => {
            if (!errors) { // 如果沒有驗證錯誤
                // 建立要傳遞給 Jira 新增工作日誌 API 的資料模型
                const modelForJiraAddWorkLogApi = {
                    issueID: model.value.selectIssueValue.split(" ")[0], // 從選擇的議題中獲取議題ID
                    started: model.value.startDateValue + "T" + model.value.startTimeValue + ".000+0800", // 開始時間
                    comment: `[分類：${model.value.selectFilterValue === "nonIssue" ? "非議題" : (model.value.selectFilterValue === "managedIssue" ? "管理議題" : "一般議題")}]\\n[標籤：${model.value.tagValue}]\\n[工作內容：${model.value.descriptionValue.replaceAll("\\", "/")}]`, // 工作日誌註解
                    timeSpentSeconds: model.value.spendValue, // 花費的秒數
                    BasicAuth: access.value.basicAuth, // 基本身分驗證資訊
                };

                // 計算總共花費的分鐘數
                let sumMinute = spendValue.value.spendHourValue * 60 + Math.round(spendValue.value.spendMinuteValue);

                // 建立要存儲到本地資料庫的工作日誌紀錄模型
                const modelForJiraWorkLogRecord = {
                    issueID: model.value.selectIssueValue, // 選擇的議題
                    empID: localStorage.getItem("empID"), // 從本地儲存中獲取員工ID
                    workLogID: "", // 工作日誌ID（尚未知道，待新增後更新）
                    timeSpentSeconds: model.value.spendValue, // 花費的秒數
                    created: "", // 創建時間（尚未知道，待新增後更新）
                    started: model.value.startDateValue + " " + model.value.startTimeValue, // 開始時間
                    type: (model.value.selectFilterValue === "nonIssue" ? "非議題" : (model.value.selectFilterValue === "managedIssue" ? "管理議題" : "一般議題")), // 工作類型
                    tags: model.value.tagValue, // 標籤
                    comment: model.value.descriptionValue.replaceAll("\\", "/"), // 註解
                    spendHour: Math.floor(sumMinute / 60), // 花費的小時數
                    spendMinute: sumMinute % 60, // 花費的分鐘數
                    BasicAuth: access.value.basicAuth, // 基本身分驗證資訊
                };

                // 建立暫時紀錄的模型，用於在 UI 中顯示
                const modelTempRecord = {
                    selectIssueValue: model.value.selectIssueValue, // 選擇的議題
                    selectFilterValue: ((model.value.selectFilterValue != "nonIssue") && (model.value.selectFilterValue != "managedIssue")) ? null : model.value.selectFilterValue, // 選擇的分類
                    startDateValue: model.value.startDateValue, // 開始日期
                    spendHourValue: spendValue.value.spendHourValue, // 花費的小時數
                    spendMinuteValue: spendValue.value.spendMinuteValue, // 花費的分鐘數
                    descriptionValue: model.value.descriptionValue, // 工作內容描述
                };

                // 將工作日誌紀錄模型加入 models.value 陣列中
                models.value.push([modelForJiraWorkLogRecord, modelForJiraAddWorkLogApi, modelTempRecord]);

                initData(); // 初始化表單資料
                console.log(spendValue.value); // 輸出花費相關資料到控制台
                console.log("ok"); // 輸出成功訊息到控制台
            } else {
                console.log(errors); // 輸出驗證錯誤訊息到控制台
                console.log("no"); // 輸出失敗訊息到控制台
            }
        });
    };

    // 卡控不能做未來報工
    const dateDisabled = (ts) => {
        const date = new Date(ts);
        return date >= new Date();
    }

    // 初始化表單資料函式
    const initData = () => {
        // 重置表單數據為預設值
        model.value.descriptionValue = null; // 工作內容描述
        model.value.tagValue = null; // 標籤
        spendValue.value.spendHourValue = 0; // 花費的小時數
        spendValue.value.spendMinuteValue = 0; // 花費的分鐘數
        spendValue.value.sumSpendSecond = 0; // 花費的總秒數
        spendValueStatus.value.init = false; // 花費相關狀態初始化為 false
    }

    // 關閉工作日誌編輯模式函式
    const handleClose = (index) => {
        // 移除指定索引的工作日誌紀錄
        models.value.splice(index, 1);
        console.log(models.value);
    };

    // 編輯工作日誌函式
    const handleEdit = (index) => {
        console.log(models.value[index][2]);

        // 啟用編輯模式
        isModify.value = true;

        // 設定表單欄位值為選擇的工作日誌的值
        model.value.selectFilterValue = models.value[index][2].selectFilterValue; // 分類
        model.value.selectIssueValue = models.value[index][2].selectIssueValue; // 選擇的議題
        model.value.startDateValue = models.value[index][2].startDateValue; // 開始日期
        spendValue.value.spendHourValue = models.value[index][2].spendHourValue; // 花費的小時數
        spendValue.value.spendMinuteValue = models.value[index][2].spendMinuteValue; // 花費的分鐘數
        model.value.descriptionValue = models.value[index][2].descriptionValue; // 工作內容描述

        // 關閉編輯的工作日誌模式
        handleClose(index);
    };

    // 切換自訂 JQL 模式函式
    const customJQLSwitch = () => {
        console.log(customJQL, JQL.value.JQL);

        if (isUsingJQL.value) { // 如果正在使用自訂 JQL 模式
            JQL.value.JQL = customJQL; // 將 JQL 值設定為自訂 JQL
            model.value.selectFilterValue = null; // 清除分類選擇
            model.value.selectIssueValue = null; // 清除議題選擇
            model.value.tagValue = null; // 清除標籤選擇

            // 重置標籤和議題選項為空陣列
            tagOptions.value = [].map(
                (v) => ({
                    label: v,
                    value: v,
                })
            );
            issueOptions.value = [].map(
                (v) => ({
                    label: v,
                    value: v,
                })
            );
        } else {
            customJQL = JQL.value.JQL; // 將自訂 JQL 複製到 customJQL 變數
        }

        console.log(customJQL, JQL.value.JQL);
    };

    // 監聽選擇的分類值變化
    watch(() => model.value.selectFilterValue, (newValue) => {
        if (!isModify.value) {
            switch (newValue) {
                // 根據不同的分類值，設定相對應的 JQL 查詢並觸發取得 Jira 議題的函式
                case "managedIssue":
                    JQL.value.JQL = "(reporter = " + localStorage.getItem("empID") + " or assignee = " + localStorage.getItem("empID") + " or creator  = " + localStorage.getItem("empID") + " or watcher = " + localStorage.getItem("empID") + ") AND type = 管理議題 AND status != Closed order by created DESC";
                    isUsingJQL.value = false;
                    getJiraIssues();
                    break;
                case "nonIssue":
                    JQL.value.JQL = "(reporter = " + localStorage.getItem("empID") + " or assignee = " + localStorage.getItem("empID") + " or creator  = " + localStorage.getItem("empID") + " or watcher = " + localStorage.getItem("empID") + ") AND type = 非議題 AND status != Closed order by created DESC";
                    isUsingJQL.value = false;
                    getJiraIssues();
                    break;
                case "byAssignee":
                    // 更多分類的設定...
                    break;
                case null:
                    break;
                default:
                    JQL.value.JQL = "key = " + newValue + " AND type != 非議題 AND type != 管理議題";
                    isUsingJQL.value = false;
                    getJiraIssues();
                    break;
            }
        } else {
            isModify.value = false;
        }
    }, { deep: true });

    // 監聽選擇的議題值變化
    watch(() => model.value.selectIssueValue, (newValue) => {
        if (newValue !== null) {
            // 根據選擇的分類值觸發獲取專案標籤的函式
            getProjectTags((model.value.selectFilterValue === "nonIssue" ? "nonIssue" : (model.value.selectFilterValue === "managedIssue" ? "managedIssue" : model.value.selectIssueValue.split("-")[0])), "forFillForm");
        }
    }, { deep: true });

    // 監聽開始日期和時間的變化
    watch(() => [model.value.startDateValue, model.value.startTimeValue], ([newDateValue, newTimeValue]) => {
        if ((newDateValue !== null) || (newTimeValue !== null)) {
            // 當日期或時間有變化時，觸發計算花費秒數的函式
            console.log(newDateValue, newTimeValue);
            getSumSpentSeconds();
        }
    }, { deep: true });

    // 監聽花費相關數據的變化
    watchEffect(() => {
        if ((model.value.spendValue <= 0) && (spendValueStatus.value.init)) {
            // 如果花費值無效且不是初始化階段，設定狀態為錯誤
            spendValueStatus.value.status = "error";
            spendValue.value.spendDayValue = 0;
            spendValue.value.spendHourValue = 0;
            spendValue.value.spendMinuteValue = 0;
        } else {
            // 否則，設定狀態為成功並標記初始化已完成
            spendValueStatus.value.status = "success";
            spendValueStatus.value.init = true;
        }
        if ((spendValue.value.spendHourValue == null)) {
            spendValue.value.spendHourValue = 0;
        }
        if ((spendValue.value.spendMinuteValue == null)) {
            spendValue.value.spendMinuteValue = 0;
        }
        console.log(model.value.spendValue / (60 * 60), spendValue.value.sumSpendSecond / (60 * 60));
    });


    return {
        JQL, // Jira查詢語言（JQL）的狀態
        isUsingJQL, // 是否正在使用自定義JQL查詢的狀態
        isDeletingJiraWorklog, // 是否正在刪除Jira工作記錄的狀態
        successCount, // 成功數
        formRef, // 表單參考
        size, // 尺寸
        model, // 主要的數據模型
        deleteModel, // 刪除模型
        models, // 數據模型集合
        spendValueStatus, // 花費數值的狀態
        spendValue, // 花費數值
        filterOptions, // 過濾選項
        issueOptions, // 議題選項
        tagOptions, // 標籤選項
        rules, // 規則
        isIssueOptionsChange, // 議題選項是否改變的狀態
        isAddingJiraWorklog, // 是否正在新增Jira工作記錄的狀態
        isTagOptionsChange, // 標籤選項是否改變的狀態
        handleValidateButtonClick, // 處理驗證按鈕點擊的函式
        handleClose, // 關閉功能的函式
        handleEdit, // 編輯功能的函式
        addJiraWorklog, // 新增Jira工作記錄的函式
        getProjectTags, // 獲取專案標籤的函式
        dateDisabled, // 日期禁用狀態
        deleteJiraWorklog, // 刪除Jira工作記錄的函式
        getJiraIssues, // 獲取Jira議題的函式
        customJQLSwitch // 切換自定義JQL查詢的函式
    }

})
