<template>
  <div class="main">
    <div class="historylist">
      <Table :columns="thead" :data="data" size="default" :no-data-text="$t('nodata')" :loading="loading"
             :stripe="true"></Table>
    </div>
    <div class="more" v-if="hasMore">
      <Button type="primary" @click="loadMore" :loading="loadingMore" ghost>{{$t('common.loadMore')}}</Button>
    </div>
  </div>
</template>

<script>
  import {Table, Button} from 'iview'
  import api from '../common/api'
  import dayjs from 'dayjs'

  export default {
    name: 'History',
    components: {Table, Button},
    data() {
      return {
        loading: true,
        limit: 15,
        marker: '',
        hasMore: false,
        loadingMore: false,
        thead: [
          {
            title: this.$t('history.tit'),
            key: 'hash',
            render: (h, param) => {
              return h('div', {
                  style: {
                    padding: '8px 0px'
                  }
                },
                [
                  h('div', {}, [
                    h('router-link', {
                        style: {
                          color: '#339FFA',
                          display: 'inline-block',
                          width: '70%',
                          overflow: 'hidden',
                          wordBreak: 'keep-all',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        },
                        props: {
                          to: '/hash?hash=' + param.row.hash
                        },
                      },
                      param.row.hash
                    ),
                    h('span', {
                        style: {
                          display: 'inline-block',
                          width: '30%',
                          textAlign: "right"
                        }
                      },
                      param.row.type
                    ),
                  ]),
                  h('div', {
                    style: {}
                  }, [
                    h('span', {
                        style: {
                          display: 'inline-block',
                          width: '50%',
                          textAlign: "left"
                        }
                      },
                      param.row.count
                    ),
                    h('span', {
                        style: {
                          display: 'inline-block',
                          width: '50%',
                          textAlign: "right",
                          color: '#999'
                        }
                      },
                      param.row.time
                    ),
                  ]),
                ]
              );
            }
          },
        ],
        data: [],
      }
    },
    created() {
      this.getTransactionsList()
    },
    methods: {
      getTransactionsList() {
        this.$axios(`${api.transactions}?limit=${this.limit}&marker=${this.marker}`).then(res => {
          const list = res.data.transactons
          list.map(data => {
            this.data.push({
              hash: data.hash,
              type: this.getTradeType(data.type),
              count: data.amount ? data.amount : '--',
              time: dayjs(data.time).format('YYYY-MM-DD HH:mm:ss'),
            })
          })
          this.loading = false
          this.marker = res.data.marker || ''
          this.hasMore = res.data.marker ? true : false
          this.loadingMore = false
        }).catch(err => {
          console.log(err)
        })
      },
      loadMore() {
        this.loadingMore = true
        this.getTransactionsList()
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../assets/css/var.less';

  .historylist {
    .box();
    background-color: #fff;

    & > span {
      padding-left: 15px;
    }
  }

  .more {
    text-align: center;
    padding: 30px 0;
  }

  /deep/ .ivu-table {
    width: 100%;
  }
  /deep/.ivu-table-wrapper{
    width:100%;
  }
</style>
