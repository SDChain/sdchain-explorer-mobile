<template>
  <div class="home">
    <div class="main">
      <div class="block">
        <div class="titlebar">
          <span style="padding-left: 12px;width: 250px;">
            <span style="float:left; text-align:left; width: 20px;"><i class="iconfont icon-4"></i></span>
            <span style="float:left; text-align:left; width: 200px; line-height: 26px;">{{now}}</span>
          </span>
        </div>
        <div class="card">
          <table class="no" @click="$router.push('/history/')">
            <tr>
              <td>
                <div class="iborder">
                  <i class="iconfont icon-zhibiao"></i>
                </div>
              </td>
              <td>
                <p>
                  <span>{{$t('home.amount')}}</span>
                </p>
                <p>{{tradeTotalVal}}</p>
              </td>
            </tr>
          </table>
          <table class="no" @click="$router.push('/assets/')">
            <tr>
              <td>
                <div class="iborder">
                  <i class="iconfont icon-yejibaobiao"></i>
                </div>
              </td>
              <td>
                <p>
                  <span>{{$t('home.assetsTotal')}}</span>
                </p>
                <p>{{assetsTotalVal}}</p>
              </td>
            </tr>
          </table>
          <table class="no" @click="directLatestBlock">
            <tr>
              <td>
                <div class="iborder">
                  <i class="iconfont icon-gaodu"></i>
                </div>
              </td>
              <td>
                <p>
                  <span>{{$t('home.height')}}</span>
                </p>
                <p>{{heightVal}}</p>
              </td>
            </tr>
          </table>
          <table class="no" @click="directLatestBlock">
            <tr>
              <td>
                <div class="iborder">
                  <i class="iconfont icon-lvzhou_zongshu"></i>
                </div>
              </td>
              <td>
                <p>
                  <span>{{$t('home.newtrading')}}</span>
                </p>
                <p>{{tradeVal}}</p>
              </td>
            </tr>
          </table>
        </div>
      </div>

      <div class="lineChart">
        <div class="titlebar">
          <div class="h3 totalcount" style="width:100%;">
            {{$t('home.trading_amount')}}
            <span class="right">
                <span class="point"></span>
                {{$t('home.trading')}}
              </span>
          </div>
        </div>
        <Chart/>
      </div>

      <div class="blocklist">
        <div class="titlebar">
          <div class="h3">{{$t('home.blocklist')}}</div>
        </div>
        <div class="table">
          <Table
            stripe
            :columns="thead1"
            :data="data1"
            size="small"
            :no-data-text="$t('nodata')"
            :loading="loading"
          ></Table>
        </div>
      </div>

      <div class="tradinglist">
        <div class="titlebar">
          <div class="h3">{{$t('home.tradinglist')}}</div>
        </div>
        <div class="table">
          <div v-if="data2.length!=0">
            <div class="item" v-for="(item,index) in data2" :key="index">
              <div class="row-1">
                <a @click="$router.push(`/hash?hash=${item.hash}`)" class="hash">{{item.hash}}</a>
                <span class="type">{{item.type}}</span>
              </div>
              <div class="row-2">
                <span class="count">{{item.count}}</span>
                <span class="time">{{item.time}}</span>
              </div>
            </div>
          </div>
          <div class="nodata" v-else>{{$t('nodata')}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Head from "../components/Head";
import Chart from "../components/Chart";
import dayjs from "dayjs";
import api from "../common/api";
import { Table } from "iview";
import BigNumber from 'bignumber.js'
export default {
  name: "home",
  components: {
    Head,
    Table,
    Chart
  },
  data() {
    return {
      loading: false,
      now: '',

      tradeTotalVal: '',
      assetsTotalVal: '',
      heightVal: '',
      tradeVal: '',

      timer: null,

      thead1: [
        {
          title: this.$t("home.head1")[0],
          key: "height",
          width: 120,
          render: (h, param) => {
            return h(
              "router-link",
              {
                style: "color:#4ea1fd",
                props: {
                  to: "/block/detail?block=" + param.row.height
                }
              },
              param.row.height
            );
          }
        },
        {
          title: this.$t("home.head1")[1],
          key: "hash",
          ellipsis: true
        },
        {
          title: this.$t("home.head1")[2],
          key: "count",
          align: "center",
          width: 100
        }
      ],
      data1: [],
      data2: []
    };
  },
  created() {
    this.getTransactionsTotal()
    this.getAssetsTotal()
    this.getLedgers()
    this.getTransactionsList()
  },
  mounted() {
    this.loop(10)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    getTransactionsTotal() {
      this.$axios({
        url: api.transactionsTotal
      }).then(res => {
        this.tradeTotalVal = res.data.count > 1000000 ? (res.data.count / 1000000).toFixed(2) + "M" : new BigNumber(res.data.count).toFormat()
      }).catch(err => {
        console.log(err)
      })
    },
    getAssetsTotal() {
      this.$axios({
        url: api.secondCurrencyList
      }).then(res => {
        this.assetsTotalVal = res.data.data.all
      }).catch(err => {
        console.log(err)
      })
    },
    getTransactionsList() {
      this.$axios({
        url: api.transactions
      }).then(res => {
        this.data2 = []
        res.data.transactons.map(data => {
          this.data2.push({
            hash: data.hash,
            type: this.getTradeType(data.type),
            count: data.amount ? data.amount : "--",
            time: dayjs(data.time).format('YYYY-MM-DD HH:mm:ss')
          })
        })
      }).catch(err => {
        // console.log(err)
      })
    },
    getLedgers() {
      this.$axios({
        url: api.ledgers,
        data: {}
      }).then(res => {
        this.data1 = []
        res.data.ledgers.map(data => {
          this.data1.push({
            height: data.ledger_index,
            hash: data.ledger_hash,
            count: new BigNumber(data.transactions_count).toFormat(),
            time: dayjs(data.close_time * 1000).format('YYYY-MM-DD HH:mm:ss')
          })
        })
        this.heightVal = res.data.ledgers[0].ledger_index
        this.tradeVal = res.data.ledgers[0].transactions_count
        this.now = dayjs(res.data.ledgers[0].close_time * 1000).format('YYYY-MM-DD HH:mm:ss')
      }).catch(err => {
        console.log(err)
      })
    },
    directLatestBlock() {
      this.$router.push("/block/detail?block=" + this.heightVal)
    },
    loop(s) {
      this.timer = setInterval(() => {
        if (this.$route.name == "home") {
          this.getTransactionsList()
          this.getLedgers()
        } else {
          clearInterval(this.timer)
        }
      }, s * 1000)
    }
  }
}
</script>
<style lang="less" scoped>
@import url('../assets/css/var.less');
  .banner{
    background: url('../assets/images/banner.jpg') right center no-repeat;
    height:249px;
    .main{
      text-align:center;
      .blogo{padding:40px 0;display:block;}
      .searchbar{
        width:50%;
        margin:0 auto;
      }
    }
  }
  .block{
    margin-top:10px;
    .titlebar{
      padding-bottom:2px;
    }
    .card{
      .clearfix();
      table{
        float: left;
        cursor:pointer;
        height:95px;
        text-align: left;
        width: 50%;
        position: relative;

        span{
          color:@sdc-txtColor2
          }
        &:nth-child(1){
          &:after{
          .setRightLine();
        }
          td{
            .iborder{
              border-radius: 50%;
              display: inline-block;
              border: 5px solid #E0F0FF;
              i{
               background:#66B5FF;
              }
            }

          }
        }
        &:nth-child(2){
           &:after{
          .setBottomLine();
        }
          td{
            .iborder{
              border-radius: 50%;
              display: inline-block;
              border: 5px solid #EAE7F8;
              i{
                background:#968DDC;
              }
            }
          }
        }
        &:nth-child(3){
           &:after{
          .setTopLine();
        }
          td{
            .iborder{
              border-radius: 50%;
              display: inline-block;
              border: 5px solid #DBE6FA;
              i{
                background:#4982ED;
              }
            }
          }
        }
        &:nth-child(4){
           &:after{
          .setLeftLine();
        }
          td{
            .iborder{
              border-radius: 50%;
              display: inline-block;
              border: 5px solid #FFE0E5;
              i{
                background:#FF687B;
              }
            }
          }
        }
        &.no{
          background: #F6F6F6;
          color:@txtColor1;
          span{color:#999};
        }
        // background:linear-gradient(180deg, #df5173 0%, #f85757 100%);
        // background:#e73c5c;
        tr{
              height: 100%;
        }
        td{
          font-size: 12px;
          &:first-child{
            padding-left:5%;
            text-align:left;
            width: 45%
          }
          p{
            line-height: 25px;
            margin:0;
            &:nth-child(2){
              font-size:19px;
              color: #000;
              font-weight: 500;
            }
          }
          i{
            font-size:30px;
            color:#fff;
            padding:8px;
            border-radius:50%;
            &:first-child{
            }
          }
        }
      }
    }
  }

  .lineChart{
    .titlebar{
      padding:15px 18px 0 18px;
    }
    .box()
  }

  .tradinglist, .blocklist{
    margin-top:20px;
    min-height: 400px;
    .titlebar{
      padding:15px 18px;
    }
    .box()
  }

  .right {
    color: #4179EB;
    width: 55% !important;
    text-align: left;
    .point {
      width: 6px;
      height: 6px;
      background: #4179EB;
      border-radius: 50%;
    }
  }
  .table{
    .item{
      font-size: 12px;
      padding:10px 18px;
      &:after{
        // .setBottomLine(#000);
      }
      &:nth-child(even){
        background-color: #F3F3F3;
      }
      &:nth-child(odd){
        background-color: #FFFFFF;
      }

      .row-1{

       .hash{
         text-align: left;
         display: inline-block;
         width:75%;
         overflow:hidden;word-break:keep-all;white-space:nowrap;text-overflow:ellipsis;
       }
       .type{
         text-align: right;
         display: inline-block;
         width:25%;
         color: #333;
       }
      }
      .row-2{
        .count{
          text-align: left;
          display: inline-block;
          width:50%;
           color: #333;
        }
        .time{
          text-align: right;
          display: inline-block;
          width:50%;
          color:#999;
        }
      }
    }
  }
  .nodata{
    text-align: center;
    font-size: 12px;
  }
  .ivu-poptip-popper[x-placement^=bottom] .ivu-poptip-arrow:after {
    content: " ";
    top: 1px;
    margin-left: -7px;
    border-top-width: 0;
    border-bottom-width: 7px;
    border-bottom-color: #fff;
}
.ivu-poptip-popper[x-placement^=bottom] .ivu-poptip-arrow {
    top: 3px;
    border-width: 0 7px 7px;
    border-bottom-color: rgba(217,217,217,.5);
}
.ivu-poptip-arrow, .ivu-poptip-arrow:after {
    display: block;
    width: 0;
    height: 0;
    position: absolute;
    border-color: transparent;
    border-style: solid;
}
</style>
