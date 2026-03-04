<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b shadow-sm">
      <div class="px-4 py-4 mx-auto max-w-4xl sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <NuxtLink
              to="/"
              class="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <i class="fas fa-arrow-left"></i>
              <span>กลับหน้าหลัก</span>
            </NuxtLink>
          </div>
          <h1 class="text-xl font-bold text-gray-800">
            <i class="mr-2 text-blue-600 fas fa-flag"></i>My Reports
          </h1>
        </div>
      </div>
    </div>

    <div class="px-4 py-6 mx-auto max-w-4xl sm:px-6">
      <!-- New Report Form -->
      <div
        class="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500">
          <h2 class="text-lg font-semibold text-white">
            <i class="mr-2 fas fa-plus-circle"></i>แจ้งเหตุการณ์ใหม่
          </h2>
        </div>
        <div class="px-6 py-5 space-y-4">
          <!-- 1. Trip Selection (บนสุด) -->
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">
              <i class="fas fa-route mr-1 text-blue-400"></i>Trip ที่เกี่ยวข้อง
              (ไม่บังคับ)
            </label>
            <select
              v-model="form.bookingId"
              class="w-full px-3 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- ไม่ระบุ Trip --</option>
              <option v-for="trip in myTrips" :key="trip.id" :value="trip.id">
                {{ tripLabel(trip) }}
              </option>
            </select>
            <p class="text-xs text-gray-400 mt-1">
              เลือก Trip ที่คุณต้องการแจ้งรายงาน (ทั้งในฐานะผู้โดยสารหรือคนขับ)
            </p>
          </div>

          <!-- 2. ระดับความสำคัญ -->
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700"
              ><i class="fas fa-exclamation-triangle mr-1 text-yellow-500"></i
              >ระดับความสำคัญ</label
            >
            <div class="flex flex-wrap gap-2">
              <button
                v-for="p in priorityOptions"
                :key="p.value"
                @click="form.priority = p.value"
                type="button"
                class="px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer"
                :class="
                  form.priority === p.value
                    ? p.activeClass
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                "
              >
                <i class="mr-1 fas" :class="p.icon"></i>{{ p.label }}
              </button>
            </div>
          </div>

          <!-- 3. ประเภทเหตุการณ์ + หัวข้อ -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700"
                ><i class="fas fa-list-check mr-1 text-indigo-400"></i
                >ประเภทเหตุการณ์ <span class="text-red-500">*</span></label
              >
              <select
                v-model="form.incidentType"
                @change="onIncidentTypeChange"
                class="w-full px-3 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- เลือกประเภท --</option>
                <option value="SAFETY">ความปลอดภัย</option>
                <option value="TRIP_ISSUE">ปัญหาระหว่างเดินทาง</option>
                <option value="BEHAVIOR">พฤติกรรม</option>
                <option value="PROPERTY">ทรัพย์สิน</option>
                <option value="TECHNICAL">เทคนิค</option>
                <option value="OTHER">อื่นๆ</option>
              </select>
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700"
                ><i class="fas fa-tag mr-1 text-emerald-400"></i>หัวข้อ
                <span class="text-red-500">*</span></label
              >
              <select
                v-if="subTopics.length > 0"
                v-model="form.title"
                class="w-full px-3 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- เลือกหัวข้อ --</option>
                <option v-for="st in subTopics" :key="st" :value="st">
                  {{ st }}
                </option>
              </select>
              <input
                v-else
                v-model="form.title"
                type="text"
                placeholder="สรุปปัญหาสั้นๆ"
                class="w-full px-3 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <!-- 4. รายละเอียด -->
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700"
              ><i class="fas fa-align-left mr-1 text-gray-400"></i>รายละเอียด
              <span class="text-red-500">*</span></label
            >
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="อธิบายเหตุการณ์โดยละเอียด..."
              class="w-full px-3 py-2 transition border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <!-- Row 4: File Upload -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">
              <i class="fas fa-camera mr-1 text-gray-400"></i>แนบรูปภาพ/วิดีโอ
              <span class="text-gray-400 font-normal text-xs">(ไม่บังคับ)</span>
            </label>

            <!-- Drop Zone -->
            <label
              class="relative flex flex-col items-center justify-center w-full py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group overflow-hidden"
              :class="
                previewFiles.length > 0
                  ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50'
                  : 'border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40'
              "
            >
              <!-- Background decoration -->
              <div
                class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <div
                  class="absolute -top-4 -right-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl"
                ></div>
                <div
                  class="absolute -bottom-4 -left-4 w-24 h-24 bg-indigo-100 rounded-full blur-2xl"
                ></div>
              </div>

              <!-- Icon + Text -->
              <div
                class="relative flex flex-col items-center gap-3 pointer-events-none"
              >
                <!-- Animated icon wrapper -->
                <div
                  class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
                  :class="
                    previewFiles.length > 0
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-400 group-hover:bg-blue-500 group-hover:text-white'
                  "
                >
                  <i
                    class="text-2xl fas transition-all duration-300"
                    :class="
                      previewFiles.length > 0
                        ? 'fa-images'
                        : 'fa-cloud-arrow-up group-hover:fa-cloud-arrow-up'
                    "
                  ></i>
                </div>

                <div class="text-center">
                  <p
                    class="text-sm font-semibold transition-colors duration-200"
                    :class="
                      previewFiles.length > 0
                        ? 'text-blue-600'
                        : 'text-gray-500 group-hover:text-blue-600'
                    "
                  >
                    {{
                      previewFiles.length > 0
                        ? `เพิ่มไฟล์อีก (${previewFiles.length}/5)`
                        : "คลิกหรือลากไฟล์มาวางที่นี่"
                    }}
                  </p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    รูปภาพ &amp; วิดีโอ • สูงสุด 5 ไฟล์ • ไม่เกิน 20MB/ไฟล์
                  </p>
                </div>

                <!-- File type badges -->
                <div class="flex items-center gap-1.5 mt-1">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 text-gray-500 text-[10px] font-medium rounded-full shadow-sm"
                  >
                    <i class="fas fa-image text-blue-400"></i> JPG / PNG
                  </span>
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 text-gray-500 text-[10px] font-medium rounded-full shadow-sm"
                  >
                    <i class="fas fa-video text-purple-400"></i> MP4 / MOV
                  </span>
                </div>
              </div>

              <input
                type="file"
                multiple
                accept="image/*,video/mp4,video/quicktime"
                class="hidden"
                @change="handleFileChange"
              />
            </label>

            <!-- Preview Grid -->
            <div v-if="previewFiles.length" class="mt-3">
              <!-- Grid -->
              <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
                <div
                  v-for="(item, index) in previewFiles"
                  :key="index"
                  class="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm ring-2 ring-transparent hover:ring-blue-400 hover:ring-offset-2 transition-all duration-200 cursor-pointer"
                  @click="openLightbox(item.url, item.type)"
                >
                  <!-- Image -->
                  <img
                    v-if="item.type === 'image'"
                    :src="item.url"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  <!-- Video -->
                  <template v-else>
                    <video
                      :src="item.url"
                      muted
                      playsinline
                      preload="metadata"
                      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    ></video>

                    <!-- Play button -->
                    <div
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <div
                        class="w-8 h-8 rounded-full bg-black/50 border border-white/40 flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-110 group-hover:bg-blue-500/90"
                      >
                        <i class="fas fa-play text-white text-xs pl-0.5"></i>
                      </div>
                    </div>

                    <!-- VDO Badge -->
                    <div class="absolute bottom-1.5 left-1.5">
                      <span
                        class="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-semibold rounded-md tracking-wide"
                      >
                        <i class="fas fa-video text-[8px] text-blue-300"></i>
                        VDO
                      </span>
                    </div>
                  </template>

                  <!-- Hover overlay -->
                  <div
                    class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/25 transition-colors duration-200"
                  >
                    <div
                      class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-200"
                    >
                      <i
                        class="fas fa-magnifying-glass-plus text-white text-sm drop-shadow"
                      ></i>
                    </div>
                  </div>

                  <!-- Index badge -->
                  <div
                    class="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  >
                    <span
                      class="w-4 h-4 bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                    >
                      {{ index + 1 }}
                    </span>
                  </div>

                  <!-- Remove button -->
                  <button
                    @click.stop="removeFile(index)"
                    class="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-150 hover:scale-110"
                  >
                    <i class="fas fa-xmark text-[10px]"></i>
                  </button>
                </div>

                <!-- Add more button (ถ้ายังไม่ครบ 5) -->
                <label
                  v-if="previewFiles.length < 5"
                  class="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group/add"
                >
                  <div
                    class="w-7 h-7 rounded-full bg-gray-100 group-hover/add:bg-blue-100 flex items-center justify-center transition-colors"
                  >
                    <i
                      class="fas fa-plus text-gray-400 group-hover/add:text-blue-500 text-sm transition-colors"
                    ></i>
                  </div>
                  <span
                    class="text-[10px] text-gray-400 group-hover/add:text-blue-500 transition-colors font-medium"
                  >
                    เพิ่ม
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/mp4,video/quicktime"
                    class="hidden"
                    @change="handleFileChange"
                  />
                </label>
              </div>

              <!-- Summary bar -->
              <div class="mt-2 flex items-center justify-between">
                <p class="text-xs text-gray-400">
                  <i class="fas fa-circle-check text-green-400 mr-1"></i>
                  เลือกแล้ว {{ previewFiles.length }} ไฟล์
                  <span class="text-gray-300 mx-1">•</span>
                  เหลืออีก {{ 5 - previewFiles.length }} ไฟล์
                </p>
              </div>
            </div>
          </div>

          <!-- Row 5: Map + auto-detect -->
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-700">
              <i class="fas fa-map-marker-alt mr-1 text-red-400"></i
              >ตำแหน่งเหตุการณ์ <span class="text-red-500">*</span>
            </label>
            <p class="text-xs text-gray-400 mb-2">
              ระบบจะดึงตำแหน่งปัจจุบันอัตโนมัติ หรือคลิกบนแผนที่เพื่อปักหมุดเอง
            </p>
            <div
              ref="mapContainer"
              class="w-full h-64 rounded-xl border border-gray-200 overflow-hidden bg-gray-100"
            ></div>
            <div v-if="form.location" class="mt-2 flex items-center gap-2">
              <span class="text-xs text-gray-500">
                <i class="fas fa-location-dot text-red-400 mr-1"></i>
                <template v-if="form.location.address">{{
                  form.location.address
                }}</template>
                <template v-else
                  >{{ form.location.lat.toFixed(6) }},
                  {{ form.location.lng.toFixed(6) }}</template
                >
              </span>
              <button
                @click="clearLocation"
                type="button"
                class="text-xs text-red-500 hover:text-red-700 cursor-pointer"
              >
                <i class="fas fa-xmark mr-1"></i>ลบตำแหน่ง
              </button>
            </div>
          </div>

          <!-- Submit -->
          <div class="flex justify-end">
            <button
              @click="submitReport"
              :disabled="isSubmitting"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <i class="fas fa-paper-plane" v-if="!isSubmitting"></i>
              <i class="fas fa-spinner fa-spin" v-else></i>
              {{ isSubmitting ? "กำลังส่ง..." : "ส่งรายงาน" }}
            </button>
          </div>
          <div
            v-if="submitError"
            class="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200"
          >
            <i class="fas fa-exclamation-circle mr-1"></i>{{ submitError }}
          </div>
          <div
            v-if="submitSuccess"
            class="p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200"
          >
            <i class="fas fa-check-circle mr-1"></i>ส่งรายงานเรียบร้อยแล้ว!
          </div>
        </div>
      </div>

      <!-- My Reports List -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div
          class="px-6 py-4 border-b border-gray-200 flex items-center justify-between"
        >
          <h2 class="text-lg font-semibold text-gray-800">
            <i class="fas fa-list mr-2 text-blue-500"></i>รายงานของฉัน
          </h2>
          <span class="text-sm text-gray-500">{{ reports.length }} รายการ</span>
        </div>

        <div v-if="isLoading" class="p-8 text-center text-gray-500">
          <i class="fas fa-spinner fa-spin text-2xl"></i>
          <p class="mt-2">กำลังโหลดข้อมูล...</p>
        </div>

        <div v-else-if="!reports.length" class="p-12 text-center text-gray-400">
          <i class="fas fa-inbox text-4xl mb-3"></i>
          <p>ยังไม่มีรายงาน</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="r in reports"
            :key="r.id"
            class="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                    :class="priorityBadge(r.priority)"
                  >
                    <i class="mr-1 fas" :class="priorityIcon(r.priority)"></i>
                    {{ r.priority }}
                  </span>
                  <span
                    class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                    :class="typeBadge(r.incidentType)"
                  >
                    <i class="mr-1 fas" :class="typeIcon(r.incidentType)"></i>
                    {{ typeLabel(r.incidentType) }}
                  </span>
                </div>
                <h3 class="font-medium text-gray-900 truncate">
                  {{ r.title }}
                </h3>
                <p class="text-sm text-gray-500 line-clamp-2 mt-1">
                  {{ r.description }}
                </p>

                <!-- Trip Info -->
                <div
                  v-if="r.booking"
                  class="mt-2 p-2 bg-indigo-50 border border-indigo-200 rounded-lg"
                >
                  <p class="text-xs font-medium text-indigo-600 mb-1">
                    <i class="fas fa-route mr-1"></i>Trip ที่เกี่ยวข้อง
                  </p>
                  <p class="text-sm text-indigo-800">
                    {{ r.booking.route?.startLocation?.name || "ต้นทาง" }}
                    →
                    {{ r.booking.route?.endLocation?.name || "ปลายทาง" }}
                    <span class="text-xs text-indigo-500 ml-2">
                      {{ formatDate(r.booking.route?.departureTime) }}
                    </span>
                  </p>
                </div>

                <!-- Attachments -->
                <div v-if="r.attachments && r.attachments.length" class="mt-3">
                  <!-- Section Label -->
                  <div class="flex items-center gap-2 mb-2">
                    <div class="h-px flex-1 bg-gray-100"></div>
                    <span
                      class="text-[11px] text-gray-400 font-medium tracking-wide uppercase flex items-center gap-1"
                    >
                      <i class="fas fa-paperclip text-[10px]"></i>
                      ไฟล์แนบ {{ r.attachments.length }} รายการ
                    </span>
                    <div class="h-px flex-1 bg-gray-100"></div>
                  </div>

                  <!-- Filmstrip Row -->
                  <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    <div
                      v-for="(file, index) in r.attachments"
                      :key="index"
                      class="relative flex-shrink-0 w-28 h-20 rounded-xl overflow-hidden cursor-pointer ring-2 ring-transparent hover:ring-blue-400 hover:ring-offset-1 shadow-sm hover:shadow-md transition-all duration-200 group"
                      @click="openLightbox(file.url, file.resourceType)"
                    >
                      <!-- ── IMAGE ── -->
                      <template v-if="file.resourceType === 'image'">
                        <img
                          :src="file.url"
                          class="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                        />

                        <!-- Gradient bottom -->
                        <div
                          class="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-200"
                        ></div>

                        <!-- Zoom icon -->
                        <div
                          class="absolute inset-0 flex items-center justify-center"
                        >
                          <div
                            class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-200 shadow"
                          >
                            <i
                              class="fas fa-magnifying-glass-plus text-white text-sm"
                            ></i>
                          </div>
                        </div>

                        <!-- Image badge -->
                        <div class="absolute top-1.5 left-1.5">
                          <span
                            class="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm text-white text-[10px] rounded-md font-medium"
                          >
                            <i class="fas fa-image text-[9px]"></i>
                            IMG
                          </span>
                        </div>
                      </template>

                      <!-- ── VIDEO ── -->
                      <template v-else-if="file.resourceType === 'video'">
                        <img
                          :src="getVideoThumbnail(file.url)"
                          class="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                        />

                        <!-- Dark overlay on hover -->
                        <div
                          class="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-200"
                        ></div>

                        <!-- Play button center -->
                        <div
                          class="absolute inset-0 flex items-center justify-center"
                        >
                          <!-- Idle state: small icon -->
                          <div
                            class="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-110 group-hover:bg-blue-500/80"
                          >
                            <i
                              class="fas fa-play text-white text-sm pl-0.5"
                            ></i>
                          </div>
                        </div>

                        <!-- Duration bar (bottom) -->
                        <div
                          class="absolute inset-x-0 bottom-0 px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent"
                        >
                          <div class="flex items-center justify-between">
                            <span
                              class="inline-flex items-center gap-1 text-white text-[10px] font-medium"
                            >
                              <i
                                class="fas fa-video text-[9px] text-blue-300"
                              ></i>
                              VDO
                            </span>
                            <!-- Animated dots เมื่อ hover -->
                            <span
                              class="text-[10px] text-white/70 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              แตะเพื่อเล่น
                            </span>
                          </div>
                        </div>
                      </template>

                      <!-- Index number badge (top-right) -->
                      <div
                        class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      >
                        <span class="text-white text-[9px] font-bold">{{
                          index + 1
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Location -->
                <div
                  v-if="r.location"
                  class="mt-2 text-xs text-gray-500 flex items-start gap-1"
                >
                  <i class="fas fa-location-dot text-red-500 mt-0.5"></i>
                  <span v-if="r.location.address" class="flex-1">{{
                    r.location.address
                  }}</span>
                  <span v-else
                    >{{ r.location.lat?.toFixed(6) }},
                    {{ r.location.lng?.toFixed(6) }}</span
                  >
                </div>

                <!-- Admin Note -->
                <div
                  v-if="r.adminNote"
                  class="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"
                >
                  <p class="text-xs font-medium text-blue-600 mb-1">
                    <i class="fas fa-comment-dots mr-1"></i>หมายเหตุจากแอดมิน
                  </p>
                  <p class="text-sm text-blue-800">{{ r.adminNote }}</p>
                </div>
              </div>
              <div
                class="flex flex-col items-end justify-between shrink-0 self-stretch min-w-[120px] ml-4"
              >
                <div class="flex flex-col items-end gap-1.5 mt-1">
                  <span
                    class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                    :class="statusBadge(r.status)"
                  >
                    <i class="mr-1 fas" :class="statusIcon(r.status)"></i>
                    {{ statusLabel(r.status) }}
                  </span>
                  <p class="text-xs text-gray-400 whitespace-nowrap">
                    {{ formatDate(r.createdAt) }}
                  </p>
                </div>
                <button
                  @click="openChat(r.id)"
                  class="mt-auto mb-1 px-4 py-1.5 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition shadow-sm w-full text-center"
                >
                  <i class="fas fa-comment-dots mr-1"></i>แชท
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Universal Lightbox -->
    <div
      v-if="lightboxUrl"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      @click.self="closeLightbox"
    >
      <div class="relative max-w-4xl max-h-[90vh]">
        <button
          @click="closeLightbox"
          class="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 transition"
        >
          <i class="fas fa-xmark"></i>
        </button>

        <!-- Image -->
        <img
          v-if="lightboxType === 'image'"
          :src="lightboxUrl"
          class="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
        />

        <!-- Video -->
        <video
          v-else-if="lightboxType === 'video'"
          :src="lightboxUrl"
          controls
          muted
          playsinline
          autoplay
          class="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
        ></video>
      </div>
    </div>

    <!-- Chat Overlay -->
    <div
      v-if="isChatOpen"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="closeChat"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col h-[80vh]"
      >
        <div class="px-4 py-3 border-b flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">
            <i class="fas fa-comment-dots mr-2 text-blue-500"></i>แชทรายงาน #{{
              activeReportId?.substring(0, 8)
            }}
          </h3>
          <button @click="closeChat" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-xmark text-xl"></i>
          </button>
        </div>
        <div
          ref="chatContainer"
          class="flex-1 p-4 overflow-y-auto space-y-4 chat-container"
        >
          <div
            v-for="msg in chatMessages"
            :key="msg.id"
            :class="[
              'flex',
              msg.senderId === user.id ? 'justify-end' : 'justify-start',
            ]"
          >
            <div
              :class="[
                'max-w-[70%]',
                'p-3 rounded-lg shadow-sm',
                msg.senderId === user.id
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none',
              ]"
            >
              <!-- Image attachment -->
              <div v-if="msg.fileUrl && msg.fileType === 'image'" class="mb-2">
                <img
                  :src="msg.fileUrl"
                  :alt="msg.fileName || 'รูปภาพ'"
                  class="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition"
                  style="max-height: 200px; object-fit: cover"
                  @click="openLightbox(msg.fileUrl)"
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
                    msg.senderId === user.id
                      ? 'bg-blue-400/30 hover:bg-blue-400/50 text-white'
                      : 'bg-gray-300/50 hover:bg-gray-300/80 text-gray-700'
                  "
                >
                  <i class="fas fa-file-arrow-down"></i>
                  <span class="text-sm truncate max-w-[180px]">{{
                    msg.fileName || "ดาวน์โหลดไฟล์"
                  }}</span>
                </a>
              </div>
              <p v-if="msg.content" class="text-sm">{{ msg.content }}</p>
              <p
                :class="[
                  'text-xs mt-1',
                  msg.senderId === user.id ? 'text-blue-200' : 'text-gray-500',
                ]"
              >
                {{ formatDate(msg.createdAt) }}
              </p>
            </div>
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
            class="text-gray-400 hover:text-red-500 transition"
          >
            <i class="fas fa-xmark text-lg"></i>
          </button>
        </div>
        <div class="p-4 border-t flex items-center gap-2">
          <!-- Attach file button -->
          <label
            class="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
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
            @keyup.enter="sendChatMessage"
            type="text"
            placeholder="พิมพ์ข้อความ..."
            maxlength="5000"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            @click="sendChatMessage"
            :disabled="(!chatInput.trim() && !chatFile) || isSendingMessage"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <i class="fas fa-paper-plane" v-if="!isSendingMessage"></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from "vue";
