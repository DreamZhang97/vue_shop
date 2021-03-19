<template>
  <div class="params_container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-alert type="warning" show-icon title="注意！只允许为第三级分类设置相关参数" :closable="false"> </el-alert>
      <!-- 选择商品分类 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 分类的级联选择框 -->
          <el-cascader
            v-model="selectedKeys"
            :options="allCategories"
            :props="cateDisplayAttrs"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs 标签区域  -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button :disabled="isBtnDiasabled" type="primary" size="mini" @click="addDialogVisible = true">
            添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <!-- tabs标签 -->
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="deleteAttrVal(scope.row, i)">
                  {{ item }}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="toEditParams(scope.row)"> 编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" @click="deleteParamsById(scope.row)"> 删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button :disabled="isBtnDiasabled" type="primary" size="mini" @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="deleteAttrVal(scope.row, i)">
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" @click="toEditParams(scope.row)"> 编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" @click="deleteParamsById(scope.row)"> 删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加窗口 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="30%" @close="clearAddForm">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="titleText" prop="name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改窗口 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="30%">
      <el-form :model="editForm" :rules="addRules" ref="editFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item :label="titleText" prop="name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有的商品
      allCategories: [],
      // 要展示的数据(或者是需要用到的数据)
      cateDisplayAttrs: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的节点 存放他的id
      selectedKeys: [],
      // tabs 选中的名称
      activeName: 'many',
      // 动态表格数据
      manyTableData: [],
      // 静态表格数据
      onlyTableData: [],
      // 添加窗口
      addDialogVisible: false,
      // 添加参数
      addForm: {
        attr_name: ''
      },
      addRules: {
        name: [
          { required: true, message: '必填项', trigger: blur },
          { min: 2, message: '长度不能小于2' }
        ]
      },
      // 修改参数
      editForm: {},
      // 修改窗口
      editDialogVisible: false
    }
  },
  created() {
    this.getAllCates()
  },
  methods: {
    async getAllCates() {
      // 因为我们这里不需要分页 因此可以不用传递参数
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.allCategories = res.data
    },
    // 级联选择框中选项发生改变 触发
    async handleChange() {
      this.getParamsData()
    },
    // tab 标签页点击触发事件
    handleClick() {
      //   console.log(this.activeName)
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData() {
      const length = this.selectedKeys.length
      //   我们只允许选中第三季的节点 其他的节点都是无效
      if (length !== 3) {
        this.selectedKeys = []
        // 让下方的many only数据也全都清空
        this.manyTableData = []
        this.onlyTableData = []
        this.$message.error('请选择第三级的节点')
        return ''
      }
      const { data: res } = await this.$http.get(`categories/${this.getCateId}/attributes`, {
        params: { sel: this.activeName }
      })
      //   console.log(res.data)
      // 将attr_vals分割为一个数组 如果数组中没有元素 就让他为空数组
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本输入框 和按钮的切换
        item.inputVisible = false
        // 添加标签时 输入框的值
        item.inputValue = ''
      })
      //   console.log(res.data)
      // 为每一个参数添加两个参数  方便下面的修改attr_val

      if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
      if (this.activeName === 'only') {
        this.onlyTableData = res.data
      } else {
        this.manyTableData = res.data
      }
    },
    async addParams() {
      this.addForm.cat_id = this.getCateId
      this.addForm.attr_sel = this.activeName
      //   console.log(this.addForm)
      //   发送请求
      const { data: res } = await this.$http.post(`categories/${this.addForm.cat_id}/attributes`, this.addForm)
      if (res.meta.status !== 201) return this.$message.error('添加失败')
      this.$message.success('添加成功')
      this.addDialogVisible = false
      this.getParamsData()
    },
    clearAddForm() {
      this.addForm.attr_name = ''
      this.$refs.addFormRef.resetFields()
    },
    // 删除动态参数
    async deleteParamsById(row) {
      console.log(row)
      const { data: res } = await this.$http.delete(`categories/${row.cat_id}/attributes/${row.attr_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.getParamsData()
    },
    // 数据回填
    toEditParams(row) {
      //   console.log(row)
      this.editDialogVisible = true
      this.editForm = row
    },
    // 修改参数
    async editParams() {
      //  console.log(this.editForm)
      this.saveAttrVal()
    },
    // 修改 删除 的共有函数
    async saveAttrVal() {
      console.log(this.editForm)
      const { data: res } = await this.$http.put(
        `categories/${this.editForm.cat_id}/attributes/${this.editForm.attr_id}`,
        {
          attr_name: this.editForm.attr_name,
          attr_sel: this.editForm.attr_sel,
          attr_vals: this.editForm.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) return this.$message.error('更新错误')
      this.editDialogVisible = false
      this.$message.success('更新成功')
      this.getParamsData()
    },
    // 删除a参数中的 attr_val
    deleteAttrVal(row, index) {
      this.editForm = row
      console.log(this.editForm)
      this.editForm.attr_vals.splice(index, 1)
      this.saveAttrVal()
    },
    // 输入框离开焦点 添加
    handleInputConfirm(row) {
      row.inputVisible = false
      this.editForm = row
      if (this.editForm.inputValue.trim().length === 0) return this.$message.error('输入框长度不能为0')
      this.editForm.attr_vals.push(row.inputValue)
      console.log(this.editForm)
      this.saveAttrVal()
    },
    showInput(row) {
      console.log(row)
      row.inputVisible = true
      row.inputValue = ''
      // 自动获取焦点
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  },
  computed: {
    //  监测按钮是否需要被禁用
    isBtnDiasabled() {
      // 如果长度不等于3 将其禁用
      return this.selectedKeys.length !== 3
    },
    // 获取三级分类的id 接着去发送请求
    getCateId() {
      return this.selectedKeys.length === 3 ? this.selectedKeys[2] : null
    },
    titleText() {
      return this.activeName === 'many' ? '动态参数' : '静态参数'
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 30%;
}
.el-tag {
  margin: 15px;
}
.input-new-tag {
  width: 10%;
}
</style>
