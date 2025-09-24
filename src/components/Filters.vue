<template>
  <div class="card controls">
    <div class="row group">
      <div class="group">
        <div class="label">From Date</div>
        <input type="date" v-model="local.from" />
      </div>
      <div class="group">
        <div class="label">To Date</div>
        <input type="date" v-model="local.to" />
      </div>
      <div class="group">
        <div class="label">สีภายนอก</div>
        <select v-model="local.extColor">
          <option value="">All</option>
          <option v-for="c in options.extColors" :key="c">{{c}}</option>
        </select>
      </div>
      <div class="group">
        <div class="label">สีภายใน</div>
        <select v-model="local.intColor">
          <option value="">All</option>
          <option v-for="c in options.intColors" :key="c">{{c}}</option>
        </select>
      </div>
      <div class="group">
        <div class="label">ผู้จำหน่าย</div>
        <select v-model="local.dealer">
          <option value="">All</option>
          <option v-for="d in options.dealers" :key="d">{{d}}</option>
        </select>
      </div>
      <div class="group">
        <div class="label">&nbsp;</div>
        <button @click="$emit('apply', {...local})">Apply</button>
        <button class="ghost" @click="reset">Reset</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const props = defineProps<{
  options: { extColors:string[]; intColors:string[]; dealers:string[] } ,
  modelValue: { from?: string, to?: string, extColor: string, intColor: string, dealer: string }
}>();

const emit = defineEmits(['update:modelValue','apply']);
const local = reactive({...props.modelValue});

function reset(){
  local.from=''; local.to=''; local.extColor=''; local.intColor=''; local.dealer='';
  emit('apply', {...local});
}
</script>
