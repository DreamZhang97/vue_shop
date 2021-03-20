<template>
  <div class="addGoods_container">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"> </el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab侧区域 -->
      <el-form :model="addGoodsForm" :rules="addGoodsFormRules" ref="addGoodsFormRef">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClick">
          <!-- 基本信息面板 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" label-position="left" label-width="70" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" label-position="left" label-width="70">
              <el-input v-model="addGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" label-position="left" label-width="70">
              <el-input v-model="addGoodsForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" label-position="left" label-width="70">
              <el-input v-model="addGoodsForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat" label-position="left" label-width="70">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item class="clearMargin" v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(item, i) in item.attr_vals1" :key="i" :label="item" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form>
              <el-form-item
                :label="item.attr_name"
                v-for="item in onlyTableData"
                :key="item.attr_id"
                props="attr_id"
                label-position="left"
                label-width="70"
              >
                <el-input v-model="item.attr_vals" type="text"></el-input>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <!-- 商品图片 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示要上传的url地址 -->
            <el-upload
              :action="actionUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headerobj"
              list-type="picture"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容 -->
          <el-tab-pane label="商品内容 " name="4">
            <quill-editor id="editor" ref="myQuillEditor" v-model="addGoodsForm.goods_introduce" />
            <el-button type="primary" class="addBtn" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="imgVisible" width="30%">
      <img src="previewImgPath" alt="" />
    </el-dialog>
  </div>
</template>
<script>
import { getToken } from '../../utils/token'
export default {
  data() {
    return {
      activeIndex: '4',
      addGoodsForm: {
        goods_name: '中央电视',
        goods_price: 10,
        goods_weight: 10,
        goods_number: 10,
        // 商品所属分类
        goods_cat: [1, 3, 6],
        // 存放图片
        pics: [],
        // 商品的详细描述
        goods_introduce: '',
        // 商品参数 包括动态参数 静态参数
        attrs: []
      },
      //   商品分类列表
      cateList: [],
      //   校验规则
      addGoodsFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [
          { required: true, message: '请输入价格', trigger: 'blur' },
          { min: 0, message: '价格不能低于0', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入重量', trigger: 'blur' },
          { min: 0, message: '价格不能低于0', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入数量', trigger: 'blur' },
          { min: 0, message: '数量不能低于0', trigger: 'blur' }
        ],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      //   动态参数
      manyTableData: [],
      //  静态参数
      onlyTableData: [],
      //   路径
      actionUrl: 'http://127.0.0.1:8000/api/private/v1/upload',
      //   上传的请求头设置
      headerobj: {
        Authorization: getToken()
      },
      //   预览图片的绝对路径
      previewImgPath: '',
      //   图片预览
      imgVisible: false
    }
  },
  mounted() {
    this.displayOnlyGoodsParams()
  },
  methods: {
    async getGoodsCate() {
      const { data: res } = await this.$http.get('categories')
      //   console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取分类失败')
      this.cateList = res.data
    },
    handleChange() {
      console.log(this.addGoodsForm.goods_cat)
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = []
      }
      console.log(this.addGoodsForm.goods_cat)
    },
    // 拦截tab切换
    beforeTabLeave(newTab, oldTab) {
      //   console.log('离开的标签是:' + oldTab)
      //   console.log('即将要去的标签是：' + newTab)
      //  如果当前所在的第一级 并且选中的商品分类的长度不为3，则不允许跳转
      if (oldTab === '0' && this.addGoodsForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // 点击侧边栏tab 触发
    tabClick() {
      // 当前选中的tab的索引
      const index = this.activeIndex
      switch (index) {
        case '1':
          console.log('商品参数')
          this.displayManyGoodsParams()
          break
        case '2':
          console.log('商品属性')
          this.displayOnlyGoodsParams()
          break
        case '3':
          console.log('商品图片')
          break
        case '4':
          console.log('商品内容')
          break
      }
    },
    // 展示 商品动态参数
    async displayManyGoodsParams() {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取商品参数失败')
      res.data.forEach((item) => {
        //  因为数据存储的为 字符串 我们要将其分割为数组
        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        // 这一步的目的是为了当 取消选择时，这个选择框不会消失
        item.attr_vals1 = item.attr_vals
      })
      this.manyTableData = res.data
    },
    // 显示 商品静态参数
    async displayOnlyGoodsParams() {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取商品参数失败')
      this.onlyTableData = res.data
    },
    //  处理图片预览效果
    handlePreview(file) {
      console.log(file)
      this.previewImgPath = file.response.data.url
      this.imgVisible = true
      console.log(this.previewImgPath)
    },
    //  监听图片上传成功的事件
    handleSuccess(res) {
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('上传图片失败')
      //   获取上传的图片 路径 将其封装为一个对象
      const picPath = { pic: res.data.tmp_path }
      //   存储到我们自己的数组中
      //   this.imgArr.push(picPath)
      this.addGoodsForm.pics.push(picPath)
      console.log(this.addGoodsForm)
    },
    // 删除上传时图片
    handleRemove(file) {
      // 1、获取将要删除的图片的临时路径
      // 2、从pics数组中，找到这个图片对应的索引值
      // 3、使用数组的splice方法，把图片的信息对象从pics中移除
      //   console.log(file)
      const tmPath = file.response.data.tmp_path
      //   console.log(tmPath)
      const index = this.addGoodsForm.pics.findIndex((item) => {
        return item.pic === tmPath
      })
      this.addGoodsForm.pics.splice(index, 1)
    },
    // 添加商品
    addGoods() {
      this.$refs.addGoodsFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请将必填项填写完整')
        }
        const obj = this.addGoodsForm
        obj.goods_cat = obj.goods_cat.join(',')
        //  动态参数里面的attr_vals 是数组的形式因此我们要循环便利他,将其属性封装为对象,
        // 将动态参数、静态参数中的attr_id、attr_name 封装成一个对象，放入到attrs中
        this.manyTableData.forEach((item) => {
          const newTab = { attr_id: item.attr_id, attr_vals: item.attr_vals.join(' ') }
          obj.attrs.push(newTab)
        })
        this.onlyTableData.forEach((item) => {
          const newTab = { attr_id: item.attr_id, attr_value: item.attr_vals }
          obj.attrs.push(newTab)
        })
        console.log(obj)
        const { data: res } = await this.$http.post('goods', obj)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success('添加成功')
        // 跳转到商品列表
        this.$router.push('/goods')
      })
    }
  },
  created() {
    this.getGoodsCate()
  },
  computed: {
    cateId() {
      if (this.addGoodsForm.goods_cat.length === 3) {
        return this.addGoodsForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  display: block;
  width: 200px;
}
.clearMargin /deep/ .el-form-item__label {
  margin-left: 0px;
  float: none;
}
.el-checkbox-group {
  margin-left: 0px;
}
.el-checkbox {
  margin: 10px 30px;
}
#editor {
  /deep/.ql-container.ql-snow {
    min-height: 300px;
  }
}
.addBtn {
  margin-top: 15px;
}
</style>
<style lang="less"></style>
