<template>
  <div class="main">
    <div class="accountinfo">
      <div class="address">
        <span style="line-height: 36px; padding-right: 5px;">{{$t('wallet.wallet_address')}}</span>
        <Tooltip :disabled="true" placement="top">
          <i class="iconfont icon-erweima" @click="qr = true"></i>
        </Tooltip>
        <Tooltip :disabled="true" placement="top">
          <i class="iconfont icon-fuzhi" v-clipboard:copy="addr" v-clipboard:success="copysuc" v-clipboard:error="copyerr"></i>
        </Tooltip>
        <p>{{addr}}</p>
      </div>

      <p class="tit">{{$t('wallet.balance')}}</p>

      <div v-if="balancesList.length !== 0">
        <ul class='balance'>
          <li>
            <span class="v-1">{{balancesList[0].currency}}</span>
            <span class="v-2">{{balancesList[0].counterparty ? `(${balancesList[0].counterparty})`:''}}</span>
            <span class="kh"></span>
            <span class="v-3">{{balance}}</span>
          </li>
          <li class="assets" v-if="!issuer && balancesList[1]">
            <span class="v-1">{{ balancesList[1].currency }}</span>
            <span class="v-2">({{$t('account.issuer')}}:{{balancesList[1].counterparty}}</span>
            <span class="kh">)</span><span class="v-3">{{ secondBalance }}</span>
          </li>
        </ul>
      </div>
      <div class="show-more" v-if="!issuer && balancesList[2]">
        <a href="javascript:;" @click="more">{{$t('wallet.more')}}>></a>
      </div>
    </div>
    <div class="accountlist">
      <Table :columns="thead" :data="data" size="small" :no-data-text="$t('nodata')" :loading="loading"
             :stripe="true"></Table>
    </div>
    <div class="more" v-if="hasMore">
      <Button type="primary" ghost @click="loadMore" :loading="loadingMore">{{$t('common.loadMore')}}</Button>
    </div>
    <Modal
            :title="$t('wallet.wallet_address')"
            footer-hide
            v-model="qr"
            class-name="vertical-center-modal">
      <div style="text-align:center;">
        <vue-qr :text="addr" :logoSrc="logoSrc" colorDark="#000" :size="200" :logoScale="0.3" :margin="0"></vue-qr>
      </div>
      <div class="w-addr">{{addr}}</div>
    </Modal>
  </div>
</template>

