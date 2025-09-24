<template>
  <div class="card">
    <div class="label" style="display:flex;align-items:center;justify-content:space-between">
      <span>รายการจอง</span>
      <button class="btn" @click="$emit('export-excel')">Export table</button>
    </div>

    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th :class="thClass('bookingAt')" @click="onSort('bookingAt')">
              วันเวลาจอง <span v-if="sort.key==='bookingAt'">{{ sort.dir==='asc' ? '▲' : '▼' }}</span>
            </th>
            <th :class="thClass('bookingNo')" @click="onSort('bookingNo')">
              หมายเลขการจอง <span v-if="sort.key==='bookingNo'">{{ sort.dir==='asc' ? '▲' : '▼' }}</span>
            </th>
            <th :class="thClass('mazdaId')" @click="onSort('mazdaId')">
              Mazda ID <span v-if="sort.key==='mazdaId'">{{ sort.dir==='asc' ? '▲' : '▼' }}</span>
            </th>
            <th :class="thClass('firstName')" @click="onSort('firstName')">
              ชื่อ <span v-if="sort.key==='firstName'">{{ sort.dir==='asc' ? '▲' : '▼' }}</span>
            </th>
            <th :class="thClass('lastName')" @click="onSort('lastName')">
              นามสกุล <span v-if="sort.key==='lastName'">{{ sort.dir==='asc' ? '▲' : '▼' }}</span>
            </th>
            <th :class="thClass('dealer')" @click="onSort('dealer')">
              ผู้จำหน่าย <span v-if="sort.key==='dealer'">{{ sort.dir==='asc' ? '▲' : '▼' }}</span>
            </th>
            <th style="width:120px">รายละเอียด</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in items" :key="r.bookingNo">
            <td>{{ formatDateTime(r.bookingAt) }}</td>
            <td>{{ r.bookingNo }}</td>
            <td>{{ r.mazdaId }}</td>
            <td>{{ r.firstName }}</td>
            <td>{{ r.lastName }}</td>
            <td>{{ r.dealer }}</td>
            <td><a href="#" @click.prevent="$emit('view', r)">รายละเอียด</a></td>
          </tr>
          <tr v-if="!items.length">
            <td colspan="7" style="text-align:center;color:#6b7280;padding:16px;">ไม่มีข้อมูล</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pager">
      <button class="btn" :disabled="page<=1" @click="$emit('change-page', page-1)">&lt; Prev</button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button class="btn" :disabled="page>=totalPages" @click="$emit('change-page', page+1)">Next &gt;</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { formatDateTime } from '../utils';

type SortDir = 'asc'|'desc';
type SortKey = 'bookingAt'|'bookingNo'|'mazdaId'|'firstName'|'lastName'|'dealer';
type SortState = { key: SortKey, dir: SortDir };

const props = defineProps<{ items:any[], page:number, totalPages:number, sort: SortState }>();
const emit = defineEmits(['change-page','export-excel','view','sort-change']);

function onSort(key: SortKey){
  const dir: SortDir = props.sort.key === key
    ? (props.sort.dir === 'asc' ? 'desc' : 'asc')
    : (key==='bookingAt' ? 'desc' : 'asc');
  emit('sort-change', { key, dir });
}

function thClass(key: SortKey){
  return {
    'th-sort': true,
    active: props.sort.key === key
  }
}
</script>

<style scoped>
.table-wrap{ overflow:auto; }
.tbl{ width:100%; border-collapse:collapse; }
th, td{ padding:12px 10px; border-bottom:1px solid #eef2f7; text-align:left; }
th{ background:#f8fafc; color:#111827; position:sticky; top:0; z-index:1; }
th.th-sort{ cursor:pointer; user-select:none; white-space:nowrap; }
th.th-sort.active{ color:#0f172a; }
.pager{ display:flex; gap:12px; align-items:center; justify-content:flex-end; padding:12px 6px; }
.btn{ background:#111827; color:#fff; border:none; padding:6px 12px; border-radius:8px; cursor:pointer; }
.btn:disabled{ opacity:.45; cursor:not-allowed; }
</style>
