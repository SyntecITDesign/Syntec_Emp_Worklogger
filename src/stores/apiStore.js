import { defineStore } from 'pinia'
import axios from "axios";

export const useApiStore = defineStore('apiStore', () => {  
    const apiUrl = import.meta.env.VITE_BACKEND_HOST;  
    const InsertActionLog = async (data) => {
        try {
            const res = await axios.post(
                apiUrl + "/Open/JIRA_Related/Worklogger/InsertActionLog",
                data
            );
            console.log("InsertActionLog",res.data);
        } catch (err) {
            console.log(err);
        }
    };
    return { apiUrl, InsertActionLog}
})