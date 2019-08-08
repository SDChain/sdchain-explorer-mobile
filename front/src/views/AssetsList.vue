<template>
  <div class="main">
    <div class="accountinfo">
      <div class="address">
        <p>{{$t('wallet.wallet_address')}}：</p>
        <a @click="$router.push(`/account?address=${addr}`)" class="hash">{{addr}}</a>
        <Tooltip :disabled="true" placement="top">
          <i
            class="iconfont icon-fuzhi"
            v-clipboard:copy="addr"
            v-clipboard:success="copysuc"
            v-clipboard:error="copyerr"
          ></i>
        </Tooltip>
      </div>
    </div>
    <div class="accountlist">
      <h4 class="h4">{{ $t('wallet.passport')}}</h4>
      <Table
        :columns="thead"
        :data="data"
        size="small"
        :no-data-text="$t('nodata')"
        :loading="loading"
        :stripe="true"
      ></Table>
    </div>
    <div class="more" v-if="hasMore">
      <Button type="primary" ghost @click="loadMore" :loading="loadingMore">{{$t('common.loadMore')}}</Button>
    </div>
  </div>
</template>

<script>
import {
  Table,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  Tooltip,
} from "iview"
import api from "../common/api"
import BigNumber from 'bignumber.js'

export default {
  name: "Account",
  components: {
    Table,
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Tooltip,
  },
  data() {
    return {
      loading: true,
      limit: 10,
      hasMore: false,
      loadingMore: false,
      qr: false,
      addr: this.$route.query.address,
      thead: [
        {
          title: this.$t('wallet.token'),
          key: "issuer",
          align: "left",
          render: (h, param) => {
              return h('div', [
                  h('span', {
                    style: {
                      display: 'inline-block',
                      width: '40px',
                      color: '#666',
                      verticalAlign: 'top'
                    }
                  }, param.row.currency),
                  h('span', {
                    style: {
                      color: '#999',
                      'padding-left': '10px',
                      display: 'inline-block',
                      overflow: 'hidden',
                      width: '78%',
                      wordBreak: 'keep-all',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      verticalAlign: 'top'
                    }
                  }, `${this.$t('wallet.from')}：${param.row.issuer}`)
              ])
          }
        },
        {
          title: this.$t('wallet.quantity'),
          key: "num",
          align: "right",
           width:'100',
           render: (h, param) => {
              return h('span',{
                style: {
                        color: '#0b0b0b',
                      }
              },param.row.num)
           }
        }
      ],
      data: []
    };
  },
  created() {
    this.balances()
  },
  watch: {
    "$route.query.address"() {
      this.data = [];
      this.balances();
    }
  },
  methods: {
    copysuc(e) {
      this.$Message.success(this.$t("copysuc"));
    },
    copyerr(e) {
      this.$Message.error(this.$t("copyerr"));
    },
    balances() {
      this.data = []
      this.$axios(`${api.balances}/${this.$route.query.address}?limit=${this.limit}`)
        .then(res => {
          let balances = res.data.balances;
          for (let i = 1; i < balances.length; i++) {
              this.data.push({
                  issuer: balances[i].counterparty,
                  currency: balances[i].currency,
                  num: new BigNumber(balances[i].value).toFormat(),
              })
          }
          this.hasMore = res.data.marker ? true : false
          this.loading = false
          this.loadingMore = false
        })
        .catch(err => {
            console.log(err)
        });
    },

    loadMore() {
      this.loadingMore = true
      this.limit = this.limit + 10;
      this.balances();
    }
  }
};
</script>

<style lang="less" scoped>
@import "../assets/css/var.less";

.accountinfo {
  .box();
  background-color: #f3f3f3;

  .iconfont {
    font-size: 18px;
    cursor: pointer;
    color: #333;
    padding: 3px;
  }

  .balance {
    li {
      float: left;
      width: 45%;
      list-style: none;
      line-height: 30px;
      border-bottom: 1px solid #dddcdc;
      .val {
        float: right;
        padding-right: 30px;
      }
      &.assets {
        float: left;
        width: 45%;
        margin-left: 10%;
        .uni {
          color: @sdc-mainColor1;
        }
        a {
          float: right;
          color: #7c7c7c;
        }
      }
    }
  }
  .address {
    margin-bottom: 8px;
    padding: 15px 15px 5px 18px;
    color: #666;
    span{
      color: #4983F8;
    }
  }
  .rinfo,
  .linfo {
    list-style: none;
    display: inline-block;
    width: 50%;
  }
  .rinfo {
    text-align: right;
    .select {
      text-align: left;
      margin-left: 20px;
    }
  }
}
.accountlist {
  .box();
  .h4 {
    color: #666;
    padding: 10px 10px 10px 18px;
  }
}
.more {
  text-align: center;
  padding: 30px 0;
}
</style>
