<template>
  <div class="main">
    <div class="info">
      <div class="tit">
        {{$t('block.tit')}}#
        <span class="err colo">{{$route.query.block}}</span>
      </div>
      <div class="body">
        <table>
          <tr>
            <td>
              <span>{{$t('block.info')[0]}}</span>
              <span class="res">{{info.transactions_count}}</span>
            </td>
          </tr>
          <tr>
            <td>
              <span>{{$t('block.info')[1]}}</span>
              <span class="res">{{info.ledger_index}}</span>
            </td>
          </tr>
          <tr>
            <td>
              <span>{{$t('block.info')[2]}}</span>
              <span class="res">{{ getime(info.close_time) }}</span>
            </td>
          </tr>
        </table>
        <table>
          <tr>
            <td>
              <span :title="$t('block.info')[3]">{{$t('block.info')[3]}}</span>
              <span :title="info.ledger_hash" class="res">{{info.ledger_hash}}</span>
            </td>
          </tr>
          <tr>
            <td>
              <span :title="$t('block.info')[4]">{{$t('block.info')[4]}}</span>
              <span :title="info.transaction_hash" class="res">{{info.transaction_hash}}</span>
            </td>
          </tr>
          <tr>
            <td>
              <span :title="$t('block.info')[5]">{{$t('block.info')[5]}}</span>
              <span
                      :title="info.parent_ledger_hash"
                      @click="parentLedger"
                      class="err mcolo"
              >{{info.parent_ledger_hash}}</span>
            </td>
          </tr>
        </table>
      </div>
    </div>
    <div class="historylist">
      <Table
              :columns="thead"
              :data="data"
              size="large"
              :no-data-text="$t('nodata')"
              :loading="loading"
      ></Table>
    </div>
    <div class="more" v-if="hasMore">
      <Button type="primary" @click="loadMore" :loading="loadingMore" ghost>{{$t('common.loadMore')}}</Button>
    </div>
  </div>
</template>

<script>
  import {Table, Button} from "iview"
  import api from "../common/api"
  import dayjs from "dayjs"

  export default {
    name: "TokenHistory",
    components: {Table, Button},
    data() {
      return {
        loading: true,
        limit: 15,
        page: 1,
        hasMore: false,
        loadingMore: false,

        info: {},
        thead: [
          {
            title: this.$t("history.tit"),
            key: "hash",
            render: (h, param) => {
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
                      "router-link",
                      {
                        style: {
                          color: "#339FFA",
                          display: "inline-block",
                          width: "70%",

                          overflow: "hidden",

                          wordBreak: "keep-all",

                          whiteSpace: "nowrap",

                          textOverflow: "ellipsis"
                        },
                        props: {
                          to: "/hash?hash=" + param.row.hash
                        }
                      },
                      param.row.hash
                    ),
                    h(
                      "span",
                      {
                        style: {
                          display: "inline-block",
                          width: "30%",
                          textAlign: "right"
                        }
                      },
                      param.row.type
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
                            textAlign: "left"
                          }
                        },
                        param.row.fee + " " + this.$config.currency
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
                        param.row.time
                      )
                    ]
                  )
                ]
              )
            }
          }
        ],
        data: []
      }
    },
    created() {
      this.getLedgers(this.$route.query.block)
      this.getTransactionsList(this.$route.query.block)
    },
    watch: {
      "$route.query.block"() {
        this.getLedgers(this.$route.query.block)
        this.getTransactionsList(this.$route.query.block, true)
      }
    },
    methods: {
      getTransactionsList(val, clear) {
        clear && (this.data = [])
        this.$axios(`${api.transactions}?ledger=${val}&page=${this.page}&limit=${this.limit}`)
          .then(res => {
            const list = res.data.transactons
            if (list.length > 0) {
              list.map(data => {
                this.data.push({
                  type: this.getTradeType(data.type),
                  hash: data.hash,
                  account: data.account,
                  fee: data.fee ? data.fee : "--",
                  time: dayjs(data.time).format("YYYY-MM-DD HH:mm:ss")
                })
              })
            }
            this.loading = false
            this.hasMore = res.data.marker ? true : false
            this.loadingMore = false
          })
          .catch(err => {
            console.log(err)
          })
      },
      loadMore() {
        this.loadingMore = true
        this.page++
        this.getTransactionsList(this.$route.query.block)
      },
      getLedgers(val) {
        if (val) {
          this.$axios(`${api.ledgers}/${val}`)
            .then(res => {
              this.info = res.data.ledger
            })
            .catch(err => {
              this.$router.push("/err?err=block")
            })
        } else {
          this.$router.push("/err?err=block")
        }
      },
      parentLedger() {
        this.$router.push("/block/detail?block=" + (this.$route.query.block - 1))
      },
      getime(val) {
        return val && dayjs(val * 1000).format("YYYY-MM-DD HH:mm:ss")
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "../assets/css/var.less";

  .info {
    .tit {
      padding: 0 18px;
      background: #f5f5f5;
      line-height: 40px;
      color: #666;

      span {
        color: #666;
      }
    }

    .body {
      overflow: hidden;
      padding: 5px 9px;

      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed; /*让span,可设置3个点*/

        &:nth-child(1) {
          tr {
            &:nth-child(even) {
              background-color: #f3f3f3;
            }

            &:nth-child(odd) {
              background-color: #fff;
            }
          }
        }

        &:nth-child(2) {
          tr {
            &:nth-child(even) {
              background-color: #fff;
            }

            &:nth-child(odd) {
              background-color: #f3f3f3;
            }
          }
        }

        tr {
          width: 100%;

          td {
            line-height: 40px;
            padding: 0 10px;
            white-space: nowrap; /*控制单行显示*/
            overflow: hidden; /*超出隐藏*/
            text-overflow: ellipsis; /*隐藏的字符用省略号表示*/

            span {
              &:first-child {
                display: inline-block;
                width: 40%;
                text-align: left;
              }

              &:last-child {
                width: 60%;
                text-align: right;
                padding-left: 20px;
                vertical-align: middle;
                display: inline-block;
                overflow: hidden;

                word-break: keep-all;

                white-space: nowrap;

                text-overflow: ellipsis;
              }
            }
          }
        }
      }

      .mcolo {
        color: @sdc-mainColor1;
      }
    }
  }

  .historylist {
    .box();
    margin-top: 20px;

    .tab {
      padding: 10px;
    }
  }

  .more {
    text-align: center;
    padding: 30px 0;
  }

  .colo {
    color: @sdc-txtColor3;
  }

  .res {
    // color:#4b5065
    color: #0b0b0b;
  }
</style>
