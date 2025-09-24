<template>
  <div class="card kpis">
    <div style="text-align:center">
      <div class="label">ยอดจองสิทธิ์</div>
      <div class="badge">{{ total }}</div>
    </div>
    <div>
      <Chart :option="option" height="120px" :autoHover="true" :hoverEveryMs="6000" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Chart from './Chart.vue'

const props = defineProps<{ months: {label:string, value:number}[], total:number }>()

// ทำ option ให้ reactive -> กราฟจะตาม months เสมอ
const option = computed(() => ({
  grid: { left: 40, right: 20, top: 10, bottom: 30 },
  xAxis: { type: 'category', data: props.months.map(m => m.label) },
  yAxis: { type: 'value' },
  series: [{ type: 'line', data: props.months.map(m => m.value), smooth: true, symbolSize: 6 }],
  tooltip: { trigger: 'axis' }
}))
</script>