import { useRuntimeConfig, useCookie } from "#app";
import { useAuth } from "~/composables/useAuth";
import { useToast } from "~/composables/useToast";
import { io } from "socket.io-client";
import dayjs from "dayjs";
import "dayjs/locale/th";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.locale("th");
dayjs.extend(buddhistEra);

definePageMeta({ middleware: ["auth"] });

useHead({
  title: "My Reports - PaiNamNae",
  link: [
    {
      rel: "stylesheet",
      href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
    },
  ],
});

const config = useRuntimeConfig();
const isLoading = ref(false);
const isSubmitting = ref(false);
const submitError = ref("");
const submitSuccess = ref(false);
const reports = ref([]);
const lightboxUrl = ref(null);
const lightboxType = ref(null);
const selectedFiles = ref([]);
const previewFiles = ref([]);

// Chat
const { user } = useAuth(); // Get user for senderId check
const chatSocket = ref(null);
const activeReportId = ref(null);
const isChatOpen = ref(false);
const chatMessages = ref([]); // Local messages state
const chatInput = ref("");
const isSendingMessage = ref(false);
const chatContainer = ref(null);
const chatFile = ref(null);
const chatFilePreview = ref(null);
const chatFileInput = ref(null);

// --- Chat Functions (Mirrored from Admin) ---
const { toast } = useToast();

