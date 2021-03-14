<template>
  <el-button type="info" @click="exit">退出</el-button>
</template>
<script lang="ts">
export default {
  methods: {
    exit() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>
<style lang="less" scoped></style>
