import { defineStore } from "pinia";
export const useStore = defineStore("main", {
  state: () => ({
    count: 0,
  }),
  actions: {
    setCount() {
      this.count = this.count + 1;
    },
  },
  getters: {
    get_count(state) {
      return state.count;
    },
  },
});