function initChatSocket() {
  const token = getToken();
  if (!token) return;

  if (chatSocket.value?.connected) return;

  // Use apiBase logic like Admin
  chatSocket.value = io(config.public.apiBase.replace("/api/", ""), {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  chatSocket.value.on("connect", () => {
    console.log("Chat connected");
    if (activeReportId.value) {
      chatSocket.value.emit("join_room", activeReportId.value);
    }
  });

  chatSocket.value.on("connect_error", (err) => {
    console.error("Chat connection error:", err);
    toast.error("ไม่สามารถเชื่อมต่อแชทได้: " + err.message);
  });

  chatSocket.value.on("new_message", (msg) => {
    // Only append if it belongs to current open report
    if (activeReportId.value && msg.reportId === activeReportId.value) {
      chatMessages.value.push(msg);
      scrollToBottom();
    }
  });
}

function openChat(reportId) {
  activeReportId.value = reportId;
  isChatOpen.value = true;
  chatMessages.value = []; // Clear old messages

  // Ensure socket is connected
  initChatSocket();

  // Join room
  if (chatSocket.value && chatSocket.value.connected) {
    chatSocket.value.emit("join_room", reportId);
  } else {
    // If not connected yet, it will auto-connect.
    // We can listen for connect event, but usually it's fast.
    // Or we can just emit in the init's connect handler?
    // Simpler: Just try emit. If not connected, it buffers or we handle in fetch
  }

  fetchChatMessages(reportId);
  setTimeout(scrollToBottom, 100);
}

function closeChat() {
  if (activeReportId.value && chatSocket.value) {
    chatSocket.value.emit("leave_room", activeReportId.value);
  }
  isChatOpen.value = false;
  activeReportId.value = null;
}

async function fetchChatMessages(reportId) {
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

async function sendChatMessage() {
  if ((!chatInput.value.trim() && !chatFile.value) || isSendingMessage.value)
    return;

  isSendingMessage.value = true;
  try {
    const token = getToken();
    const reportId = activeReportId.value;

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
      // message broadcast via socket from server, but if socket not connected add locally
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
          } else {
            toast.error(
              "ส่งข้อความไม่สำเร็จ: " + (response.message || "เกิดข้อผิดพลาด"),
            );
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
      if (!res.ok) throw new Error(body.message || "ส่งข้อความไม่สำเร็จ");
      chatMessages.value.push(body.data);
      chatInput.value = "";
      isSendingMessage.value = false;
      scrollToBottom();
    }
  } catch (err) {
    console.error("Send message error:", err);
    isSendingMessage.value = false;
    toast.error("ส่งข้อความไม่สำเร็จ: " + err.message);
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}

// ─── Sub-topics mapping (แยกตาม role) ───
const authData = useAuth();
const userRole = computed(() => authData.user.value?.role || "PASSENGER");

const passengerSubTopics = {
  SAFETY: [
    "อุบัติเหตุ",
    "การคุกคาม/ล่วงละเมิด",
    "คนขับมีพฤติกรรมไม่เหมาะสม",
    "เมาแล้วขับ",
    "ขับรถอันตราย",
    "อื่นๆ",
  ],
  TRIP_ISSUE: [
    "ขับอ้อมเส้นทาง",
    "คิดเงินผิด",
    "จุดรับ/ส่งผิด",
    "ไม่มาตามนัด",
    "เรียกเก็บค่าเสียหายไม่ถูกต้อง",
    "อื่นๆ",
  ],
  BEHAVIOR: [
    "คนขับไม่สุภาพ",
    "เปิดเพลงเสียงดัง",
    "สูบบุหรี่ในรถ",
    "รถไม่สะอาด",
    "อื่นๆ",
  ],
  PROPERTY: ["ลืมของในรถ", "ของเสียหาย", "อื่นๆ"],
  TECHNICAL: [
    "แอปล่ม",
    "GPS ผิดพลาด",
    "ชำระเงินไม่ได้",
    "ระบบคำนวณราคาผิด",
    "อื่นๆ",
  ],
};

const driverSubTopics = {
  SAFETY: [
    "อุบัติเหตุ",
    "ผู้โดยสารก่อกวน",
    "ผู้โดยสารคุกคาม",
    "ผู้โดยสารมึนเมา",
    "อื่นๆ",
  ],
  TRIP_ISSUE: [
    "ผู้โดยสารไม่มาตามนัด",
    "ผู้โดยสารเปลี่ยนจุดหมาย",
    "ผู้โดยสารไม่ชำระเงิน",
    "อื่นๆ",
  ],
  BEHAVIOR: [
    "ผู้โดยสารไม่สุภาพ",
    "ผู้โดยสารสูบบุหรี่ในรถ",
    "ผู้โดยสารทำเสียงดัง",
    "ผู้โดยสารทิ้งขยะ",
    "อื่นๆ",
  ],
  PROPERTY: ["ผู้โดยสารทำรถเสียหาย", "ของหายในรถ", "อื่นๆ"],
  TECHNICAL: [
    "แอปล่ม",
    "GPS ผิดพลาด",
    "ระบบคำนวณราคาผิด",
    "รับงานไม่ได้",
    "อื่นๆ",
  ],
};

const subTopics = computed(() => {
  const map =
    userRole.value === "DRIVER" ? driverSubTopics : passengerSubTopics;
  return map[form.value.incidentType] || [];
});

function onIncidentTypeChange() {
  form.value.title = ""; // reset หัวข้อเมื่อเปลี่ยนประเภท
  form.value.customTitle = ""; // reset custom title
}

function handleFileChange(event) {
  const files = Array.from(event.target.files);

  files.forEach((file) => {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("อนุญาตเฉพาะรูปภาพและวิดีโอเท่านั้น");
      return;
    }

    if (selectedFiles.value.length >= 5) {
      alert("อัปโหลดได้สูงสุด 5 ไฟล์");
      return;
    }

    selectedFiles.value.push(file);

    previewFiles.value.push({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image/") ? "image" : "video",
    });
  });

  event.target.value = "";
}

function removeFile(index) {
  URL.revokeObjectURL(previewFiles.value[index].url);

  previewFiles.value.splice(index, 1);
  selectedFiles.value.splice(index, 1);
}

function getVideoThumbnail(videoUrl) {
  // เปลี่ยน video URL เป็น thumbnail URL
  return videoUrl
    .replace("/video/upload/", "/video/upload/so_1,w_300,h_200,c_fill/")
    .replace(/\.(mp4|mov|webm)$/i, ".jpg");
}

// Map
const mapContainer = ref(null);
let map = null;
let marker;
let geocoder = null; // สำหรับแปลงพิกัดเป็นชื่อสถานที่

const GMAPS_CB = "__initReportMap__";

const myTrips = ref([]);

const form = ref({
  incidentType: "",
  priority: "MEDIUM",
  title: "",
  description: "",
  location: null,
  bookingId: "",
});

const priorityOptions = [
  {
    value: "LOW",
    label: "ต่ำ",
    icon: "fa-circle-down",
    activeClass: "bg-green-100 text-green-700 border-green-400",
  },
  {
    value: "MEDIUM",
    label: "ปานกลาง",
    icon: "fa-circle-minus",
    activeClass: "bg-yellow-100 text-yellow-700 border-yellow-400",
  },
  {
    value: "HIGH",
    label: "สูง",
    icon: "fa-circle-up",
    activeClass: "bg-orange-100 text-orange-700 border-orange-400",
  },
  {
    value: "CRITICAL",
    label: "วิกฤต",
    icon: "fa-circle-exclamation",
    activeClass: "bg-red-100 text-red-700 border-red-400",
  },
];

function getToken() {
  return (
    useCookie("token").value ||
    (process.client ? localStorage.getItem("token") : "")
  );
}

// ─── Map ───
function loadGoogleMaps() {
  if (typeof google !== "undefined" && google.maps) {
    initMap();
    return;
  }
  if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
    // Script already loading, just set callback
    window[GMAPS_CB] = initMap;
    return;
  }
  window[GMAPS_CB] = initMap;
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${config.public.googleMapsApiKey}&callback=${GMAPS_CB}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function initMap() {
  if (!mapContainer.value) return;
  const center = { lat: 13.7563, lng: 100.5018 }; // Bangkok
  map = new google.maps.Map(mapContainer.value, {
    center,
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
  });

  marker = new google.maps.Marker({
    map,
    draggable: true,
    visible: false,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#EF4444",
      fillOpacity: 1,
      strokeColor: "#fff",
      strokeWeight: 3,
    },
  });

  geocoder = new google.maps.Geocoder();

  async function geocodePosition(pos) {
    return new Promise((resolve) => {
      geocoder.geocode({ location: pos }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve("");
        }
      });
    });
  }

  map.addListener("click", async (e) => {
    const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    marker.setPosition(pos);
    marker.setVisible(true);
    form.value.location = pos;
    const address = await geocodePosition(pos);
    if (address) {
      form.value.location = { ...pos, address };
    }
  });

  marker.addListener("dragend", async (e) => {
    const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    form.value.location = pos;
    const address = await geocodePosition(pos);
    if (address) {
      form.value.location = { ...pos, address };
    }
  });

  // ดึงตำแหน่งปัจจุบันอัตโนมัติเมื่อแผนที่พร้อม
  getCurrentLocation();
}

