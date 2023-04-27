import { defineStore } from 'pinia'



export const useApiStore = defineStore('apiStore', () => {  
  
  const apiUrl = import.meta.env.VITE_BACKEND_HOST;
  

    return { apiUrl}
})
