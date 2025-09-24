<template>
  <div class="card">
    <div class="label">ยอดจองสิทธิ์ตามข้อเสนอพิเศษ</div>
    <Chart :option="option" height="280px" :autoHover="true" :hoverEveryMs="6000" />
  </div>
</template>

<script setup lang="ts">
import Chart from './Chart.vue';
const props = defineProps<{ items: {name:string, value:number}[] }>();

const option = {
  tooltip: { trigger:'item', formatter: '{b}: {c} ({d}%)' },
  series: [{ type:'pie', radius:['45%','70%'], data: props.items, avoidLabelOverlap: true }]
};
</script>
