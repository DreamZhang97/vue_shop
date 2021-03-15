<template>
  <div class="container_user">
    <el-breadcrumb separator-class="el-icon-arrow-right" class="”header“">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索与添加区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList()">
            <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加</el-button>
        </el-col>
      </el-row>

      <!--表格 -->
      <el-table :data="userList" border>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column
        ><el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <!-- 添加一个 switch 开关-->
            <!-- {{ scope.row }} -->
            <el-switch v-model="scope.row.mg_state" @change="changeUserState(scope.row)"> </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190px">
          <!-- 操作也是如此 我们点修改 删除时也要获得用户的数据 -->
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-tooltip effect="dark" content="修改信息" placement="top" :enterable="false">
              <el-button type="primary" v-model="scope.row.id" icon="el-icon-edit" size="mini"></el-button>
            </el-tooltip>
            <!-- 删除 -->
            <el-tooltip effect="dark" content="删除信息" placement="top" :enterable="false">
              <el-button type="danger" v-model="scope.row.id" icon="el-icon-delete" size="mini"></el-button>
            </el-tooltip>
            <!-- 分配角色 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" v-model="scope.row.id" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <template>
        <div class="block">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          >
          </el-pagination>
        </div>
      </template>
    </el-card>
    <el-dialog title="提示" :visible.sync="addDialogVisible" width="30%">
      <span>添加用户信息</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 这是请求的参数 你穿过去什么参数 他对应给你回执信息
      queryInfo: {
        //
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示的条数
        pagesize: 2
      },
      userList: [],
      total: 0,
      addDialogVisible: false
    }
  },
  // 生命周期开始 就加载
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      //  发送axios请求 获取数据
      const { data: res } = await this.$http.get('/users', { params: this.queryInfo })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      // console.log(res)
      this.userList = res.data.users
      this.total = res.data.total
      // console.log(this.userList)
      // console.log(this.total)
    },
    // 监听pagesize 改变
    handleSizeChange(newsize) {
      // 改变页码数
      this.queryInfo.pagesize = newsize
      // 记得再次发送请求 获取新的list
      this.getUserList()
    },
    // 监听每页显示条数变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async changeUserState(userMsg) {
      console.log(userMsg)
      const { data } = await this.$http.put(`users/${userMsg.id}/state/${userMsg.mg_state}`)
      console.log(data)
      if (data.meta.status !== 200) {
        // 如果失败 需要将需改的再改变回去
        userMsg.mg_state = !userMsg.mg_state
        return this.$message.error('更新状态失败')
      }
      // 成功
      this.$message.success('更新状态成功')
    }
  }
}
</script>
<style lang="less" scoped>
.header {
  font-size: 12px;
}
.el-card {
  margin-top: 15px;
  box-shadow: -1px px rgba(92, 92, 92, 0.1) !important;
}
.el-table {
  margin-top: 10px;
}
.block {
  margin-top: 10px;
}
</style>
