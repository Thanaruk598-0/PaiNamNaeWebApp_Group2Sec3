<template>
  <div>
    <AdminHeader />
    <AdminSidebar />

    <main id="main-content" class="main-content mt-16 ml-0 lg:ml-[280px] p-6">
      <div class="mx-auto max-w-4xl">
        <!-- Back -->
        <div class="mb-6">
          <NuxtLink
            to="/admin/reports"
            class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <i class="fas fa-arrow-left"></i> กลับรายการรายงาน
          </NuxtLink>
        </div>

        <div v-if="isLoading" class="p-8 text-center text-gray-500">
          <i class="fas fa-spinner fa-spin text-2xl"></i>
          <p class="mt-2">กำลังโหลดข้อมูล...</p>
        </div>

        <div v-else-if="loadError" class="p-8 text-center text-red-600">
          {{ loadError }}
        </div>

        <div v-else-if="report" class="space-y-6">
          <!-- Report Info Card -->
          <div
            class="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden"
          >
            <div
              class="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-between"
            >
              <h1 class="text-lg font-semibold text-white">
                <i class="fas fa-flag mr-2"></i>รายละเอียดรายงาน
              </h1>
              <span
                class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-white/20 text-white"
              >
                {{ report.id }}
              </span>
            </div>

            <div class="px-6 py-5 space-y-4">
              <!-- Reporter + Reported + Date -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="text-xs font-medium text-gray-500 uppercase"
                    >ผู้แจ้ง</label
                  >
                  <p class="mt-1 text-gray-900 font-medium">
                    {{ report.user?.firstName }} {{ report.user?.lastName }}
                  </p>
                  <p class="text-sm text-gray-500">{{ report.user?.email }}</p>
                  <p
                    v-if="report.user?.phoneNumber"
                    class="text-sm text-gray-500"
                  >
                    <i class="fas fa-phone mr-1"></i
                    >{{ report.user.phoneNumber }}
                  </p>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500 uppercase"
                    >ผู้ถูกแจ้ง</label
                  >
                  <template v-if="reportedUser">
                    <p class="mt-1 text-gray-900 font-medium">
                      {{ reportedUser.firstName }} {{ reportedUser.lastName }}
                    </p>
                    <p class="text-sm text-gray-500">{{ reportedUser.email }}</p>
                    <p class="text-sm text-gray-500">
                      <i class="fas fa-phone mr-1"></i
                      >{{ reportedUser.phoneNumber || '-' }}
                    </p>
                  </template>
                  <p v-else class="mt-1 text-gray-400">-</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500 uppercase"
                    >วันที่แจ้ง</label
                  >
                  <p class="mt-1 text-gray-900">
                    {{ formatDate(report.createdAt) }}
                  </p>
                  <label
                    class="text-xs font-medium text-gray-500 uppercase mt-2 block"
                    >อัปเดตล่าสุด</label
                  >
                  <p class="mt-1 text-gray-900">
                    {{ formatDate(report.updatedAt) }}
                  </p>
                </div>
              </div>

              <hr class="border-gray-200" />

              <!-- Priority, IncidentType, Status -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="text-xs font-medium text-gray-500 uppercase"
                    >ระดับความสำคัญ</label
                  >
                  <div class="mt-1">
                    <span
                      class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
                      :class="priorityBadge(report.priority)"
                    >
                      <i
                        class="mr-1 fas"
                        :class="priorityIcon(report.priority)"
                      ></i>
                      {{ report.priority }}
                    </span>
                  </div>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500 uppercase"
                    >ประเภทเหตุการณ์</label
                  >
                  <div class="mt-1">
                    <span
                      class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
                      :class="typeBadge(report.incidentType)"
                    >
                      <i
                        class="mr-1 fas"
                        :class="typeIcon(report.incidentType)"
                      ></i>
                      {{ typeLabel(report.incidentType) }}
                    </span>
                  </div>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500 uppercase"
                    >สถานะปัจจุบัน</label
                  >
                  <div class="mt-1">
                    <span
                      class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
                      :class="statusBadge(report.status)"
                    >
                      <i
                        class="mr-1 fas"
                        :class="statusIcon(report.status)"
                      ></i>
                      {{ statusLabel(report.status) }}
                    </span>
                  </div>
                </div>
              </div>

              <hr class="border-gray-200" />

              <!-- Title & Description -->
              <div>
                <label class="text-xs font-medium text-gray-500 uppercase"
                  >หัวข้อ</label
                >
                <p class="mt-1 text-gray-900 font-medium text-lg">
                  {{ report.title }}
                </p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-500 uppercase"
                  >รายละเอียด</label
                >
                <p
                  class="mt-1 text-gray-700 whitespace-pre-wrap leading-relaxed"
                >
                  {{ report.description }}
                </p>
              </div>

              <!-- Attachments -->
              <div v-if="report.attachments && report.attachments.length">
                <label
                  class="text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ภาพ/วิดีโอประกอบ
                </label>

                <!-- Section divider + count -->
                <div class="flex items-center gap-2 mt-2 mb-3">
                  <div class="h-px flex-1 bg-gray-100"></div>
                  <span
                    class="text-[11px] text-gray-400 font-medium flex items-center gap-1"
                  >
                    <i class="fas fa-paperclip text-[10px]"></i>
                    {{ report.attachments.length }} ไฟล์แนบ
                  </span>
                  <div class="h-px flex-1 bg-gray-100"></div>
                </div>

                <!-- Filmstrip Row -->
                <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  <!-- IMAGE -->
                  <div
                    v-for="(file, index) in report.attachments.filter(
                      (f) => f.resourceType === 'image',
                    )"
                    :key="'img-' + index"
                    class="relative flex-shrink-0 w-40 h-28 rounded-xl overflow-hidden bg-gray-100 shadow-sm cursor-pointer ring-2 ring-transparent hover:ring-blue-400 hover:ring-offset-2 transition-all duration-200 group"
                    @click="lightbox = { url: file.url, type: 'image' }"
                  >
                    <img
                      :src="file.url"
                      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <!-- Hover overlay + zoom icon -->
                    <div
                      class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center"
                    >
                      <div
                        class="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg scale-0 group-hover:scale-100 transition-transform duration-200"
                      >
                        <i
                          class="fas fa-magnifying-glass-plus text-white text-sm drop-shadow"
                        ></i>
                      </div>
                    </div>

                    <!-- Type badge -->
                    <div class="absolute top-1.5 left-1.5">
                      <span
                        class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold rounded-md"
                      >
                        <i class="fas fa-image text-[9px] text-blue-300"></i>
                        IMG
                      </span>
                    </div>

                    <!-- Index badge on hover -->
                    <div
                      class="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span
                        class="w-5 h-5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                      >
                        {{ index + 1 }}
                      </span>
                    </div>

                    <!-- Bottom gradient slide up -->
                    <div
                      class="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-200"
                    ></div>
                  </div>

                  <!-- VIDEO -->
                  <div
                    v-for="(file, index) in report.attachments.filter(
                      (f) => f.resourceType === 'video',
                    )"
                    :key="'vid-' + index"
                    class="relative flex-shrink-0 w-40 h-28 rounded-xl overflow-hidden bg-gray-900 shadow-sm cursor-pointer ring-2 ring-transparent hover:ring-blue-400 hover:ring-offset-2 transition-all duration-200 group"
                    @click="lightbox = { url: file.url, type: 'video' }"
                  >
                    <!-- Thumbnail -->
                    <img
                      :src="getVideoThumbnail(file.url)"
                      class="w-full h-full object-cover opacity-90 transition-all duration-300 group-hover:scale-105 group-hover:opacity-70"
                      @error="(e) => (e.target.style.display = 'none')"
                    />

                    <!-- Play button -->
                    <div
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <div
                        class="w-10 h-10 rounded-full bg-black/50 border-2 border-white/40 flex items-center justify-center shadow-xl transition-all duration-200 group-hover:scale-110 group-hover:bg-blue-500/80 group-hover:border-blue-300"
                      >
                        <i
                          class="fas fa-play text-white text-sm pl-0.5 drop-shadow"
                        ></i>
                      </div>
                    </div>

                    <!-- Type badge -->
                    <div class="absolute top-1.5 left-1.5">
                      <span
                        class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold rounded-md"
                      >
                        <i class="fas fa-video text-[9px] text-purple-300"></i>
                        VDO
                      </span>
                    </div>

                    <!-- Index badge on hover -->
                    <div
                      class="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span
                        class="w-5 h-5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                      >
                        {{ index + 1 }}
                      </span>
                    </div>

                    <!-- Bottom bar -->
                    <div
                      class="absolute inset-x-0 bottom-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent"
                    >
                      <span
                        class="text-[10px] text-white/70 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i class="fas fa-circle-play mr-1 text-purple-300"></i
                        >แตะเพื่อเล่น
                      </span>
                    </div>
                  </div>

                  <!-- OTHER files -->
                  <a
                    v-for="(file, index) in report.attachments.filter(
                      (f) =>
                        f.resourceType !== 'image' &&
                        f.resourceType !== 'video',
                    )"
                    :key="'file-' + index"
                    :href="file.url"
                    target="_blank"
                    class="relative flex-shrink-0 w-40 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 hover:border-blue-300 hover:from-blue-50 hover:to-indigo-50 flex flex-col items-center justify-center gap-2 transition-all duration-200 shadow-sm group"
                  >
                    <div
                      class="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 transition-colors duration-200"
                    >
                      <i
                        class="fas fa-file text-gray-400 group-hover:text-white transition-colors duration-200 text-lg"
                      ></i>
                    </div>
                    <span
                      class="text-xs text-gray-500 group-hover:text-blue-600 font-medium transition-colors"
                    >
                      เปิดไฟล์
                    </span>
                  </a>
                </div>
              </div>

              <!-- Location -->
              <div v-if="report.location">
                <label class="text-xs font-medium text-gray-500 uppercase"
                  >ตำแหน่งเหตุการณ์</label
                >
                <p class="mt-1 text-sm text-gray-600 flex items-start gap-1">
                  <i class="fas fa-location-dot text-red-500 mt-0.5"></i>
                  <span v-if="report.location.address" class="flex-1">{{
                    report.location.address
                  }}</span>
                  <span v-else
                    >{{ report.location.lat?.toFixed(6) }},
                    {{ report.location.lng?.toFixed(6) }}</span
                  >
                </p>
                <div
                  ref="detailMapContainer"
                  class="mt-2 w-full h-48 rounded-xl border border-gray-200 overflow-hidden bg-gray-100"
                ></div>
              </div>
            </div>
          </div>

          <!-- Trip Info Card -->
          <div
            v-if="report.booking"
            class="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden"
          >
            <div
              class="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500"
            >
              <h2 class="text-lg font-semibold text-white">
                <i class="fas fa-route mr-2"></i>Trip ที่เกี่ยวข้อง
              </h2>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-medium text-gray-500 uppercase"
                    >เส้นทาง</label
                  >
                  <p class="mt-1 text-gray-900 font-medium">
                    {{ report.booking.route?.startLocation?.name || "ต้นทาง" }}
                    →
                    {{ report.booking.route?.endLocation?.name || "ปลายทาง" }}
                  </p>
                  <p
                    v-if="report.booking.route?.routeSummary"
                    class="text-sm text-gray-500"
                  >
                    {{ report.booking.route.routeSummary }}
                  </p>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500 uppercase"
                    >เวลาออกเดินทาง</label
                  >
                  <p class="mt-1 text-gray-900">
                    {{ formatDate(report.booking.route?.departureTime) }}
                  </p>
                </div>
              </div>

              <hr class="border-gray-200" />

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="text-xs font-medium text-gray-500 uppercase"
                    >ผู้โดยสาร</label
                  >
                  <p class="mt-1 text-gray-900">
                    {{ report.booking.passenger?.firstName || "-" }}
                    {{ report.booking.passenger?.lastName || "" }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ report.booking.passenger?.email }}
                  </p>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500 uppercase"
                    >คนขับ</label
                  >
                  <p class="mt-1 text-gray-900">
                    {{ report.booking.route?.driver?.firstName || "-" }}
                    {{ report.booking.route?.driver?.lastName || "" }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ report.booking.route?.driver?.email }}
                  </p>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500 uppercase"
                    >สถานะ Booking</label
                  >
                  <div class="mt-1">
                    <span
                      class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
                      :class="bookingStatusBadge(report.booking.status)"
                    >
                      {{ bookingStatusLabel(report.booking.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Admin Action Card -->
          <div
            class="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden"
          >
            <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 class="text-lg font-semibold text-white">
                <i class="fas fa-pen-to-square mr-2"></i>อัปเดตสถานะ
              </h2>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700"
                  >สถานะ</label
                >
                <select
                  v-model="editForm.status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="PENDING">PENDING — รอดำเนินการ</option>
                  <option value="IN_PROGRESS">
                    IN_PROGRESS — กำลังดำเนินการ
                  </option>
                  <option value="RESOLVED">RESOLVED — แก้ไขแล้ว</option>
                  <option value="REJECTED">REJECTED — ปฏิเสธ</option>
                </select>
              </div>
              <div>
                <label class="block mb-1 text-sm font-medium text-gray-700"
                  >หมายเหตุจากแอดมิน</label
                >
                <textarea
                  v-model="editForm.adminNote"
                  rows="3"
                  placeholder="เขียนหมายเหตุถึงผู้แจ้ง (ผู้แจ้งจะเห็นข้อความนี้)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                ></textarea>
              </div>
              <div class="flex items-center justify-end gap-3">
                <NuxtLink
                  to="/admin/reports"
                  class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  ยกเลิก
                </NuxtLink>
                <button
                  @click="saveReport"
                  :disabled="isSaving"
                  class="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <i class="fas fa-save" v-if="!isSaving"></i>
                  <i class="fas fa-spinner fa-spin" v-else></i>
                  {{ isSaving ? "กำลังบันทึก..." : "บันทึก" }}
                </button>
              </div>
              <div
                v-if="saveError"
                class="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200"
              >
                <i class="fas fa-exclamation-circle mr-1"></i>{{ saveError }}
              </div>
              <div
                v-if="saveSuccess"
                class="p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200"
              >
                <i class="fas fa-check-circle mr-1"></i>บันทึกเรียบร้อย!
              </div>
            </div>
          </div>
          <!-- Chat Section -->
          <div
            class="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden"
          >
            <div
              class="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-between"
            >
              <h2 class="text-lg font-semibold text-white">
                <i class="fas fa-comments mr-2"></i>แชทกับผู้แจ้ง
              </h2>
            </div>

            <div class="flex flex-col h-[500px]">
              <!-- Chat Messages -->
              <div
                ref="chatRef"
                class="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50"
              >
                <div
                  v-if="chatMessages.length === 0"
                  class="flex flex-col items-center justify-center h-full text-gray-400"
                >
                  <i class="fas fa-comment-slash text-4xl mb-2"></i>
                  <p>ยังไม่มีการสนทนา</p>
                </div>

                <div
                  v-for="msg in chatMessages"
                  :key="msg.id"
                  class="flex flex-col"
                  :class="
                    msg.senderId === user?.id ? 'items-end' : 'items-start'
                  "
                >
                  <div
                    class="max-w-[80%] rounded-lg px-4 py-2 text-sm shadow-sm relative group"
                    :class="
                      msg.senderId === user?.id
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    "
                  >
                    <!-- Image attachment -->
                    <div
                      v-if="msg.fileUrl && msg.fileType === 'image'"
                      class="mb-2"
                    >
                      <img
                        :src="msg.fileUrl"
                        :alt="msg.fileName || 'รูปภาพ'"
                        class="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition"
                        style="max-height: 200px; object-fit: cover"
                        @click="lightboxUrl = msg.fileUrl"
                      />
                    </div>
                    <!-- File attachment -->
                    <div
                      v-else-if="msg.fileUrl && msg.fileType === 'file'"
                      class="mb-2"
                    >
                      <a
                        :href="msg.fileUrl"
                        target="_blank"
                        rel="noopener"
                        class="inline-flex items-center gap-2 px-3 py-2 rounded-lg transition"
                        :class="
                          msg.senderId === user?.id
                            ? 'bg-blue-500/30 hover:bg-blue-500/50 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        "
                      >
                        <i class="fas fa-file-arrow-down"></i>
                        <span class="text-sm truncate max-w-[180px]">{{
                          msg.fileName || "ดาวน์โหลดไฟล์"
                        }}</span>
                      </a>
                    </div>

                    <p v-if="msg.content">{{ msg.content }}</p>

                    <!-- Timestamp -->
                    <div
                      class="text-[10px] mt-1 flex items-center gap-1"
                      :class="
                        msg.senderId === user?.id
                          ? 'text-blue-100 justify-end'
                          : 'text-gray-400'
                      "
                    >
                      {{ dayjs(msg.createdAt).format("HH:mm") }}
                      <i
                        v-if="msg.senderId === user?.id && msg.readAt"
                        class="fas fa-check-double ml-1"
                      ></i>
                    </div>
                  </div>

                  <!-- Sender Name (if not me) -->
                  <span
                    v-if="msg.senderId !== user?.id"
                    class="text-xs text-gray-500 mt-1 ml-1"
                  >
                    {{ report.user?.firstName || "ผู้ใช้งาน" }}
                  </span>
                </div>
              </div>

              <!-- File Preview -->
              <div
                v-if="chatFilePreview"
                class="px-4 py-2 border-t bg-gray-50 flex items-center gap-3"
              >
                <img
                  v-if="chatFilePreview.type === 'image'"
                  :src="chatFilePreview.url"
                  class="w-14 h-14 object-cover rounded-lg border border-gray-200"
                />
                <div
                  v-else
                  class="w-14 h-14 flex items-center justify-center bg-blue-50 rounded-lg border border-blue-200"
                >
                  <i class="fas fa-file text-blue-500 text-xl"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-700 truncate">
                    {{ chatFilePreview.name }}
                  </p>
                  <p class="text-xs text-gray-400">
                    {{ chatFilePreview.type === "image" ? "รูปภาพ" : "ไฟล์" }}
                  </p>
                </div>
                <button
                  @click="removeChatFile"
                  class="text-gray-400 hover:text-red-500 transition cursor-pointer"
                >
                  <i class="fas fa-xmark text-lg"></i>
                </button>
              </div>

              <!-- Input Area -->
              <div class="p-4 bg-white border-t border-gray-200">
                <form @submit.prevent="sendMessage" class="flex gap-2">
                  <!-- Attach file button -->
                  <label
                    class="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer shrink-0"
                    title="แนบรูปภาพ/ไฟล์"
                  >
                    <i class="fas fa-paperclip text-lg"></i>
                    <input
                      type="file"
                      class="hidden"
                      ref="chatFileInput"
                      accept="image/*"
                      @change="onChatFileSelected"
                    />
                  </label>
                  <input
                    v-model="chatInput"
                    type="text"
                    placeholder="พิมพ์ข้อความ... (กด Enter เพื่อส่ง)"
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    :disabled="isSendingMessage"
                    maxlength="5000"
                  />

                  <button
                    type="submit"
                    class="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                    :disabled="
                      (!chatInput.trim() && !chatFile) || isSendingMessage
                    "
                  >
                    <i class="fas fa-paper-plane" v-if="!isSendingMessage"></i>
                    <i class="fas fa-spinner fa-spin" v-else></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div
      id="overlay"
      class="fixed inset-0 z-40 hidden bg-black bg-opacity-50 lg:hidden"
      @click="closeMobileSidebar"
    ></div>

    <!-- Image Lightbox -->
    <div
      v-if="lightbox.url"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click.self="lightbox = { url: null, type: null }"
    >
      <div class="relative max-w-4xl max-h-[90vh] w-full px-4">
        <button
          @click="lightbox = { url: null, type: null }"
          class="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 cursor-pointer transition"
        >
          <i class="fas fa-xmark"></i>
        </button>

        <!-- IMAGE -->
        <img
          v-if="lightbox.type === 'image'"
          :src="lightbox.url"
          class="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain mx-auto"
        />

        <!-- VIDEO -->
        <video
          v-else-if="lightbox.type === 'video'"
          :src="lightbox.url"
          muted
          playsinline
          controls
          autoplay
          class="max-w-full max-h-[85vh] rounded-xl shadow-2xl mx-auto"
        ></video>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useCookie, useRuntimeConfig, useRoute } from "#app";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import AdminHeader from "~/components/admin/AdminHeader.vue";
import AdminSidebar from "~/components/admin/AdminSidebar.vue";
import { useToast } from "~/composables/useToast";
import { useAuth } from "~/composables/useAuth";
import { io } from "socket.io-client";

dayjs.locale("th");
dayjs.extend(buddhistEra);

definePageMeta({ middleware: ["admin-auth"] });

const { toast } = useToast();
const config = useRuntimeConfig();
const route = useRoute();
const reportId = route.params.id;

const isLoading = ref(false);
const loadError = ref("");
const isSaving = ref(false);
const saveError = ref("");
const saveSuccess = ref(false);
const report = ref(null);
const editForm = ref({ status: "", adminNote: "" });
const lightbox = ref({
  url: null,
  type: null, // 'image' | 'video'
});
const detailMapContainer = ref(null);

// Computed: ผู้ถูกแจ้ง (reported user)
const reportedUser = computed(() => {
  const r = report.value;
  if (!r?.booking) return null;
  // ถ้าผู้แจ้ง = ผู้โดยสาร → ผู้ถูกแจ้ง = คนขับ
  if (r.userId === r.booking.passengerId) {
    return r.booking.route?.driver || null;
  }
  // ถ้าผู้แจ้ง = คนขับ → ผู้ถูกแจ้ง = ผู้โดยสาร
  return r.booking.passenger || null;
});

// Chat
const { user } = useAuth();
const chatSocket = ref(null);
const chatMessages = ref([]);
const chatInput = ref("");
const isSendingMessage = ref(false);
const chatRef = ref(null);
const chatFile = ref(null);
const chatFilePreview = ref(null);
const chatFileInput = ref(null);

const GMAPS_CB = "__initDetailMap__";

function getToken() {
  return (
    useCookie("token").value ||
    (process.client ? localStorage.getItem("token") : "")
  );
}

async function fetchReport() {
  isLoading.value = true;
  loadError.value = "";
  try {
    const token = getToken();
    const res = await fetch(
      `${config.public.apiBase}reports/admin/${reportId}`,
      {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );
    const body = await res.json();
    if (!res.ok) throw new Error(body?.message || `Failed: ${res.status}`);
    report.value = body?.data;
    editForm.value = {
      status: body?.data?.status || "PENDING",
      adminNote: body?.data?.adminNote || "",
    };

    // Reverse geocoding สำหรับพิกัดของ report นี้
    const apiKey = config.public.googleMapsApiKey;
    if (
      apiKey &&
      report.value?.location &&
      report.value.location.lat &&
      report.value.location.lng &&
      !report.value.location.address
    ) {
      try {
        fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${report.value.location.lat},${report.value.location.lng}&key=${apiKey}`,
        )
          .then((res) => res.json())
          .then((geoBody) => {
            if (
              geoBody.status === "OK" &&
              geoBody.results &&
              geoBody.results[0]
            ) {
              report.value.location.address =
                geoBody.results[0].formatted_address;
            }
          })
          .catch((e) => console.error("Reverse Geocoding error:", e));
      } catch (e) {
        console.error(e);
      }
    }

    // Load map if there's location data
    if (report.value?.location && process.client) {
      await nextTick();
      loadGoogleMaps();
    }
  } catch (err) {
    console.error(err);
    loadError.value = err?.message || "ไม่สามารถโหลดข้อมูลได้";
  } finally {
    isLoading.value = false;
  }
}

function getVideoThumbnail(videoUrl) {
  return videoUrl
    .replace("/video/upload/", "/video/upload/so_1,w_400,h_225,c_fill/")
    .replace(/\.(mp4|mov|webm)$/i, ".jpg");
}

async function saveReport() {
  isSaving.value = true;
  saveError.value = "";
  saveSuccess.value = false;
  try {
    const token = getToken();
    const res = await fetch(
      `${config.public.apiBase}reports/admin/${reportId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(editForm.value),
      },
    );
    const body = await res.json();
    if (!res.ok) throw new Error(body?.message || "Failed to update");
    report.value = body?.data;
    saveSuccess.value = true;
    toast.success("บันทึกเรียบร้อย", "อัปเดตสถานะรายงานแล้ว");
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (err) {
    saveError.value = err.message;
    toast.error("เกิดข้อผิดพลาด", err.message);
  } finally {
    isSaving.value = false;
  }
}

// ─── Google Maps (read-only for detail view) ───
function loadGoogleMaps() {
  // Already loaded — init immediately
  if (typeof google !== "undefined" && google.maps) {
    setTimeout(initDetailMap, 100);
    return;
  }
  // Script tag exists but not loaded yet — poll until ready
  if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
    waitForGoogleMaps();
    return;
  }
  // Load fresh
  window[GMAPS_CB] = initDetailMap;
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${config.public.googleMapsApiKey}&callback=${GMAPS_CB}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function waitForGoogleMaps(retries = 50) {
  if (typeof google !== "undefined" && google.maps) {
    initDetailMap();
    return;
  }
  if (retries > 0) {
    setTimeout(() => waitForGoogleMaps(retries - 1), 200);
  }
}

function initDetailMap() {
  if (!detailMapContainer.value || !report.value?.location) return;
  if (typeof google === "undefined" || !google.maps) return;
  const pos = {
    lat: report.value.location.lat,
    lng: report.value.location.lng,
  };
  const map = new google.maps.Map(detailMapContainer.value, {
    center: pos,
    zoom: 15,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });
  new google.maps.Marker({
    position: pos,
    map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#EF4444",
      fillOpacity: 1,
      strokeColor: "#fff",
      strokeWeight: 3,
    },
  });
}

function formatDate(iso) {
  if (!iso) return "-";
  return dayjs(iso).format("D MMMM BBBB HH:mm");
}

function statusBadge(s) {
  if (s === "PENDING") return "bg-amber-100 text-amber-700";
  if (s === "IN_PROGRESS") return "bg-blue-100 text-blue-700";
  if (s === "RESOLVED") return "bg-green-100 text-green-700";
  if (s === "REJECTED") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}
function statusIcon(s) {
  if (s === "PENDING") return "fa-hourglass-half";
  if (s === "IN_PROGRESS") return "fa-spinner";
  if (s === "RESOLVED") return "fa-circle-check";
  if (s === "REJECTED") return "fa-circle-xmark";
  return "fa-circle";
}
function statusLabel(s) {
  if (s === "PENDING") return "รอดำเนินการ";
  if (s === "IN_PROGRESS") return "กำลังดำเนินการ";
  if (s === "RESOLVED") return "แก้ไขแล้ว";
  if (s === "REJECTED") return "ปฏิเสธ";
  return s;
}

function typeBadge(t) {
  if (t === "SAFETY") return "bg-red-100 text-red-700";
  if (t === "TRIP_ISSUE") return "bg-orange-100 text-orange-700";
  if (t === "BEHAVIOR") return "bg-yellow-100 text-yellow-700";
  if (t === "PROPERTY") return "bg-blue-100 text-blue-700";
  if (t === "TECHNICAL") return "bg-purple-100 text-purple-700";
  return "bg-gray-100 text-gray-700";
}
function typeIcon(t) {
  if (t === "SAFETY") return "fa-shield-halved";
  if (t === "TRIP_ISSUE") return "fa-car-burst";
  if (t === "BEHAVIOR") return "fa-user-slash";
  if (t === "PROPERTY") return "fa-box-open";
  if (t === "TECHNICAL") return "fa-gear";
  return "fa-circle-question";
}
function typeLabel(t) {
  if (t === "SAFETY") return "ความปลอดภัย";
  if (t === "TRIP_ISSUE") return "ปัญหาระหว่างเดินทาง";
  if (t === "BEHAVIOR") return "พฤติกรรม";
  if (t === "PROPERTY") return "ทรัพย์สิน";
  if (t === "TECHNICAL") return "เทคนิค";
  return "อื่นๆ";
}

function priorityBadge(p) {
  if (p === "LOW") return "bg-green-100 text-green-700";
  if (p === "MEDIUM") return "bg-yellow-100 text-yellow-700";
  if (p === "HIGH") return "bg-orange-100 text-orange-700";
  if (p === "CRITICAL") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}
function priorityIcon(p) {
  if (p === "LOW") return "fa-circle-down";
  if (p === "MEDIUM") return "fa-circle-minus";
  if (p === "HIGH") return "fa-circle-up";
  if (p === "CRITICAL") return "fa-circle-exclamation";
  return "fa-circle";
}

function bookingStatusBadge(s) {
  if (s === "PENDING") return "bg-amber-100 text-amber-700";
  if (s === "CONFIRMED") return "bg-green-100 text-green-700";
  if (s === "REJECTED") return "bg-red-100 text-red-700";
  if (s === "CANCELLED") return "bg-gray-100 text-gray-700";
  return "bg-gray-100 text-gray-700";
}
function bookingStatusLabel(s) {
  if (s === "PENDING") return "รอยืนยัน";
  if (s === "CONFIRMED") return "ยืนยันแล้ว";
  if (s === "REJECTED") return "ปฏิเสธ";
  if (s === "CANCELLED") return "ยกเลิก";
  return s;
}

useHead({
  title: "Report Detail - Admin",
  link: [
    {
      rel: "stylesheet",
      href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
    },
  ],
});

function closeMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if (!sidebar || !overlay) return;
  sidebar.classList.remove("mobile-open");
  overlay.classList.add("hidden");
}
function defineGlobalScripts() {
  window.toggleSidebar = function () {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    const toggleIcon = document.getElementById("toggle-icon");
    if (!sidebar || !mainContent || !toggleIcon) return;
    sidebar.classList.toggle("collapsed");
    if (sidebar.classList.contains("collapsed")) {
      mainContent.style.marginLeft = "80px";
      toggleIcon.classList.replace("fa-chevron-left", "fa-chevron-right");
    } else {
      mainContent.style.marginLeft = "280px";
      toggleIcon.classList.replace("fa-chevron-right", "fa-chevron-left");
    }
  };
  window.toggleMobileSidebar = function () {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    if (!sidebar || !overlay) return;
    sidebar.classList.toggle("mobile-open");
    overlay.classList.toggle("hidden");
  };
  window.__adminResizeHandler__ = function () {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");
    const overlay = document.getElementById("overlay");
    if (!sidebar || !mainContent || !overlay) return;
    if (window.innerWidth >= 1024) {
      sidebar.classList.remove("mobile-open");
      overlay.classList.add("hidden");
      mainContent.style.marginLeft = sidebar.classList.contains("collapsed")
        ? "80px"
        : "280px";
    } else {
      mainContent.style.marginLeft = "0";
    }
  };
  window.addEventListener("resize", window.__adminResizeHandler__);
}
function cleanupGlobalScripts() {
  window.removeEventListener(
    "resize",
    window.__adminResizeHandler__ || (() => {}),
  );
  delete window.toggleSidebar;
  delete window.toggleMobileSidebar;
  delete window.__adminResizeHandler__;
}

onMounted(() => {
  defineGlobalScripts();
  if (typeof window.__adminResizeHandler__ === "function")
    window.__adminResizeHandler__();
  defineGlobalScripts();
  if (typeof window.__adminResizeHandler__ === "function")
    window.__adminResizeHandler__();
  fetchReport();
  initChat();
});
onUnmounted(() => {
  cleanupGlobalScripts();
  if (window[GMAPS_CB]) delete window[GMAPS_CB];
  cleanupGlobalScripts();
  if (window[GMAPS_CB]) delete window[GMAPS_CB];

  if (chatSocket.value) {
    chatSocket.value.disconnect();
  }
});

// --- Chat Functions ---
function initChat() {
  // Connect Socket
  const token = getToken();
  if (!token) return;

  chatSocket.value = io(config.public.apiBase.replace("/api/", ""), {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  chatSocket.value.on("connect", () => {
    console.log("Chat connected");
    chatSocket.value.emit("join_room", reportId);
  });

  // FIX: Join room if already connected (multiplexing)
  if (chatSocket.value.connected) {
    chatSocket.value.emit("join_room", reportId);
  }

  chatSocket.value.on("new_message", (msg) => {
    if (msg.reportId === reportId) {
      chatMessages.value.push(msg);
      scrollToBottom();
    }
  });

  fetchChatMessages();
}

async function fetchChatMessages() {
  try {
    const token = getToken();
    const res = await fetch(
      `${config.public.apiBase}chat/${reportId}/messages`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const body = await res.json();
    if (body.status === "success") {
      chatMessages.value = body.data || [];
      scrollToBottom();
    }
  } catch (err) {
    console.error("Fetch chat error:", err);
  }
}

// --- Chat File Selection ---
function onChatFileSelected(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    toast.error("ไฟล์ใหญ่เกินไป", "ขนาดสูงสุด 10 MB");
    return;
  }
  chatFile.value = file;
  const isImage = file.type.startsWith("image/");
  chatFilePreview.value = {
    name: file.name,
    type: isImage ? "image" : "file",
    url: isImage ? URL.createObjectURL(file) : null,
  };
}
function removeChatFile() {
  chatFile.value = null;
  chatFilePreview.value = null;
  if (chatFileInput.value) chatFileInput.value.value = "";
}

async function sendMessage() {
  if ((!chatInput.value.trim() && !chatFile.value) || isSendingMessage.value)
    return;

  isSendingMessage.value = true;
  try {
    const token = getToken();

    // If file attached, use REST upload endpoint
    if (chatFile.value) {
      const fd = new FormData();
      fd.append("file", chatFile.value);
      if (chatInput.value.trim()) fd.append("content", chatInput.value);

      const res = await fetch(
        `${config.public.apiBase}chat/${reportId}/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        },
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "อัพโหลดไม่สำเร็จ");
      if (!chatSocket.value?.connected) {
        chatMessages.value.push(body.data);
      }
      chatInput.value = "";
      removeChatFile();
      isSendingMessage.value = false;
      scrollToBottom();
      return;
    }

    // Text only: Use Socket if connected
    if (chatSocket.value?.connected) {
      chatSocket.value.emit(
        "send_message",
        {
          reportId,
          content: chatInput.value,
        },
        (response) => {
          isSendingMessage.value = false;
          if (response.status === "ok") {
            chatInput.value = "";
          }
        },
      );
    } else {
      // Fallback REST
      const res = await fetch(
        `${config.public.apiBase}chat/${reportId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: chatInput.value }),
        },
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.message);
      chatMessages.value.push(body.data);
      chatInput.value = "";
      isSendingMessage.value = false;
      scrollToBottom();
    }
  } catch (err) {
    console.error("Send message error:", err);
    isSendingMessage.value = false;
    toast.error("ส่งข้อความไม่สำเร็จ", err.message);
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatRef.value) {
      chatRef.value.scrollTop = chatRef.value.scrollHeight;
    }
  });
}
</script>

<style>
.sidebar {
  transition: width 0.3s ease;
}
.sidebar.collapsed {
  width: 80px;
}
.sidebar:not(.collapsed) {
  width: 280px;
}
.sidebar-item {
  transition: all 0.3s ease;
}
.sidebar-item:hover {
  background-color: rgba(59, 130, 246, 0.05);
}
.sidebar.collapsed .sidebar-text {
  display: none;
}
.sidebar.collapsed .sidebar-item {
  justify-content: center;
}
.main-content {
  transition: margin-left 0.3s ease;
}
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 1000;
    transform: translateX(-100%);
  }
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  .main-content {
    margin-left: 0 !important;
  }
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>