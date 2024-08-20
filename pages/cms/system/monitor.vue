<script lang="ts" setup>

import { $endApi } from '~/composables/api/base'
import type { ServeStatInfo } from '~/composables/api/base/v1/cms.type'
import type { IDataResponse } from '~/composables/api/base/index.type'

import * as echarts from 'echarts'


definePageMeta({
  name: '系统监控',
  layout: 'cms',
  pageTransition: {
    name: 'rotate',
  },
})
const $dataApi = $endApi.v1.cms.systemServer
const cpuChartRef = ref()
/**
 * 内存echart
 */
const pieChartRef1 = ref()
/**
 * 磁盘echart
 */
const pieChartRef2 = ref()

onMounted(() => {
  fetchData()
})


const sysInfo = ref<ServeStatInfo>({

  runtime: {
    npmVersion: "10.7.0",
    nodeVersion: "22.2.0",
    os: "linux",
    arch: "x64"
  },
  cpu: {
    manufacturer: "Intel",
    brand: "Xeon® Platinum 8336C",
    physicalCores: 4,
    model: "106",
    speed: 2.3,
    rawCurrentLoad: 5865170,
    rawCurrentLoadIdle: 752606110,
    coresLoad: [
      {
        rawLoad: 1509030,
        rawLoadIdle: 188067440
      },
      {
        rawLoad: 1504340,
        rawLoadIdle: 188070050
      },
      {
        rawLoad: 1468080,
        rawLoadIdle: 188238140
      },
      {
        rawLoad: 1383720,
        rawLoadIdle: 188230480
      }
    ]
  },
  disk: {
    size: 0,
    used: 0,
    available: 0,

  },
  memory: {
    total: 8333570048,
    available: 3071422464
  }



})


async function fetchData() {
  const res: IDataResponse<ServeStatInfo> = (await $dataApi.list())
  if (!res) {
    ElMessage.warning('参数错误，查询失败！')
  }
  else {
    if (res.code === 200)
      sysInfo.value = res.data!

    await onFetchDataSucceed()
  }
}

function onFetchDataSucceed() {

  const option = generateEChartsConfig(sysInfo.value.cpu)
  // 使用 ECharts 初始化图表
  const cpuChart = echarts.init(cpuChartRef.value)
  cpuChart.setOption(option)


  /**
   * 内存
   */
  const pieOption1 = generatePieEChartsConfig(sysInfo.value.memory)
  const diskChart = echarts.init(pieChartRef1.value)
  diskChart.setOption(pieOption1)

  /**
   * 磁盘
   */
  const pieOption2 = generatePieEChartsConfig2(sysInfo.value.disk)
  const memoryChart = echarts.init(pieChartRef2.value)
  memoryChart.setOption(pieOption2)

}
/**
 * cpu
 * @param data 
 * @returns 
 */
function generateEChartsConfig(data: any) {

  const rawLoad = data.coresLoad.map((core: { rawLoad: any }) => Number.parseInt(core.rawLoad))
  const rawLoadIdle = data.coresLoad.map((core: { rawLoadIdle: any }) => Number.parseInt(core.rawLoadIdle))

  rawLoad.push(data.rawCurrentLoad)
  rawLoadIdle.push(data.rawCurrentLoadIdle)


  const options = {
    title: {
      text: 'CPU资源消耗',
      subtext: '根据消息类型和模型',

      left: 'center',


    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['CPU资源消耗', '空闲CPU资源'],
      top: '20%'

    },
    xAxis: {
      data: ['核心1', '核心2', '核心3', '核心4', "总核心"],
      axisLable: {
        rotate: 30,
      }

    },
    yAxis: {
      type: 'value',
      left: '5%',
      axisLabel: {
        show: true, // 显示 Y 轴标签
        interval: 0 // 不省略任何标签
      },
      splitLine: {
        show: true, // 显示分割线
        interval: 0 // 不省略任何分割线
      }

    },

    series: [
      {
        name: 'CPU资源消耗',
        data: rawLoad,
        type: 'bar',
        stack: 'x',
        itemStyle: {
          color: ' #ff0000'
        }
      },
      {
        name: '空闲CPU资源',
        data: rawLoadIdle,
        type: 'bar',
        stack: 'x',
        itemStyle: {
          color: '#00bfff'
        }
      }


    ]

  }


  return options

}

