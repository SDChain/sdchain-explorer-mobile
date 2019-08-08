<template>
  <div class="main">
    <div class="detail">
      <div class="left">
        <div class="img-wrapper">
          <div class="img-box">
            <img :src="info.img" class="img">
          </div>
          <div class="name">
            {{ info.currency }}
          </div>
        </div>
        <div class="ul-wrapper">
          <ul>
            <li class="line">
              <span>{{ $t('assets_detail.from') }}：</span>
              <span class="value">{{ info.address }}</span>
            </li>
            <li class="line">
              <span>{{ $t('assets_detail.amount') }}：</span>
              <span class="value">{{ info.limit }}</span>
            </li>
            <li class="line">
              <span>{{ $t('assets_detail.total') }}：</span>
              <span class="value">{{ totalCirculation }}</span>
            </li>
            <li class="line" style="margin-top: 16px;">
              <span>{{ $t('assets_detail.desc') }}：</span>
            </li>
            <li style="list-style:none;">
              <span class="value" style="word-wrap:break-word;">{{ info.desc }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="right">
        <div style="color:#3E7AEB;font-weight:600;padding-left:18px;">
          <span class="point"></span>
          {{ $t('assets_detail.trading')}}
        </div>
        <div>
          <ChartAssets :currency="this.$route.query.currency"></ChartAssets>
        </div>
      </div>
    </div>
    <div class="list">
      <Tabs value="record" type="card">
        <TabPane :label="$t('assets_detail.transactions')" name="record">
          <div class="record">
            <Table
                    :loading="loading"
                    :columns="thead"
                    :show-header="false"
                    :data="recordList"
                    size="small"
                    :no-data-text="$t('nodata')"
                    :stripe="true"
            ></Table>
            <div class="more" v-if="hasMore">
              <Button type="primary" @click="loadMore" :loading="loadingMore" ghost>{{$t('common.loadMore')}}</Button>
            </div>
          </div>
        </TabPane>

        <TabPane :label="$t('assets_detail.addrratio')" name="proportion">
          <div class="proportion">
            <Table
                    :columns="thead2"
                    :data="proportionList"
                    size="small"
                    :no-data-text="$t('nodata')"
                    :stripe="true"
            ></Table>
          </div>
        </TabPane>
      </Tabs>
    </div>
  </div>
</template>

<script>
  import {Table, Tabs, TabPane, Button} from "iview"
  import ChartAssets from "../components/ChartAssets"
  import api from "../common/api"
  import dayjs from "dayjs"
  import config from "../config"
  import BigNumber from 'bignumber.js'

  export default {
    components: {
      Table,
      Tabs,
      TabPane,
      ChartAssets,
      Button
    },
    data() {
      return {
        chartShow: true,
        totalCirculation: "",
        info: {
          img: "",
          currency: "",
          address: "",
          limit: "",
          desc: ""
        },

        recordList: [],
        marker: "",
        limit: 10,
        loading: true,
        hasMore: false,
        loadingMore: false,
        thead: [
          {
            title: '',
            key: "hash",
            render: (h, params) => {
              return h(
                "div",
                {
                  style: {
                    padding: "8px 0px"
                  }
                },
                [
                  h("div", {}, [
                    h(
                      "span",
                      {
                        style: {
                          color: "#339FFA",
                          display: "inline-block",
                          width: "70%",

                          overflow: "hidden",

                          wordBreak: "keep-all",

                          whiteSpace: "nowrap",

                          textOverflow: "ellipsis",
                          cursor: "pointer",
                          verticalAlign: 'middle'
                        },
                        on: {
                          click: () => {
                            this.$router.push({
                              path: "/hash",
                              query: {hash: params.row.hash}
                            })
                          }
                        }
                      },
                      params.row.hash
                    ),
                    h(
                      "span",
                      {
                        style: {
                          display: "inline-block",
                          width: "30%",
                          textAlign: "right",
                          color:
                            params.row.success !== "tesSUCCESS"
                              ? "red"
                              : "#515a6e"
                        }
                      },
                      params.row.type
                    )
                  ]),
                  h(
                    "div",
                    {
                      style: {}
                    },
                    [
                      h(
                        "span",
                        {
                          style: {
                            display: "inline-block",
                            width: "50%",
                            textAlign: "left",
                            color:
                              params.row.success !== "tesSUCCESS"
                                ? "red"
                                : "#515a6e"
                          }
                        },
                        params.row.num
                      ),
                      h(
                        "span",
                        {
                          style: {
                            display: "inline-block",
                            width: "50%",
                            textAlign: "right",
                            color: "#999"
                          }
                        },
                        params.row.time
                      )
                    ]
                  )
                ]
              )
            }
          }
        ],

        proportionList: [],
        page: 1,
        pageSize: 20,
        thead2: [
          {
            title: "#",
            key: "index",
            align: "left",
            width: 50
          },
          {
            title: this.$t("assets_detail.address"),
            key: "address",
            align: "center",
            render: (h, params) => {
              return h(
                "span",
                {
                  style: {
                    color: "#4da1ff",
                    cursor: "pointer",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  },
                  on: {
                    click: () => {
                      this.$router.push({
                        path: "/account",
                        query: {address: params.row.address}
                      })
                    }
                  }
                },
                params.row.address
              )
            }
          },
          {
            title: this.$t("assets_detail.number"),
            key: "num",
            align: "center"
          },
          {
            title: this.$t("assets_detail.ratio"),
            key: "proportion",
            align: "right",
            width: 100,
            render: (h, params) => {
              const rate = (params.row.proportion * 100).toFixed(2)
              const rateStr = rate < 0.01 ? '< 0.01%' : rate + '%'
              return h("span", {}, rateStr)
            }
          }
        ]
      }
    },

    created() {
      this.loading = true
      this.getDetail()
      this.getProportionList()
    },

    watch: {
      $route: {
        handler() {
          this.recordList = []
          this.proportionList = []
          this.getDetail()
          this.getProportionList()
        }
      }
    },

    methods: {
      // 二级通证信息
      getDetail() {
        this.$axios({
          url: api.secondCurrencyDetail,
          method: "get",
          params: {
            currency: this.$route.query.currency
          }
        }).then(res => {
          let data = res.data.data
          this.info = {
            img: data.logo,
            currency: data.currency,
            address: data.counterparty,
            limit: new BigNumber(data.amount).toFormat(),
            desc: data.desc
          }
          let address = data.counterparty
          this.getTotalCirculation(address)
          this.getTransactionList(address)
        }).catch(err => {
          this.$router.push("/err?err=account")
        })
      },

      // 流通总量
      getTotalCirculation(address) {
        this.$axios({
          url: api.totalCirculation,
          method: "get",
          params: {
            address: address
          }
        }).then(res => {
          if (res.data.hasOwnProperty('obligations')) {
            let obligation = res.data.obligations[this.$route.query.currency]
            this.totalCirculation = new BigNumber(obligation).toFormat()
          } else {
            this.totalCirculation = '--'
          }
        }).catch(err => {
          console.log(err)
        })
      },

      // 交易记录
      getTransactionList(account) {
        this.account = account
        this.$axios(`${api.secondCurrencyTransactionList(account)}?limit=${this.limit}&marker=${this.marker}&currency=${this.$route.query.currency}`)
          .then(res => {
            let data = res.data.transactons
            data.forEach(element => {
              this.recordList.push({
                hash: element.hash,
                success: element.result,
                type: this.getTradeType(element.type),
                num: element.amount ? element.amount : '--',
                time: dayjs(element.time).format("YYYY-MM-DD HH:mm:ss")
              })
            })
            this.loading = false
            this.marker = res.data.marker || ''
            this.hasMore = res.data.marker ? true : false
            this.loadingMore = false
          })
          .catch(err => {
            console.log(err)
          })
      },

      loadMore() {
        this.loadingMore = true
        this.getTransactionList(this.account)
      },

      //通证比例
      getProportionList() {
        let currency = this.$route.query.currency
        this.$axios({
          url: api.secondCurrencyProportion,
          method: "get",
          params: {
            page: this.page,
            rows: this.pageSize,
            currency: currency
          }
        }).then(res => {
          let data = res.data.data.resArr
          data.forEach((val, index) => {
            if (val.percent > 0) {
              this.proportionList.push({
                index: index + 1,
                address: val.counterparty,
                num: new BigNumber(val.value).toFormat(),
                proportion: val.percent
              })
            }
          })
        }).catch(err => {
          console.log(err)
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "../assets/css/main.less";

  .main {
    margin-top: 20px;

    .detail {
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
      background-color: #ffffff;
      margin-bottom: 20px;
      padding-bottom: 20px;

      .left {
        padding-top: 20px;
        padding-left: 18px;
        padding-right: 18px;

        .img-wrapper {
          width: 200px;
          height: 75px;

          .img-box {
            width: 60px;
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            float: left;

            .img {
              width: auto;
              height: auto;
              max-width: 60px;
              max-height: 60px;
            }
          }

          .name {
            margin-left: 12px;
            margin-top: 12px;
            color: #1b3591;
            font-size: 24px;
            font-weight: bold;
            float: left;
          }
        }

        .line {
          display: flex;
          list-style: none;
          margin-bottom: 0px;
          // border-bottom: 1px solid #ebebeb;
          padding-bottom: 8px;
        }
      }

      .right {
        padding-top: 25px;
        .point {
          width: 6px;
          height: 6px;
          background: #3e7aeb;
          border-radius: 50%;
          display: inline-block;
          vertical-align: middle;
        }
      }
    }

    .list {
      background-color: #ffffff;
      margin-bottom: 30px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);

      .record {
        .failure {
          color: red;
        }

        .success {
          color: #4da1ff;
        }
      }

      .proportion {
      }
    }
  }

  .more {
    text-align: center;
    padding: 30px 0;
  }

  .nodata {
    margin: 30px 30px 0px 30px;
    font-size: 15px;
    height: 250px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
    text-align: center;
    line-height: 250px;
  }

  .value {
    color: #0b0b0b;
  }
  /deep/.ivu-btn-primary[data-v-70197a97]:hover{

      background-color: none !important;

  }
</style>

