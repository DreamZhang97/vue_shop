<template>
  <div class="list_container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片布局 -->
    <el-card>
      <!-- 顶部搜索框 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @change="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
    </el-card>
    <!-- table 表格 -->
    <el-table :data="allGoodsList" stripe border style="width: 100%">
      <el-table-column type="index" label="#" width="80"> </el-table-column>
      <el-table-column prop="goods_name" label="商品名称" width="900"> </el-table-column>
      <el-table-column prop="goods_price" label="商品价格" width="120"> </el-table-column>
      <el-table-column prop="goods_weight" label="商品重量" width="100"> </el-table-column>
      <el-table-column prop="add_time" label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.add_time | dateFormate }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit"></el-button>
          <el-button type="danger" icon="el-icon-delete" @click="deleteGoodsById(scope.row)"> </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 20, 50]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
  </div>
</template>
<script>
export default {
  data() {
    return {
      queryInfo: {
        // 搜索关键字
        query: '',
        pagenum: 1,
        pagesize: 20
      },
      // 所有商品
      allGoodsList: [],
      // 商品总数量
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.total = res.data.total
      this.allGoodsList = res.data.goods
      //   console.log(res)
    },
    // 分页-改变页码
    handleCurrentChange(newPage) {
      //   console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    handleSizeChange(size) {
      //   console.log(size)
      this.queryInfo.pagesize = size
      this.getGoodsList()
    },
    // 删除商品
    async deleteGoodsById(row) {
      const { data: res } = await this.$http.delete(`goods/${row.goods_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getGoodsList()
    },
    goAddPage() {
      // 跳转到添加商品界面
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scoped></style>
