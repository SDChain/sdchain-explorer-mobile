<template>
  <span class="logo">
      <router-link to="/"><img src="../assets/images/logo.png" alt=""><span
              class="TT">SD-</span><span>Holographic</span></router-link>
  </span>
</template>

<script>
    export default {
        name: 'Logo',
        mounted() {

        },
    }
</script>

<style scoped lang="less">
    .logo {
        font-weight: bold;

    img {
        vertical-align: middle;
        height: 30px;
        display: inline-block;
        padding-right: 6px;
        margin-top: 3px;
        margin-left: 3px;
    }

    span {
        display: inline-block;
        color: #fff;
        font-size: 18px;
        font-weight: bold;
    }

    .TT {
        color: #fff;
    }

    }
</style>
