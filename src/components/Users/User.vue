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
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="toEditUser(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 删除 -->
            <el-tooltip effect="dark" content="删除信息" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 分配角色 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                v-model="scope.row.id"
                icon="el-icon-setting"
                size="mini"
                @click="alloRole(scope.row)"
              ></el-button>
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
    <!-- 添加用户 -->
    <el-dialog title="提示" :visible.sync="addDialogVisible" width="30%" @close="clearForm('addFormRef')">
      <span>添加用户信息</span>
      <el-form :model="addUserForm" :rules="addFormsRules" ref="addFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input type="email" v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户 -->
    <el-dialog title="提示" :visible.sync="editDialogVisible" width="30%" @close="clearForm('editFormRef')">
      <span>修改用户信息</span>
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input type="email" v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser(editForm.id)">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色 -->
    <el-dialog title="分配角色" :visible.sync="alloRoleDialogVisible" width="30%" @close="clearAlloRole">
      <div>
        <p>当前用户名：{{ userInfo.username }}</p>
        <p>当前角色：{{ userInfo.role_name }}</p>
        <p>
          分配新角色：
          <el-select v-model="roleSelectedId" placeholder="请选择角色">
            <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"> </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="alloRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAlloRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 验证邮箱
    const emailValide = (rule, value, callback) => {
      //  邮箱的正则
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的邮箱'))
    }
    // 验证手机号
    const mobileValide = (rule, value, callback) => {
      //  邮箱的正则
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的手机号码'))
    }
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
      addDialogVisible: false,
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 表单的验证规则对象  prop指向的就是这个校验
      addFormsRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 6, message: '用户名长度在3-6个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度在6-15个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: emailValide, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: mobileValide, trigger: 'blur' }
        ]
      },
      // 修改窗口展示
      editDialogVisible: false,
      editForm: {},
      // 校验规则
      editFormRules: {
        email: [
          { required: true, trigger: 'blur', message: '请输入邮箱' },
          { validator: emailValide, trigger: 'blur' }
        ],
        mobile: [
          { required: true, trigger: 'blur', message: '请输入电话号码' },
          { validator: mobileValide, trigger: 'blur' }
        ]
      },
      // 分配角色
      alloRoleDialogVisible: false,
      // 分配角色 数据回填
      userInfo: [],
      roleList: [],
      roleSelectedId: ''
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
    },
    // 清空输入框
    clearForm(refName) {
      this.$refs[refName].resetFields()
    },
    // 添加用户
    addUser() {
      // 我们需要先预校验一下表单数据
      // 获取表单数据
      this.$refs.addFormRef.validate(async (valid) => {
        console.log(valid)
        if (!valid) return this.$message.error('请输入正确的数据')
        // 开始发送ajax请求
        const { data: res } = await this.$http.post('users', this.addUserForm)
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.addDialogVisible = false
        this.$message.success('添加成功')
        this.getUserList()
      })
    },
    // 删除用户
    async deleteUser(id) {
      //  获取到用户信息
      // alert(id)
      const { data: res } = await this.$http.delete(`users/${id}`, { id: id })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getUserList()
    },

    // 根据id查询数据
    async toEditUser(id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取用户失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    async editUser(id) {
      // 发送请求
      const { data: res } = await this.$http.put(`users/${id}`, this.editForm)
      if (res.meta.status !== 200) return this.$message.error('修改失败')
      this.editDialogVisible = false
      this.$message.success('修改成功')
      this.getUserList()
    },
    // 分配角色
    async alloRole(user) {
      this.userInfo = user
      this.alloRoleDialogVisible = true
      // 获取到所有角色
      const { data: res } = await this.$http.get('roles')
      this.roleList = res.data
    },
    // 修改分配角色
    async editAlloRole() {
      // console.log(this.roleSelectedId)
      if (!this.roleSelectedId) {
        return this.$message.error('没有选择角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.roleSelectedId })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('修改分配角色失败')
      this.alloRoleDialogVisible = false
      this.getUserList()
    },
    clearAlloRole() {
      this.roleSelectedId = ''
    }
  }
}
</script>
<style lang="less" scoped>
.header {
  font-size: 12px;
}

.el-table {
  margin-top: 10px;
}
.block {
  margin-top: 10px;
}
</style>
