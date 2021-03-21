<template>
  <div class="report_container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片布局 -->
    <el-card>
      <div id="echarts_container" style="width: 850px;height:500px;"></div>
    </el-card>
  </div>
</template>
<script>
// 导入echarts
import echarts from 'echarts'
export default {
  data() {
    return {
      // 需要合并的选项
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {},
  methods: {},
  //   当页面渲染完毕之后 才会执行这个mounted
  async mounted() {
    var myChart = echarts.init(document.getElementById('echarts_container'))
    const { data: res } = await this.$http.get('reports/type/1')
    // 指定图表的配置项和数据
    if (res.meta.status !== 200) this.$message.error('获取报表失败')
    console.log(res.data)
    const newOption = { ...this.options, ...res.data }
    console.log(newOption)
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(newOption)
  }
}
</script>
