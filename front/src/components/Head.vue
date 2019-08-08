<template>
  <div class="head">
    <div class="main">
      <Logo class="tlogo"/>
      <div class="rpart">
        <div class="search">
          <i class="iconfont icon-sousuo" @click="showSearch=!showSearch;key=''"></i>
        </div>
        <div class="more">
          <Poptip v-model="poptipVisible" width="30" placement="bottom-end">
            <i class="iconfont icon-caidan"></i>
            <div class slot="content">
              <div class="menu-item">
                <a @click="jump('/')">{{$t('menu.home')}}</a>
              </div>
              <div class="menu-item">
                <a @click="jump('/block')">{{$t('menu.block')}}</a>
              </div>
              <div class="menu-item">
                <a @click="jump('/assets')">{{$t('menu.assets')}}</a>
              </div>
              <div class="menu-item">
                <a @click="jump('/history')">{{$t('menu.history')}}</a>
              </div>
              <div class="fenge"></div>
              <div class="menu-item">
                <a @click="handleLang('cn')">简体中文</a>
              </div>
              <div class="menu-item">
                <a @click="handleLang('tw')">繁體中文</a>
              </div>
              <div class="menu-item">
                <a @click="handleLang('en')">English</a>
              </div>
            </div>
          </Poptip>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="search-input" v-if="showSearch==true">
        <div class="triangle_border_up">
          <span></span>
        </div>
        <Input v-model="key" @on-search="handleSearch" :placeholder="$t('search')" style="width: auto"/>
        <i class="iconfont icon-huiche" @click="handleSearch"></i>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from "./Logo";
import {
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Icon,
  Poptip,
  Input
} from "iview";
import Search from "./Search";
import { list } from "../lang";
import api from "../common/api";
export default {
  inject: ["reload"],
  name: "Head",
  components: {
    Logo,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Icon,
    Search,
    Poptip,
    Input
  },
  data() {
    return {
      menu: [
        {
          tit: "home",
          url: "/"
        },
        {
          tit: "block",
          url: "/block"
        },
        {
          tit: "assets",
          url: "/assets"
        },
        {
          tit: "history",
          url: "/history"
        }
      ],
      langList: list,
      showSearch: false,
      key: "", //搜索
      poptipVisible: false
    };
  },
  mounted() {},
  methods: {
    jump(url) {
      this.$router.push(url);
      this.poptipVisible = false;
    },
    handleLang(val) {
      this.poptipVisible = false;
      localStorage.Lang = val;
      this.$i18n.locale = val;
      this.reload();
    },
    handleSearch() {
      if (this.key) {
        const kw = this.key;
        if (kw.length <= 15) {
          let reg = /^[0-9]*$/;
          if (reg.test(kw)) {
            this.$axios(`${api.ledgers}/${kw}`)
              .then(res => {
                this.$router.push(`/block/detail?block=${kw}`);
              })
              .catch(err => {
                this.$router.push("/err?err=block");
              });
          } else {
            const KW = kw.toLocaleUpperCase();
            this.$axios({
              url: api.secondCurrencyDetail,
              method: "get",
              params: {
                currency: KW
              }
            })
              .then(res => {
                let code = res.data.data.code;
                if (code == "E00001") {
                  this.$router.push("/err?err=account");
                } else {
                  this.$router.push(`/assets/detail?currency=${KW}`);
                }
              })
              .catch(err => {
                this.$router.push("/err?err=account");
              });
          }
        }
        if (kw.length > 15 && kw.length <= 40) {
          this.$axios(`${api.balances}/${kw}`)
            .then(res => {
              this.$router.push(`/account?address=${kw}`);
            })
            .catch(err => {
              this.$router.push("/err?err=account");
            });
        }
        if (kw.length > 40) {
          this.$axios(`${api.transactions}/${kw}`)
            .then(res => {
              this.$router.push(`/hash?hash=${kw}`);
            })
            .catch(err => {
              this.$router.push("/err?err=hash");
            });
        }

        this.key = "";
      } else {
        //输入框拉长时，如无内容，提示无输入内容
        if (this.isfocus === false) {
          this.$Message.warning(this.$t("searcherr"));
        }
      }
    }
  }
};
</script>