function getCurrentLocation() {
  if (navigator.geolocation) {
    toast.info("กำลังค้นหาตำแหน่ง...", "กรุณารอสักครู่");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // เลื่อนแผนที่ไปที่ตำแหน่งปัจจุบัน
        if (map) {
          map.setCenter(pos);
          map.setZoom(15);
        }

        // ปักหมุด
        if (marker) {
          marker.setPosition(pos);
          marker.setVisible(true);
        }

        // กำหนดค่าลง form ให้มี lat/lng ไปก่อน
        form.value.location = pos;

        // ดึงชื่อสถานที่ด้วย Reverse Geocoding
        if (geocoder) {
          try {
            const address = await new Promise((resolve) => {
              geocoder.geocode({ location: pos }, (results, status) => {
                if (status === "OK" && results && results[0]) {
                  resolve(results[0].formatted_address);
                } else {
                  resolve("");
                }
              });
            });
            if (address) {
              form.value.location = { ...pos, address };
            }
          } catch (e) {
            console.error("Geocoder failed:", e);
          }
        }
        toast.success("พบตำแหน่งของคุณแล้ว", "พร้อมส่งรายงาน");
      },
      () => {
        toast.error(
          "ไม่สามารถดึงตำแหน่งได้",
          "กรุณาอนุญาตการเข้าถึงตำแหน่งและลองอีกครั้ง",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  } else {
    toast.error(
      "ไม่รองรับการดึงตำแหน่ง",
      "เบราว์เซอร์ของคุณไม่รองรับการดึงตำแหน่งปัจจุบัน",
    );
  }
}

function clearLocation() {
  form.value.location = null;
  if (marker) marker.setVisible(false);
}

function openLightbox(url, type = "image") {
  lightboxUrl.value = url;
  lightboxType.value = type;
}
function closeLightbox() {
  lightboxUrl.value = null;
  lightboxType.value = null;
}
function handleKey(e) {
  if (e.key === "Escape") closeLightbox();
}

onMounted(() => {
  window.addEventListener("keydown", handleKey);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKey);
});

