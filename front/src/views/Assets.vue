<template>
  <div class="main">
    <div class="contentwrap">
      <div class="blocklist">
        <h1>{{$t('assets.tit')}}</h1>
        <Table
                :columns="thead"
                :data="data"
                size="default"
                :loading="loading"
                :no-data-text="$t('nodata')"
                :stripe="true"
        ></Table>
      </div>
      <div class="more" v-if="hasMore">
        <Button @click="loadMore" :loading="loadingMore" type="primary" ghost>{{$t('common.loadMore')}}</Button>
      </div>
    </div>
  </div>
</template>

<script>
  import {Table, Button} from "iview"
  import api from "../common/api"
  import BigNumber from 'bignumber.js'

  export default {
    name: "assets",
    components: {Table, Button},
    data() {
      return {
        loading: true,
        limit: 10,
        page: 1,

        hasMore: false,
        loadingMore: false,

        thead: [
          {
            title: this.$t("assets.number"),
            key: "num",
            align: "left",
            width: 50,
          },
          {
            title: this.$t("assets.tit2"),
            key: "name",
            render: (h, param) => {
              return h('div', {
                style: {
                  cursor: 'pointer',
                  width: '100%',
                  height: '80px'
                },
                on: {
                  click: () => {
                    this.$router.push({path: `/assets/detail`, query: {currency: param.row.name}})
                  }
                }
              }, [
                h('div', {
                  style: {
                    width: '62px',
                    height: '62px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    float: 'left',
                    marginTop: '10px',
                    border: '1px solid #ddd',
                  }
                }, [
                  h('img', {
                    attrs: {
                      src: param.row.pic
                    },
                    style: {
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '60px',
                      maxHeight: '60px',
                    },
                  }),
                ]),

                h('div', {
                  style: {
                    'padding-left': '70px',
                    'padding-top': '10px'
                  }
                }, [
                  h('p',
                    {
                      style: {
                        color: '#4380F7'
                      }
                    },
                    param.row.name),
                  h(
                    "span",
                    {
                      style: {
                        color: "#333",
                        cursor: "pointer",
                        display: 'block',
                        overflow: 'hidden',
                        wordBreak: 'keep-all',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }
                    },
                    this.$t('assets.tit3') + `：${param.row.addr}`
                  )
                ]),

              ])
            },
            align: "left"
          }
        ],
        data: []
      }
    },

    created() {
      this.getList()
    },

    methods: {
      getList() {
        this.$axios({
          url: api.secondCurrencyList,
          params: {
            page: this.page,
            rows: this.limit
          }
        }).then(res => {
          let list = res.data.data.currencyList
          list.forEach((val, index) => {
            this.data.push({
              num: (this.page - 1) * this.limit + index + 1,
              name: val.currency,
              pic: val.pic,
              description: val.description,
              addr: val.counterparty,
              totalCount: new BigNumber(val.limit).toFormat()
            })
          })

          if (res.data.data.currencyList.length < this.limit) {
            this.hasMore = false
          } else {
            this.hasMore = true
          }

          this.loading = false
          this.loadingMore = false
        }).catch(err => {
          console.log(err)
        })
      },

      loadMore() {
        this.page++
        this.loadingMore = true
        this.getList()
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "../assets/css/var.less";

  .more {
    text-align: center;
    padding: 30px 0;
  }

  .blocklist {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
    margin-bottom: 30px;
    background-color: #fff;

    h1 {
      padding-top: 10px;
      padding-left: 15px;
    }
  }
</style>
