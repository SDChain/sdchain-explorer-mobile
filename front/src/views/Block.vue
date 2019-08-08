<template>
  <div class="main">
    <div class="blocklist">
      <p>{{$t('block.tit')}}</p>
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
  import BigNumber from 'bignumber.js'

  export default {
    name: 'Block',
    components: {
      Table, Button
    },
    data() {
      return {
        loading: false,
        limit: 15,
        marker: '',
        hasMore: false,
        loadingMore: false,
        thead: [
          {
            title: this.$t('block.head')[0],
            key: 'height',
            width: 120,
            render: (h, param) => {
              return h('router-link', {
                  style: 'color:#4ea1fd;textAlign:left;',
                  props: {
                    to: '/block/detail?block=' + param.row.height
                  },
                },
                param.row.height
              )
            }
          },
          {
            title: this.$t('block.head')[1],
            key: 'hash',
            align: 'center',
            render: (h, param) => {
              return h(
                'span', {
                  style: {
                    display: 'inline',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    // wordBreak: 'keep-all',
                  }
                },
                param.row.hash
              )
            }
          },
          {
            title: this.$t('block.head')[2],
            key: 'count',
            align: 'right',
            width: 100
          }
        ],
        data: [],
      }
    },
    created() {
      this.ledgers()
    },
    methods: {
      ledgers() {
        this.$axios(`${api.ledgers}?limit=${this.limit}&marker=${this.marker}`).then(res => {
          const list = res.data.ledgers
          list.map(data => {
            this.data.push({
              height: data.ledger_index,
              hash: data.ledger_hash,
              count: new BigNumber(data.transactions_count).toFormat(),
              time: dayjs(data.close_time * 1000).format('YYYY-MM-DD HH:mm:ss'),
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
        this.ledgers()
      }
    }
  }
</script>

<style lang="less" scoped>
  @import '../assets/css/var.less';

  .blocklist {
    .box();
    background-color: #fff;

    p {
      padding: 10px 0;
      padding-left: 18px;
      color: #333;
      font-weight: 600;
    }
  }

  .more {
    text-align: center;
    padding: 30px 0;
  }
</style>
