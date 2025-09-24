<template>
  <div class="card">
    <div class="filters-grid">
      <!-- From / To -->
      <label class="field">
        <span>From Date</span>
        <input type="date" v-model="model.from" />
      </label>

      <label class="field">
        <span>To Date</span>
        <input type="date" v-model="model.to" />
      </label>

      <label class="field">
        <span>สีภายนอก</span>
        <select v-model="model.extColor">
          <option value="">All</option>
          <option v-for="o in options.extColors" :key="o" :value="o">{{ o }}</option>
        </select>
      </label>

      <label class="field sm">
        <span>สีภายใน</span>
        <select v-model="model.intColor">
          <option value="">All</option>
          <option v-for="o in options.intColors" :key="o" :value="o">{{ o }}</option>
        </select>
      </label>

      <label class="field">
        <span>ผู้จำหน่าย</span>
        <select v-model="model.dealer">
          <option value="">All</option>
          <option v-for="o in options.dealers" :key="o" :value="o">{{ o }}</option>
        </select>
      </label>

      <div class="buttons">
        <button class="btn primary" @click="$emit('apply', model)">Apply</button>
        <button class="btn ghost" @click="onReset">Reset</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, defineProps, defineEmits } from 'vue';
const props = defineProps<{ options: { extColors: string[], intColors: string[], dealers: string[] }, modelValue: any }>();
const emit = defineEmits(['update:modelValue','apply']);

const model = reactive({ ...props.modelValue });
watch(model, () => emit('update:modelValue', model), { deep: true });

function onReset(){
  model.extColor = '';
  model.intColor = '';
  model.dealer   = '';
  emit('apply', model);
}
</script>

<style scoped>
/* Desktop: force in one row */
.filters-grid{
  display: grid;
  grid-template-columns: 180px 180px minmax(240px, 1fr) 140px minmax(260px, 1fr) auto;
  /*            From   |  To  |  Exterior            | Int |    Dealer          | Buttons  */
  align-items: end;
  column-gap: 12px;
  row-gap: 8px;
}

/* Keep buttons on the right, single row */
.buttons{
  justify-self: end;
  display:flex;
  gap:8px;
  white-space: nowrap;
}

.field{ display:flex; flex-direction:column; gap:6px; min-width:0; }
.field > span{ font-size:12px; color:#6b7280; }
.field > input[type="date"], .field > select{
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px 10px;
  background: #fff;
  width: 100%;
}

/* Make interior smaller to help everything fit in one row */
.field.sm > select{ max-width: 140px; }

.btn{ border-radius: 10px; padding: 8px 14px; cursor: pointer; border:1px solid transparent; }
.btn.primary{ background:#0f172a; color:#fff; }
.btn.ghost{ background:#fff; color:#0f172a; border-color:#e5e7eb; }

/* Small screens: allow wrapping */
@media (max-width: 1100px){
  .filters-grid{
    grid-template-columns: 1fr 1fr;
  }
  .buttons{ justify-self: start; }
  .field.sm > select{ max-width: none; }
}
</style>
