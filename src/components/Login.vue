<template>
  <div class="container_login">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单区域 通过ref获取整个表单的实例对象 -->
      <div class="formBox">
        <el-form
          :model="loginform"
          :rules="loginFormRules"
          label-width="0px"
          ref="loginFormRef"
        >
          <!-- 用户名 -->
          <el-form-item prop="username">
            <el-input
              prefix-icon="el-icon-user"
              v-model="loginform.username"
            ></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input
              prefix-icon="el-icon-s-goods"
              v-model="loginform.password"
              type="password"
            ></el-input>
          </el-form-item>
          <!-- 按钮 -->
          <el-form-item class="btnDev">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 这是登录表单的数据绑定对象
      loginform: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证规则
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在3-8个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在6-10个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置
    resetLoginForm() {
      // 这个this指向 我们这个Vue组件
      console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      //
      this.$refs.loginFormRef.validate(async (valid) => {
        // true输入的值 有效
        console.log(valid)
        if (valid) {
          // 发送ajax请求 看后台是否有这个用户
          const { data: res } = await this.$http.post('/login', this.loginform)
          // console.log(res)
          // 说明成功了
          if (res.meta.status === 200) {
            this.$message.success('登录成功')
            // 使用session 保存登录的用户信息的token值
            window.sessionStorage.setItem('token', res.data.token)
            //  跳转界面
            this.$router.push('/home')
          } else {
            // 提示错误
            this.$message.error('登录失败')
          }
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.container_login {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: aquamarine;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: rgb(255, 255, 255);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .avatar_box {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    transform: translate(0, -75px);
    border: 1px solid #eee;
    box-shadow: 0 0 10px #ddd;
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
  .formBox {
    width: 100%;
    transform: translateY(-10%);
    padding: 0 20px;
    box-sizing: border-box;
    .btnDev {
      float: right;
      margin-right: 20px;
    }
  }
}
</style>
