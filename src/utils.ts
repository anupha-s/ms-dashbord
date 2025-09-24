import type { Prebooking } from './types';
import dayjs from 'dayjs';

export function formatDateTime(val?: string | Date): string {
  if (!val) return '-';
  return dayjs(val).format('DD/MM/YYYY HH:mm');
}

export function withinRange(r: Prebooking, from?: string, to?: string){
  const d = dayjs(r.bookingAt);
  const okFrom = from ? d.isAfter(dayjs(from).startOf('day')) || d.isSame(dayjs(from).startOf('day')) : true;
  const okTo = to ? d.isBefore(dayjs(to).endOf('day')) || d.isSame(dayjs(to).endOf('day')) : true;
  return okFrom && okTo;
}

export function uniq<T>(arr:T[]):T[]{ return Array.from(new Set(arr)); }

export function groupBy<T, K extends string | number>(arr:T[], key:(t:T)=>K): Record<K, T[]> {
  return arr.reduce((acc:any, item)=>{
    const k = key(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export function paginate<T>(arr:T[], page:number, perPage:number){
  const start = (page-1)*perPage;
  const end = start + perPage;
  const totalPages = Math.max(1, Math.ceil(arr.length / perPage));
  return { items: arr.slice(start,end), totalPages };
}