function generatePieEChartsConfig(data: any) {
  const options = {
    title: {
      text: '内存情况',
      left: 'center',
      subtext: 'Fake Data',
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        data: [
          {
            value: data.total - data.available,
            name: '已使用',
            itemStyle: {
              color: '#ff0000'
            }
          },
          {
            value: data.available,
            name: '可用内存',
            itemStyle: {
              color: '#00bfff'
            }
          }

        ],
        radius: ['20%', '40%'],



      }]

  }

  return options




}

function generatePieEChartsConfig2(data: any) {
 

  const options = {
    title: {
      text: '磁盘资源消耗',
      left: 'center',
      subtext: 'Fake Data',

    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        data: [
          {
            value: data.used,
            name: '已使用磁盘空间 (bytes)',
            itemStyle: {
              color: '#ff0000'
            }
          },
          {
            value: data.available,
            name: '可用磁盘空间 (bytes)',
            itemStyle: {
              color: '#00bfff'
            }
          },

        ],
        radius: ['20%', '40%'],
      }]

  }

  return options
}


</script>

<template>
  <el-container class="CmsUser">

    <el-main>
      <ClientOnly>
        <div class="CmsBox">
          <el-row class="title">
            <el-col :span="24" p-2>
              <h1 text-2xl border-b-1px border-b-coolGray>
                CPU情况
              </h1>
            </el-col>

          </el-row>
          <el-row :span="24" type="flex" justify="space-around">
            <el-col :span="4">
              <div class="card">
                <div class="card-header">cpu的品牌 </div>
                <div class="card-body" color-blue>
                  {{ sysInfo.cpu.brand }}
                </div>
              </div>
            </el-col>

            <el-col :span="4">
              <div class="card">
                <div class="card-header">制造商 </div>
                <div class="card-body" color-blue>
                  {{ sysInfo.cpu.manufacturer }}
                </div>
              </div>
            </el-col>

            <el-col :span="4">
              <div class="card">
                <div class="card-header">物理核心数</div>
                <div class="card-body" color-blue>
                  {{ sysInfo.cpu.physicalCores }}
                </div>
              </div>
            </el-col>

            <el-col :span="4">
              <div class="card">
                <div class="card-header">型号</div>
                <div class="card-body" color-blue>
                  {{ sysInfo.cpu.model }}
                </div>
              </div>
            </el-col>
            <el-col :span="4">
              <div class="card">
                <div class="card-header">速度 </div>
                <div class="card-body" color-blue>
                  {{ sysInfo.cpu.speed }}
                </div>
              </div>
            </el-col>



          </el-row>

          <el-row type="flex" justify="space-around">
            <el-col :span="14" border="1px" border-gray  flex class="left" >
              <div ref="cpuChartRef" w-120 h-100></div>
            </el-col>
            <el-col :span="10">
              <div class="right">
                <div class="card">
                  <div class="card-header">内存使用情况 </div>
                    <div class="card-body" flex justify-center>
                       <div ref="pieChartRef1" w-120 h-50 >
                    </div>
                  </div>
                </div>

                <div class="card">
                  <div class="card-header">磁盘使用情况 </div>
                    <div class="card-body" flex justify-center>
                       <div ref="pieChartRef2" w-120 h-50>
                    </div>
                  </div>
                </div>
              </div>



            </el-col>
          </el-row>
        </div>


        <div class="CmsBox">
          <el-row :span="24" class="title">
            <el-col :span="24" p-2>
              <h1 text-2xl border-b-1px border-b-coolGray>
                运行情况
              </h1>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="6">
              <div class="card">
                <div class="card-header">系统 </div>
                <div class="card-body" color-blue>
                  {{ sysInfo.runtime.os }}
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="card">
                <div class="card-header">服务器架构 </div>
                <div class="card-body" color-blue>
                  {{ sysInfo.runtime.arch }}
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="card">
                <div class="card-header">Node版本
                </div>
                <div class="card-body" color-blue>
                  {{ sysInfo.runtime.nodeVersion }}
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="card">
                <div class="card-header">Npm版本
                </div>
                <div class="card-body" color-blue>
                  {{ sysInfo.runtime.npmVersion }}
                </div>
              </div>
            </el-col>

          </el-row>






        </div>

      </ClientOnly>



    </el-main>


  </el-container>
</template>

<style lang="scss">
.CmsUser {
  .el-row {
    margin-bottom: 20px;
  }

  .CmsBox {
    border: 1px solid var(--el-border-color);
  }

.left{
  display: flex;
  justify-content: center;
  align-items: center;
}

  .card {
    border: 1px solid var(--el-border-color);

    padding: 5px 10px;

    .card-header {
      font-size: 20px;
      font-weight: 600;
    }
  }




}
</style>