<script>
  import {Table, Button, Breadcrumb, BreadcrumbItem, Modal, Tooltip} from 'iview'
  import api from '../common/api'
  import VueQr from 'vue-qr'
  import dayjs from 'dayjs'
  import BigNumber from 'bignumber.js'

  export default {
    name: 'Account',
    components: {Table, Button, Breadcrumb, BreadcrumbItem, Modal, VueQr, Tooltip},
    data() {
      return {
        balance: 0,
        secondBalance: 0,
        issuer: '',

        qr: false,
        addr: this.$route.query.address,
        logoSrc: require('../assets/images/qrlogo.png'),
        choose: '',
        balancesList: [],

        thead: [
          {
            title: this.$t('wallet.hash'),
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
                          textAlign: "right",
                          color: param.row.sourceType == 'Payment' ? (this.$route.query.address == param.row.destination ? '#228B22': '#FF4500') : '#515b6e'
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
          }],
        data: [],
        loading: true,
        limit: 15,
        marker: '',
        hasMore: false,
        loadingMore: false,
      }
    },
    created() {
      this.isIssuer()
      this.accounts()
      this.balances()
    },
    watch: {
      '$route.query.address'() {
        this.marker = ''
        this.data = []
        this.addr = this.$route.query.address
        this.isIssuer()
        this.accounts()
        this.balances()
      }
    },
    methods: {
      //判断是否是发行商
      isIssuer() {
        this.$axios({
          url: api.isIssuer,
          method: 'get',
          params: {
            address: this.$route.query.address
          }
        }).then(res => {
          this.issuer = res.data.settings.default_spread
        }).catch(err => {
          console.log(err)
        })
      },

      copysuc(e) {
        this.$Message.success(this.$t('copysuc'))
      },
      copyerr(e) {
        this.$Message.error(this.$t('copyerr'))
      },
      balances() {
        this.$axios(`${api.balances}/${this.$route.query.address}`).then(res => {
          this.balancesList = res.data.balances
          this.balance = new BigNumber(res.data.balances[0].value).toFormat()
          if (res.data.balances[1]) {
            this.secondBalance = new BigNumber(res.data.balances[1].value).toFormat()
          }
        }).catch(err => {
          this.$router.push('/err?err=account')
        })
      },
      accounts() {
        this.$axios(`${api.accounts}/${this.$route.query.address}/transactions?marker=${this.marker}&limit=${this.limit}`).then(res => {
          const list = res.data.transactons
          if (list.length > 0) {
            list.map(data => {
              this.data.push({
                hash: data.hash,
                type: data.type == 'TrustSet' ? this.$t('common.trustSet') :
                      data.type == 'AccountSet' ? this.$t('common.accountSet') :
                      data.type == 'OfferCreate' ? this.$t('common.offerCreate') :
                      data.type == 'OfferCancel' ? this.$t('common.offerCancel') :
                      data.type == 'MultiPayment' ? this.$t('common.multiPayment') :
                      data.type == 'Payment' ? (this.$route.query.address == data.destination ? this.$t('wallet.incoming') : this.$t('wallet.outgoing')) :
                      this.$t('common.other'),
                count: data.amount ? data.amount : '--',
                time: dayjs(data.time).format('YYYY-MM-DD HH:mm:ss'),
                destination: data.destination,
                sourceType: data.type
              })
            })
          }
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
        this.accounts()
      },

      //二级通证更多
      more() {
        this.$router.push({path: '/assetslist', query: {address: this.$route.query.address}})
      }
    },

  }
</script>

<style lang="less" scoped>
  @import '../assets/css/var.less';

  .accountinfo {
    .box();
    padding: 0px 0px 10px;
    margin-bottom: 20px;
    overflow: hidden;
    width: 100%;

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

    .balance {
      li {
        width: 100%;
        list-style: none;
        line-height: 30px;
        position: relative;
        padding: 5px 18px;

        &:after {
          .setBottomLine();
        }

        &:nth-child(even) {
          background-color: #fff;
        }

        &:nth-child(odd) {
          background-color: #F4F4F4;
        }

        .val {
          color: #4b5065;
          float: right;
          padding-right: 30px;
        }

        &.assets {
          width: 100%;
          // margin-left: 10%;
          .uni {
            color: @sdc-mainColor1;
            padding-left: 10px;
            color: #4b5065;
          }

          a {
            float: right;
            color: #7c7c7c;
          }
        }

        .v-1 {
          display: inline-block;
          width: 15%;
          text-align: left;
          font-size: 12px;
          color: #333;
        }

        .v-2 {
          display: inline-block;
          width: 40%;
          vertical-align: middle;
          text-align: center;
          overflow: hidden;
          word-break: keep-all;
          white-space: nowrap;
          text-overflow: ellipsis;
          color: #999;
          font-size: 12px;
        }

        .v-3 {
          display: inline-block;
          width: 40%;
          text-align: right;
          font-size: 12px;
          color: #333;
        }

        .kh {
          display: inline-block;
          width: 5%;
          text-align: left;
          font-size: 12px;
          color: #999;
        }
      }
    }

    .show-more {
      margin-top: 10px;

      a {
        width: 90%;
        margin: 10px auto;
        display: block;
        background-color: #4481F6;
        color: #fff;
        text-align: center;
        line-height: 30px;
        border-radius: 4px;
      }
    }

    .address {
      color: #666;
      padding: 10px 15px 10px 18px;
      background-color: #F3F3F3;
    }

    .rinfo, .linfo {
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

    .tit {
      padding: 10px 18px;
      color: #333;
    }
  }

  .accountlist {
    .box();
  }

  .more {
    text-align: center;
    padding: 30px 0;
  }

  .w-tit {
    font-size: 22px;
    color: #515a6e;
    text-align: center;
  }

  .w-addr {
    font-size: 14px;
    color: #666;
    text-align: center;
  }

  .value {
    color: #4b5065;
  }
</style>
