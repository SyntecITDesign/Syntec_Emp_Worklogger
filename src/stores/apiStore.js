import { defineStore } from 'pinia'

export const useApiStore = defineStore('apiStore', () => {
   //const apiUrl = "https://www.syntecclub.com:9392/SyntecIT/api/v1";
 const apiUrl = "https://localhost:44303/SyntecIT/api/v1";

    return { apiUrl }
})
