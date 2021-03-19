<template>
  <div class="container_cate">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片布局 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col><el-button type="primary" @click="showAddCategory">添加分类</el-button></el-col>
      </el-row>
      <!-- table-tree 表格 它是树型结构-->
      <tree-table
        :data="categoeyList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:lightgreen"></i>
        </template>
        <!-- 排序 -->
        <template slot-scope="scope" slot="order">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-if="scope.row.cat_level === 2">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot-scope="scope" slot="operate">
          <el-button type="primary" icon="el-icon-edit" @click="toEidtCate(scope.row)">操作</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="deleteByCateId(scope.row)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.pagenum"
        :page-sizes="[1, 3, 5, 10]"
        :page-size="params.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加窗口 -->
    <el-dialog title="添加分类" :visible.sync="dialogFormVisible" width="30%" @close="clearBox">
      <el-form :model="addForm" ref="addFormRef" :rules="addFormRules" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" prop="cat_pid">
          <!-- options 配置数据源 -->
          <!-- props 选择数据源中的部分属性 进行展示 -->
          <!-- v-model 是将咱们选中的值 双向绑定到data中，他绑定的必须为一个数组，因为他里面也可能包含两个父节点 （家电/电视）因此数组中应该有两个id -->
          <!-- change 绑定当这个级联框改变时 触发 clearable 是否支持清空选项-->
          <!-- change-on-select是否允许选择任意一项（默认为false，就是我们只能） -->
          <el-cascader
            :options="allParenCate"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clearBox">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改窗口 -->
    <el-dialog title="添加分类" :visible.sync="editFormVisible" width="30%">
      <el-form :model="editForm" ref="editFormRef" :rules="addFormRules" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      params: {
        // 显示的商品等级
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 所有的商品列表
      categoeyList: [],
      //   总数据条数
      total: 0,
      // 为table指定列定义（table-tree的结构）
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列设为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operate'
        }
      ],
      // 添加分类表单
      addForm: {
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        // 分类的等级 默认为0
        cat_level: 0
      },
      // 添加分类 校验规则
      addFormRules: {
        cat_name: [{ required: true, message: '请输入名称', trigger: blur }]
      },
      // 父级分类的列表
      allParenCate: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        // 绑定的值
        value: 'cat_id',
        // 显示的名称
        label: 'cat_name',
        // 指定孩子节点
        children: 'children'
      },
      // 添加窗口显示与否
      dialogFormVisible: false,
      // 选中的父级分类的id
      selectedKeys: [],
      // 修改用户
      editForm: {},
      editFormVisible: false
    }
  },
  created() {
    this.getAllCate()
  },
  methods: {
    // 获取所有的分类
    async getAllCate() {
      const { data: res } = await this.$http.get('categories', { params: this.params })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      // console.log(res.data.result)
      this.categoeyList = res.data.result
      this.total = res.data.total
    },
    // 尺寸改变
    handleSizeChange(newSize) {
      this.params.pagesize = newSize
      this.getAllCate()
    },
    // 当前页码数改变
    handleCurrentChange(currentPage) {
      this.params.pagenum = currentPage
      this.getAllCate()
    },
    showAddCategory() {
      this.dialogFormVisible = true
      this.getParentCate()
    },
    //获取所有的父级分类
    async getParentCate() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      // console.log(res.data)
      if (res.meta.status !== 200) return this.$message.error('获取父级元素失败')
      this.allParenCate = res.data
    },
    // 当级联选择框发生改变时
    parentCateChange() {
      // 输出 父级id
      // console.log(this.selectedKeys)
      // 如果selectedKeys数组中的length>0 说明了  他选的是有父级分类的
      // 否则 就是没有选择父类 也就是它本身为父类
      const keysLength = this.selectedKeys.length
      // 开始设置addForm中的值
      if (keysLength > 0) {
        // 父级分类id  直接父id就是数组中的最后一个元素
        this.addForm.cat_pid = this.selectedKeys[keysLength - 1]
        // 等级
        this.addForm.cat_level = keysLength
        // 如果说没有选择 也就是她没有父节点
      } else {
        this.addForm.cat_pid = 0
        // 等级
        this.addForm.cat_level = 0
      }
    },
    // 当点击关闭 取消按钮时 清空表格内容
    clearBox() {
      this.dialogFormVisible = false
      // 清空界面表格的内容
      this.$refs.addFormRef.resetFields()
      this.selectedKeys = []
      // 将模型中addForm中的内容也清空
      this.addForm.cat_pid = 0
      this.addForm.cat_level = 0
    },
    addCate() {
      console.log(this.addForm)
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('添加失败')
        // 发送ajax请求 开始添加
        const { data: res } = await this.$http.post('categories', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success('添加分类成功')
        this.getAllCate()
        this.dialogFormVisible = false
      })
    },
    // 删除分类
    async deleteByCateId(role) {
      const { data: res } = await this.$http.delete(`categories/${role.cat_id}`, { id: role.cat_pid })
      if (res.meta.status !== 200) return this.$message.success('删除分类失败')
      this.$message.success('删除分类成功')
      this.getAllCate()
    },
    // 根据id查询
    async toEidtCate(row) {
      this.editFormVisible = true
      // 获取到id 然后查询到名称
      const { data: res } = await this.$http.get(`categories/${row.cat_id}`)
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.editForm = res.data
    },
    // 修改
    editCate() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('修改失败')
        // console.log(this.editForm)
        const { data: res } = await this.$http.put(`categories/${this.editForm.cat_id}`, {
          cat_name: this.editForm.cat_name
        })
        if (res.meta.status !== 200) return this.$message.error('修改失败')
        this.$message.success('修改成功')
        this.editFormVisible = false
        this.getAllCate()
      })
    }
  }
}
</script>
<style lang="less" scoped>
.el-row {
  margin-bottom: 20px;
}
.el-cascader {
  width: 100%;
}
</style>
