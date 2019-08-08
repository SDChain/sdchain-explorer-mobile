<template>
  <div class="main">
    <div class="info">
      <div class="body">
        <div class="tit">
          <p style="line-height: 36px;">{{$t('hash.tit')}}</p>
          <span style="padding-right: 5px;">{{$route.query.hash}}</span>
          <Tooltip :disabled="true"  placement="top">
            <i class="iconfont icon-fuzhi" v-clipboard:copy="addr" v-clipboard:success="copysuc" v-clipboard:error="copyerr"></i>
          </Tooltip>
        </div>
        <div class="flexdiv">
          <table style="width:100%;">
            <tr>
              <td>
                <span class="key">{{$t('hash.list')[0]}}</span>
                <span class="value vl">{{getTradeType(info.type)}}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span class="key">{{$t('hash.list')[1]}}</span>
                <span
                  class="err vl"
                  @click="$router.push(`/account?address=${info.account}`)"
                  style="cursor: pointer;"
                >{{info.account}}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span class="key">{{$t('hash.list')[2]}}</span>
                <span
                  v-if="info.destination"
                  class="err vl"
                  @click="$router.push(`/account?address=${info.destination}`)"
                  style="cursor: pointer;"
                >{{info.destination}}</span>
                <span v-else style="text-align:right;">--</span>
              </td>
            </tr>
            <tr>
              <td>
                <span class="key">{{info.type == 'AccountSet' ? $t('hash.text')[0] : info.type == 'TrustSet' ? $t('hash.text')[1] : $t('hash.list')[5]}}</span>
                <span class="value vl">{{info.amount ? info.amount : '--'}}</span>
              </td>
            </tr>
            <tr style="word-break:break-all;">
              <td>
                <span class="key">{{$t('hash.list')[9]}}</span>
                <span class="value vl">
                  <template v-for="item in info.amountObjs">
                      <div v-if="item.issuer || item.counterparty">
                        <span style="padding-right:5px;">{{item.currency}}:</span>
                        <span v-if="item.issuer">{{item.issuer}}</span>
                        <span v-else="item.counterparty">{{item.counterparty}}</span>
                      </div>
                      <div style="clear:both;" v-else>--</div>
                  </template>
                  {{!info.amountObjs ? '--' : ''}}
                </span>
              </td>
            </tr>
          </table>
          <table style="width: 100%;">
            <tr>
              <td>
                <span class="key">{{$t('hash.list')[4]}}</span>
                <span class="vl"
                  v-html="info.result == 'tesSUCCESS' ? `<span class = \'success\' >${$t('success')}</span>` : (!info.hasOwnProperty('result') ? '' : `<span class=\'error\'>${$t('error')}</span>`) "
                ></span>
              </td>
            </tr>
            <tr>
              <td>
                <span class="key">{{$t('hash.list')[3]}}</span>
                <span class="value vl">{{info.ledger}}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span class="key">{{$t('hash.list')[6]}}</span>
                <span class="value vl" style="color:#0b0b0b">{{info.fee}} {{$config.currency}}</span>
              </td>
            </tr>
            <tr>
              <td>
                <span class="key">{{$t('hash.list')[7]}}</span>
                <span class="value vl">{{info.time}}</span>
              </td>
            </tr>
          </table>
        </div>
        <div class="beizhu">
          <span>{{$t('hash.list')[8]}}</span>
          <div class="remark-body">
            <template v-for="item in info.simple_memos">
              {{item.memo_data }}
            </template>
            {{!info.simple_memos ? '--' : ''}}
          </div>
        </div>
      </div>
    </div>

    <div class="result">
      <div class="h3" style="font-size:14px">{{$t('hash.tit2')}}</div>
      <div style="padding-top:10px">
        <template v-if="info.txResults && info.txResults.length">
          <p v-for="(item,index) in info.txResults" :key="index">{{item}}</p>
        </template>
        <span v-if="info.txResults && !info.txResults.length"  style="color:#0b0b0b;">{{$t('nothing')}}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import {Tooltip} from 'iview'
  import api from "../common/api"
  import dayjs from "dayjs"
  import VueQr from 'vue-qr'

  export default {
    name: "Hash",
    components: {VueQr, Tooltip},
    data() {
      return {
        addr: this.$route.query.hash,
        info: {
          result: 'tesSUCCESS'
        }
      }
    },
    created() {
      this.getHash()
    },
    watch: {
      "$route.query.hash"() {
        this.getHash()
      }
    },
    methods: {
      copysuc(e) {
        this.$Message.success(this.$t('copysuc'))
      },
      copyerr(e) {
        this.$Message.error(this.$t('copyerr'))
      },
      getHash() {
        this.$axios(`${api.transactions}/${this.$route.query.hash}`)
          .then(res => {
            this.info = res.data
            this.info["time"] = dayjs(res.data.time).format("YYYY-MM-DD HH:mm:ss")
          })
          .catch(err => {
            this.$router.push('/err?err=hash')
          })
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../assets/css/var.less";
.info {
  .box();
  margin: 0 0 20px 0;
  .tit {
    font-weight: 500;
    padding:10px 18px;
    word-wrap: break-word;
    margin-bottom: 10px;
    background-color: #F3F3F3;
  }
    .iconfont {
      font-size: 18px;
      cursor: pointer;
      color: #333;
      padding: 3px;

      &:hover {
        background: @mainbg;
        border-radius: 50%;
      }
    }
  .body {
    padding: 0px 0px 25px 0px;
    .flexdiv {
      table {
        border-collapse: collapse;
         &:nth-child(1) {
           tr{
             &:nth-child(even){
              background-color: #fff;
            }
            &:nth-child(odd){
              background-color: #F4F4F4;
            }
           }
        }
        &:nth-child(2) {
           tr{
             &:nth-child(odd){
                background-color: #fff;
            }
              &:nth-child(even){
                background-color: #F4F4F4;
            }
           }
        }
        tr {
          td {
            padding:0 18px;
            border-bottom: 1px solid #56505014;
            line-height: 50px;
            span {
              float: left;
              width: 40%;
              &:last-child {
                width: 60%;
                float: right;
                display:block;

                overflow:hidden;

                word-break:keep-all;

                white-space:nowrap;

                text-overflow:ellipsis;
              }
              &.err {
                color: #69afff;
              }
              &.value {
                color: #4b5065;
              }
              &.key{
                float: left;
                width: 40%;
                text-align: left;
              }
              &.vl{
                 width: 60%;
                float: right;
                text-align: right;
              }
            }
            textarea {
              background-color: #f8f9fb;
              border: none;
              resize: none;
              color: #4b5065;
            }
          }
          &:last-child {
            // td{border:none;}
          }
        }
      }
    }
  }
  .beizhu{
    padding: 10px 18px 0 18px;
    .remark-body {
      width: 100%;
      padding: 15px;
      margin-top: 12px;
      background-color: #F8F9FB;
      border:none;
      resize: none;
      word-wrap:break-word;
    }
  }
}
.result {
  .box();
  padding: 0 18px 18px 18px;
  .h3 {
    height: 50px;
    line-height: 70px;
    border-bottom: 1px solid #56505014;
    color: #213b93;
    font-weight: bold;
  }
}
.demo-breadcrumb-separator{
  font-weight: bold
}
</style>
