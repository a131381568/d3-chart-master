<template>
  <h2>{{ msg }}</h2>
  <button type="button" @click.prevent="store.setCount()">
    count is: {{ store.get_count }}
  </button>
  <ul>
    <li><router-link to="/">index</router-link></li>
    <li><router-link to="/about">about</router-link></li>
  </ul>
</template>
<script setup lang="ts">
defineProps<{ msg: string }>();
const store = useStore();
const xxx = "xxxx";
console.log(xxx);
</script>
<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
