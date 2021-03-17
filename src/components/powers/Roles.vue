<template>
  <div class="roles_container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-table :data="roleList" border>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item, i) in scope.row.children"
              :key="item.id"
              :class="['bm', i === 0 ? 'bt' : '', 'vcneter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  :disable-transitions="false"
                  @close="removeRightById(scope.row, item.id)"
                  class="tagMargin"
                  >{{ item.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row v-for="(item1, i2) in item.children" :key="item1.id" :class="[i2 === 0 ? '' : 'bt', 'vcneter']">
                  <el-col :span="6">
                    <el-tag
                      closable
                      :disable-transitions="false"
                      @close="removeRightById(scope.row, item1.id)"
                      class="tagMargin"
                      type="success"
                      >{{ item1.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      :disable-transitions="false"
                      @close="removeRightById(scope.row, item2.id)"
                      v-for="item2 in item1.children"
                      :key="item2.id"
                      class="tagMargin tMargin"
                      type="warning"
                      >{{ item2.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"> </el-table-column>
        <el-table-column label="角色名称" prop="roleName"> </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" v-model="scope.row.id">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete">删除</el-button>
            <el-button type="warning" icon="el-icon-star-off" @click="showRightsDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限显示窗口 -->
    <el-dialog title="提示" :visible.sync="setRightsVisible" width="30%" @close="clearDefaultKey">
      <el-tree
        :data="rightsTree"
        :props="rightsProp"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="defaultKey"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsVisible = false">取 消</el-button>
        <el-button type="primary" @click="allocateRoles">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  created() {
    this.getRoleList()
  },
  data() {
    return {
      roleList: [],
      // 分配权限的窗口
      setRightsVisible: false,
      // 权限树
      rightsTree: [],
      rightsProp: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的key
      defaultKey: [],
      roleId: ''
    }
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      // this.$message.success('获取角色列表成功！')
      this.roleList = res.data
    },
    async removeRightById(role, rid) {
      const confirmRes = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('取消删除')
      }
      // 发送ajax请求删除
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rid}`)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      // 直接更新他所在那个角色的数据 不刷新整个页面
      role.children = res.data
    },
    // 获取角色的权限 其中参数role 为我们点击的角色 接着我们通过点击的角色来比遍历获取到三级节点
    async showRightsDialog(role) {
      // 这句代码 为了下面的 为角色分配属性 提供id
      this.roleId = role.id
      // 发送ajax请求 获取所有的权限
      const { data: res } = await this.$http.get('rights/tree')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取权限失败')
      this.$message.success('获取权限成功')
      this.rightsTree = res.data
      this.getLeafNode(role, this.defaultKey)
      this.setRightsVisible = true
    },
    // 写一个递归函数 获取其下的所有三级权限 判断是否children（如果没有 那就是最终的叶子节点）
    getLeafNode(node, arr) {
      //  为叶子节点
      if (!node.children) {
        return arr.push(node.id)
      } else {
        // 遍历节点
        for (var i = 0; i < node.children.length; i++) {
          this.getLeafNode(node.children[i], arr)
        }
      }
    },
    clearDefaultKey() {
      this.defaultKey = []
    },
    // 为角色分配roles
    async allocateRoles() {
      // let keys=[]
      // 通过ref获取选中和半选中的节点
      let keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      keys = keys.join(',')
      // roles/:roleId/rights
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: keys })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('分配失败')
      this.$message.success('分配角色成功')
      this.setRightsVisible = false
      this.getRoleList()
    }
  }
}
</script>
<style lang="less" scoped>
.tagMargin {
  margin: 20px 0;
}
.bm {
  border-bottom: 1px solid #eee;
}
.bt {
  border-top: 1px solid #eee;
}
.tMargin {
  margin-right: 5px;
}
.vcneter {
  display: flex;
  align-items: center;
}
</style>