// ─── API ───
async function fetchReports() {
  isLoading.value = true;
  try {
    const token = getToken();
    const res = await fetch(`${config.public.apiBase}reports/me`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.message || "Failed to fetch reports");
    reports.value = Array.isArray(body?.data) ? body.data : [];

    // Reverse geocoding สำหรับรายงานที่ไม่มี location.address อยู่ก่อน
    const apiKey = config.public.googleMapsApiKey;
    if (apiKey) {
      reports.value.forEach(async (r) => {
        if (
          r.location &&
          r.location.lat &&
          r.location.lng &&
          !r.location.address
        ) {
          try {
            const geoRes = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${r.location.lat},${r.location.lng}&key=${apiKey}`,
            );
            const geoBody = await geoRes.json();
            if (
              geoBody.status === "OK" &&
              geoBody.results &&
              geoBody.results[0]
            ) {
              // อัพเดทข้อมูลในตัวแปร r ทันที เพื่อให้ Vue ทำการ render ใหม่
              r.location.address = geoBody.results[0].formatted_address;
            }
          } catch (e) {
            console.error("Reverse Geocoding error:", e);
          }
        }
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

async function submitReport() {
  submitError.value = "";
  submitSuccess.value = false;

  // ถ้าเลือก 'อื่นๆ' ให้ใช้ customTitle แทน
  const actualTitle =
    form.value.title === "อื่นๆ" ? form.value.customTitle : form.value.title;

  if (!form.value.incidentType || !actualTitle || !form.value.description) {
    submitError.value =
      "กรุณากรอกข้อมูลให้ครบทุกช่อง (ประเภท, หัวข้อ, รายละเอียด)";
    return;
  }
  if (form.value.title === "อื่นๆ" && !form.value.customTitle) {
    submitError.value = "กรุณาระบุหัวข้อของคุณ";
    return;
  }
  if (!form.value.location) {
    submitError.value = "กรุณาปักหมุดตำแหน่งเหตุการณ์บนแผนที่";
    return;
  }

  isSubmitting.value = true;
  try {
    const token = getToken();

    const fd = new FormData();
    fd.append("incidentType", form.value.incidentType);
    fd.append("priority", form.value.priority || "MEDIUM");
    fd.append("title", actualTitle);
    fd.append("description", form.value.description);

    if (form.value.bookingId) {
      fd.append("bookingId", form.value.bookingId);
    }
    if (form.value.location) {
      fd.append("location", JSON.stringify(form.value.location));
    }
    selectedFiles.value.forEach((file) => {
      fd.append("attachments", file);
    });

    const res = await fetch(`${config.public.apiBase}reports`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: fd,
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.message || "Failed to create report");

    submitSuccess.value = true;

    selectedFiles.value = [];
    previewFiles.value = [];

    form.value = {
      incidentType: "",
      priority: "MEDIUM",
      title: "",
      description: "",
      location: null,
      bookingId: "",
      customTitle: "",
    };
    clearLocation();
    await fetchReports();
    setTimeout(() => {
      submitSuccess.value = false;
    }, 3000);
  } catch (err) {
    submitError.value = err.message;
  } finally {
    isSubmitting.value = false;
  }
}

function formatDate(iso) {
  if (!iso) return "-";
  return dayjs(iso).format("D MMM BBBB HH:mm");
}

// ─── Badge helpers ───
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

function tripLabel(trip) {
  const start = trip.route?.startLocation?.name || "ต้นทาง";
  const end = trip.route?.endLocation?.name || "ปลายทาง";
  const date = trip.route?.departureTime
    ? dayjs(trip.route.departureTime).format("D MMM BBBB HH:mm")
    : "";
  const role = trip.userRole === "DRIVER" ? "[คนขับ]" : "[ผู้โดยสาร]";
  return `${role} ${start} → ${end} (${date})`;
}

async function fetchMyTrips() {
  try {
    const token = getToken();
    const res = await fetch(`${config.public.apiBase}bookings/my-trips`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.message || "Failed to fetch trips");
    myTrips.value = Array.isArray(body?.data) ? body.data : [];
  } catch (err) {
    console.error("Failed to fetch trips for report:", err);
  }
}

onMounted(() => {
  fetchReports();
  fetchMyTrips();
  if (process.client) {
    loadGoogleMaps();
  }
});

onUnmounted(() => {
  if (window[GMAPS_CB]) delete window[GMAPS_CB];
  if (chatSocket.value) chatSocket.value.disconnect();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}
</style>
