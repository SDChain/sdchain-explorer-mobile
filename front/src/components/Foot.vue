<template>
  <div class="foot">
    <div class="main">
      <p class="row-1"><span>Email:</span><span>service@sdchain.io</span></p>
      <span class="txt">CopyRight © 2018~2019 SDChain Alliance, Toronto,Canada.</span>
    </div>
  </div>
</template>

<script>
import BottomBar from "../components/BottomBar";
export default {
  name: 'Foot',
  components:{
    BottomBar
  },
  mounted(){

  },
}
</script>

<style scoped lang="less">
  .foot{
    text-align:center;
    padding:2px 0;
    background:#EAEAEA;
    .flogo{
      display: inline-block;
      transform:scale(.4,.4);
    }
    .txt{
      font-size:12px;
      position: relative;
      bottom: 3px;
      display: block;
      padding-bottom: 10px;
    }
    .row-1{
      padding: 10px 0 5px;
    }
  }

</style>
