<template>
    <header class="fixed top-0 left-0 right-0 z-50 h-16 bg-white border border-gray-300 shadow-sm">
        <div class="flex items-center justify-between h-full px-4">
            <div class="flex items-center gap-4">
                <!-- Mobile Menu Toggle -->
                <button @click="toggleMobileSidebar" class="text-gray-600 lg:hidden hover:text-blue-600">
                    <i class="text-xl fas fa-bars"></i>
                </button>

                <!-- Logo -->
                <div class="flex items-center gap-2">
                    <div class="flex items-center justify-center w-8 h-8 bg-blue-600 rounded">
                        <i class="text-white fas fa-chart-line"></i>
                    </div>
                    <span class="text-xl font-semibold text-gray-800">PNNAdmin</span>
                </div>
            </div>

            <!-- Right -->
            <div class="flex items-center gap-4">


                <!-- Profile Dropdown -->
                <div class="relative profile-dropdown-trigger">
                    <div class="flex items-center px-3 py-2 pl-4 space-x-2 transition-colors duration-200 border-l border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50">
                        <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <span class="font-medium text-blue-600">{{ user.firstName }}</span>
                        <svg class="w-4 h-4 text-blue-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>
                    <div class="absolute right-0 w-40 py-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg profile-dropdown-menu top-full user-dropdown-arrow z-[60]">
                        <NuxtLink to="/profile"
                            class="flex items-center block w-full px-4 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600">
                            บัญชีของฉัน
                        </NuxtLink>
                        <NuxtLink to="/admin/users"
                            class="flex items-center block w-full px-4 py-2 text-left text-gray-700 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-600">
                            Dashboard
                        </NuxtLink>
                        <button @click="handleLogout"
                            class="flex items-center block w-full px-4 py-2 text-left text-red-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-700">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRuntimeConfig, useCookie } from '#app'
import { useAuth } from '~/composables/useAuth'

const { token, user, logout } = useAuth()

function handleLogout() {
    logout()
    navigateTo('/login')
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar')
    const overlay = document.getElementById('overlay')
    if (!sidebar || !overlay) return
    sidebar.classList.toggle('mobile-open')
    overlay.classList.toggle('hidden')
}



onMounted(() => {
})
onUnmounted(() => {
})


</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.profile-dropdown-menu {
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
}

.profile-dropdown-trigger:hover .profile-dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}
</style>