<style scoped lang="less">
@import url("../assets/css/var.less");
.head {
  // background:  url('../assets/images/headbg.png') no-repeat;
  background: -webkit-gradient(
    linear,
    0 50%,
    100% 50%,
    from(#427ef6),
    to(#2f64cc)
  );
  background-size: 100% 100%;
  // border-bottom: 1px solid #DDDCDC;
  .tlogo {
    display: inline-block;
    line-height: 50px;
    height: 50px;
  }
  .rpart {
    display: inline-block;
    text-align: right;
    float: right;
    .iconfont {
      color: #fff;
      font-size: 20px;
    }
    .search {
      display: inline-block;
      line-height: 50px;
      vertical-align: middle;
    }
    .more {
      display: inline-block;
      margin-right: 10px;
      margin-left: 15px;
      line-height: 50px;
      vertical-align: middle;
      .menu-item {
        text-align: center;
        a {
          display: block;
          padding: 5px 0;
          color: #666;
        }
      }
      .fenge {
        position: relative;
        &:after {
          .setBottomLine();
        }
      }
    }
  }
  .search-input {
    position: relative;
    top: -5px;
    .icon-huiche {
      color: #fff;
      position: absolute;
      top: 7px;
      right: 20px;
      font-size: 18px;
    }
    input {
      border: none;
    }
  }
  .menu {
    display: inline-block;
    vertical-align: middle;
    text-align: right;
    font-size: 15px;
    ul {
      display: inline-block;
      vertical-align: middle;
      padding-right: 15px;
      li {
        float: left;
        list-style: none;
        cursor: pointer;
        color: @txtColor1;
        display: block;
        height: 50px;
        line-height: 50px;
        &.a-cur {
          background: #73b1fa;
        }
        a {
          // color:#2B334E;
          color: #000;
          padding: 5px 18px;
          &:hover {
            font-weight: bold;
          }
        }
        &.cur {
          position: relative;
          &::after {
            content: "";
            position: absolute;
            bottom: -1px;
            width: 100%;
            height: 2px;
            left: 0;
          }
        }
        &.cur,
        &:hover {
          color: @txtColor2;
        }
      }
    }
  }
  .lang {
    display: inline-block;
    vertical-align: middle;
    font-size: 12px;
    i {
      display: inline-block;
      font-size: 20px;
      opacity: 0.5;
      margin-right: 5px;
    }
    span {
      color: #6d5353;
      display: inline-block;
    }
    .langlist {
      position: relative;
      top: -3px;
      a {
        color: #000;
      }
      li {
        text-align: center;
      }
    }
  }
}
.ivu-input {
  font-size: 12px;
}
.white-color {
  color: #000;
}
/deep/.ivu-poptip-popper[x-placement="bottom-end"] .ivu-poptip-arrow {
  right: 4px;
}
/deep/.ivu-poptip-content {
  width: 160px;
  float: right;
}
/deep/.ivu-poptip-body {
  padding: 8px 0;
}
/deep/.ivu-input-wrapper {
  width: 94% !important;
  margin-left: 3%;
  margin-bottom: 10px;
  border: 1px solid #6597FB;
  border-radius: 2px;
}
/deep/.ivu-input {
  padding-left: 0px;
  border: none;
  background-color: transparent !important;
  &:focus {
    border: none;
  }
}
/deep/.ivu-input-with-suffix {
  border-bottom: none;
}
/deep/.ivu-input-default{
  width: 90%;
}
/*向上*/
.triangle_border_up {
  width: 0;
  height: 0;
  border-width: 0 3px 3px;
  border-style: solid;
  border-color: transparent transparent transparent; /*透明 透明  灰*/
  margin-left: 84%;
  position: relative;
  text-align: right;
}
.triangle_border_up span {
  display: block;
  width: 0;
  height: 0;
  border-width: 0 3px 3px;
  border-style: solid;
  border-color: transparent transparent #6597FB; /*透明 透明  黄*/
  position: absolute;
  top: 0px;
}
</style>
