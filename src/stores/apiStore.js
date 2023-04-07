import { defineStore } from 'pinia'

export const useApiStore = defineStore('apiStore', () => {
    const apiUrl = "https://localhost:44303/SyntecIT/api/v1";

    return { apiUrl }
})
