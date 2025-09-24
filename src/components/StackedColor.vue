<template>
  <div class="card">
    <div class="label">ยอดจองสิทธิ์ตามสีภายนอกและภายใน</div>
    <Chart :option="option" height="320px" :autoHover="true" :hoverEveryMs="6000" />
  </div>
</template>

<script setup lang="ts">
import Chart from './Chart.vue';

const props = defineProps<{ categories: string[], black: number[], tan: number[] }>();

const option = {
  color: ['#414550', '#a27f61'],
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { data: ['Black','Tan'] },
  grid: { left: 100, right: 20, top: 40, bottom: 30 },
  xAxis: { type: 'value' },
  yAxis: { type: 'category', data: props.categories },
  series: [
    { name:'Black', type:'bar', stack:'c', data: props.black, itemStyle:{ color:'#414550' } },
    { name:'Tan',   type:'bar', stack:'c', data: props.tan,   itemStyle:{ color:'#a27f61' } }
  ]
};
</script>
