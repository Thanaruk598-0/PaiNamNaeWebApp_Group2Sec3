<template>
  <div class="max-w-4xl mx-auto py-10 px-4">
    <h1 class="text-2xl font-semibold mb-4">Notifications</h1>

    <div v-if="pending" class="text-gray-500">Loading...</div>

    <div v-else>
      <div v-if="items.length === 0" class="text-gray-500">No notifications</div>

      <div v-for="n in items" :key="n.id" class="p-4 mb-3 bg-white rounded-lg shadow-sm border">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium">{{ n.title }}</p>
            <p class="text-sm text-gray-600">{{ n.body }}</p>
            <p class="text-xs text-gray-400 mt-2">{{ timeAgo(n.createdAt) }}</p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <button v-if="!n.readAt" @click="markRead(n)" class="text-sm text-blue-600">Mark read</button>
            <button @click="remove(n)" class="text-sm text-red-600">Delete</button>
            <NuxtLink v-if="n.link" :to="n.link" class="text-sm text-gray-700">Open</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRuntimeConfig } from '#app'

const items = ref([])
const pending = ref(true)

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || ''

const fetchList = async () => {
  pending.value = true
  try {
    const res = await $fetch(`${apiBase}/notifications`, { method: 'GET' })
    items.value = Array.isArray(res.data) ? res.data : []
  } catch (e) {
    console.error('[Notification] Fetch failed:', e)
    items.value = []
  } finally {
    pending.value = false
  }
}

function timeAgo(ts) {
  const ms = Date.now() - new Date(ts).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hr ago`
  const d = Math.floor(h / 24)
  return `${d} d ago`
}

async function markRead(n) {
  try {
    await $fetch(`${apiBase}/notifications/${n.id}/read`, { method: 'PATCH' })
    n.readAt = new Date().toISOString()
  } catch (e) { 
    console.error('[Notification] Mark read failed:', e) 
  }
}

async function remove(n) {
  try {
    await $fetch(`${apiBase}/notifications/${n.id}`, { method: 'DELETE' })
    items.value = items.value.filter(x => x.id !== n.id)
  } catch (e) { 
    console.error('[Notification] Delete failed:', e) 
  }
}

fetchList()
</script>

<style scoped>

</style>
