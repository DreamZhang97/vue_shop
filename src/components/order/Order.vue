<template>
  <div class="order_container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片布局 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="6">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单表格 -->
      <el-table :data="ordersList" stripe style="width: 100%" border>
        <el-table-column label="#" type="index" width="90"> </el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="500"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="180"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay" width="180">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.order_pay === 1" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="180"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="280">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormate }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改地址 -->
            <el-button icon="el-icon-edit" type="primary" @click="showEdit(scope.row)"></el-button>
            <el-button icon="el-icon-location-outline" type="success" @click="showLogistic(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改对话框 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="30%">
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区" prop="address1">
          <el-cascader
            class="cc"
            v-model="addressForm.address1"
            :options="cityData"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="eidtOrder">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流信息 -->
    <el-dialog title="物流信息" :visible.sync="logisticsVisible">
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in transportMessage" :key="index" :timestamp="activity.time">
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import citydata from './citydata'
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
        // 用户id
        user_id: '',
        // 支付状态
        pay_status: ''
      },
      //  所有的订单
      ordersList: [],
      //   订单总数量
      total: 0,
      //   修改窗口
      editDialogVisible: false,
      //   修改地址表单
      addressForm: {
        address1: '',
        address2: ''
      },
      //   级联选择器的数据 省市区
      cityData: citydata,
      addressFormRules: {
        address1: [{ required: true, message: '请选择省市区', trigger: 'blur' }],
        address2: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      //   修改订单
      editForm: {},
      //   物流窗口
      logisticsVisible: false,
      // 物流信息
      transportMessage: []
    }
  },
  methods: {
    async getOrders() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      //   console.log(res.data)
      if (res.meta.status !== 200) return this.$message.error('获取订单失败')
      this.ordersList = res.data.goods
      this.total = res.data.total
      //   console.log(this.ordersList)
    },
    // 每页显示的条数
    handleSizeChange(size) {
      this.queryInfo.pagesize = size
      this.getOrders()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrders()
    },
    // 显示修改界面
    showEdit(row) {
      this.editForm = row
      this.editDialogVisible = true
    },
    // 选择级联框
    handleChange() {
      console.log(this.addressForm.address1)
    },
    // 修改地址
    eidtOrder() {
      //   console.log(this.addressForm)
      //   console.log(this.editForm)
      this.editForm.consignee_addr = this.addressForm.address1.join('') + ' ' + this.addressForm.address2
      this.editForm.update_time = new Date().getTime()
      //  开始发送请求
      // this.$http.post()
    },
    async showLogistic(row) {
      this.logisticsVisible = true
      console.log(row)
      // 查询物流信息
      const { data: res } = await this.$http.get('/kuaidi/4313006474753')
      if (res.meta.status !== 200) return this.$message.error('获取物流信息失败')
      this.transportMessage = res.data
    }
  },
  created() {
    this.getOrders()
  }
}
</script>
<style lang="less" scoped>
.cc {
  width: 100%;
}
</style>
