<template>
  <el-container class="home_container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="exit">退出</el-button>
    </el-header>
    <!-- 主体部分 -->
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="changeCollaps">||||</div>
        <el-menu
          class="el-menu-vertical-demo"
          background-color="#545c64"
          active-text-color="#f409eff"
          text-color="#fff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path + ''"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              {{ subItem.authName }}
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体部分 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script lang="ts">
export default {
  // 代表这个组件一旦建立，就执行
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data() {
    return {
      menuList: [],
      iconObj: {
        125: 'el-icon-user',
        103: 'el-icon-box',
        101: 'el-icon-goods',
        102: 'el-icon-shopping-cart-full',
        145: 'el-icon-s-platform'
      },
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  methods: {
    exit() {
      window.sessionStorage.clear()
      //   退出
      this.$router.push('/login')
    },
    async getMenuList() {
      // 发送axios
      const { data: res } = await this.$http.get('/menus')
      //   console.log(res)
      // 第一步先判断 是否获取到列表
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      //  否则就是成功
      this.menuList = res.data
      // console.log(this.menuList)
    },
    changeCollaps() {
      this.isCollapse = !this.isCollapse
    },
    // 通过点击 将其path传入到函数中，然后在浏览器的session中存入 每当点击的时候，就获取到这个名称，然后传递给上述绑定的activePath
    saveNavState(activePath) {
      console.log(activePath)
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>
<style lang="less" scoped>
.home_container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  color: azure;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 20px;
      font-size: 25px;
    }
  }
}
.el-aside {
  background-color: #333744;
}
.el-container {
  background: #eaedf1;
}
.tac {
  width: 100%;
}
.el-submenu [class^='el-icon-'] {
  font-size: 22px;
  margin-right: 10px;
}
.el-menu {
  border-right: 0;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 12px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
