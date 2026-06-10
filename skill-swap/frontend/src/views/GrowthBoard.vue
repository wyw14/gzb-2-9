<template>
  <div class="growth-board">
    <div class="card">
      <div class="board-header">
        <div class="header-left">
          <h1 class="page-title">🚀 我的成长看板</h1>
          <p class="page-subtitle">聚合匹配、聊天、交换、评价与技能树，记录你的每一步成长</p>
        </div>
        <div v-if="data.myStats" class="rank-badge">
          <span class="rank-label">综合排名</span>
          <span class="rank-num">#{{ data.myStats.rank }}</span>
          <span class="rank-total">/ {{ data.myStats.totalUsers }}</span>
        </div>
      </div>

      <div v-if="data.todos && data.todos.length" class="todo-section">
        <div class="todo-title">
          <el-icon><Bell /></el-icon>
          <span>待办提醒</span>
          <el-tag size="small" type="danger" effect="dark">{{ data.todos.length }}</el-tag>
        </div>
        <div class="todo-list">
          <div
            v-for="item in data.todos"
            :key="item.id"
            class="todo-item"
            :class="`priority-${item.priority} type-${item.type}`"
            @click="handleTodoClick(item)"
          >
            <div class="todo-icon">
              <span v-if="item.type === 'exchange'">🤝</span>
              <span v-else-if="item.type === 'review'">⭐</span>
              <span v-else>💬</span>
            </div>
            <div class="todo-main">
              <div class="todo-top">
                <span class="todo-category" :class="`cat-${item.category}`">{{ item.category }}</span>
                <span class="todo-name">{{ item.title }}</span>
                <span v-if="item.counterpartyName" class="todo-counterparty">
                  <el-avatar :src="item.counterpartyAvatar" :size="20" />
                  {{ item.counterpartyName }}
                </span>
              </div>
              <div v-if="item.description" class="todo-desc">{{ item.description }}</div>
            </div>
            <div class="todo-meta">
              <span class="todo-time">{{ formatTime(item.time) }}</span>
              <el-icon class="todo-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <div v-if="data.myStats" class="stats-overview">
        <div class="stat-card" @click="activeSection = 'matches'">
          <div class="stat-icon match">🎯</div>
          <div class="stat-body">
            <div class="stat-value">{{ data.myStats.matchCount }}</div>
            <div class="stat-label">匹配人数</div>
          </div>
        </div>
        <div class="stat-card" @click="activeSection = 'chat'">
          <div class="stat-icon chat">💬</div>
          <div class="stat-body">
            <div class="stat-value">{{ data.myStats.totalMessages }}</div>
            <div class="stat-label">消息总量</div>
            <div class="stat-detail">
              发 {{ data.myStats.sentMessages }} / 收 {{ data.myStats.receivedMessages }}
            </div>
          </div>
        </div>
        <div class="stat-card" @click="activeSection = 'exchange'">
          <div class="stat-icon exchange">🤝</div>
          <div class="stat-body">
            <div class="stat-value">{{ data.myStats.completedExchanges }}</div>
            <div class="stat-label">已完成交换</div>
            <div class="stat-detail">待确认 {{ data.myStats.pendingExchanges }}</div>
          </div>
        </div>
        <div class="stat-card" @click="activeSection = 'review'">
          <div class="stat-icon review">⭐</div>
          <div class="stat-body">
            <div class="stat-value rate">
              <el-rate :model-value="data.myStats.avgRating" disabled size="small" />
              <em>{{ data.myStats.avgRating }}</em>
            </div>
            <div class="stat-label">评价分</div>
            <div class="stat-detail">{{ data.myStats.reviewCount }} 条评价</div>
          </div>
        </div>
        <div class="stat-card" @click="activeSection = 'skill'">
          <div class="stat-icon skill">🌳</div>
          <div class="stat-body">
            <div class="stat-value">{{ data.myStats.skillTreeCount }}</div>
            <div class="stat-label">技能树节点</div>
            <div class="stat-detail">
              教 {{ data.myStats.teachCount }} / 学 {{ data.myStats.learnCount }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-layout">
      <div class="card chart-card">
        <div class="section-header">
          <h2>📊 成长维度分布</h2>
        </div>
        <div ref="radarChartRef" style="height: 360px"></div>
      </div>

      <div class="card">
        <div class="section-header">
          <h2>🏅 综合成长榜</h2>
          <el-tag size="small" type="info">Top 10</el-tag>
        </div>
        <div class="leaderboard-list">
          <div
            v-for="(user, index) in topUsers"
            :key="user.id"
            class="leader-row"
            :class="{ 'is-me': user.id === data.myStats?.id }"
            @click="goToProfile(user.id)"
          >
            <div class="l-rank" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
            <el-avatar :src="user.avatar" :size="40" />
            <div class="l-info">
              <div class="l-name">
                {{ user.username }}
                <span v-if="user.id === data.myStats?.id" class="me-tag">我</span>
              </div>
              <div class="l-meta">
                <span>🎯 {{ user.matchCount }}</span>
                <span>💬 {{ user.totalMessages }}</span>
                <span>🤝 {{ user.completedExchanges }}</span>
                <span>🌳 {{ user.skillTreeCount }}</span>
              </div>
            </div>
            <div class="l-score">
              <div class="score-val">{{ calcScore(user) }}</div>
              <div class="score-label">综合得分</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-header">
        <h2>📝 成长时间线</h2>
        <div class="filter-tabs">
          <span
            v-for="t in timelineFilters"
            :key="t.key"
            class="filter-tab"
            :class="{ active: activeTimeline === t.key }"
            @click="activeTimeline = t.key"
          >{{ t.label }}</span>
        </div>
      </div>
      <div v-if="filteredTimeline.length" class="timeline">
        <div v-for="item in filteredTimeline" :key="item.id" class="tl-item" :class="item.type">
          <div class="tl-dot">
            <span v-if="item.type === 'message'">💬</span>
            <span v-else-if="item.type === 'exchange'">🤝</span>
            <span v-else>⭐</span>
          </div>
          <div class="tl-body">
            <div class="tl-header">
              <span class="tl-title">{{ item.title }}</span>
              <span v-if="item.counterpartyName" class="tl-user" @click.stop="goToProfile(item.counterparty)">
                <el-avatar :src="item.counterpartyAvatar" :size="20" />
                {{ item.counterpartyName }}
              </span>
              <span class="tl-time">{{ formatTime(item.time) }}</span>
            </div>
            <div v-if="item.description" class="tl-desc">{{ item.description }}</div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无成长记录" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { statsAPI } from '../api'
import dayjs from 'dayjs'
import { Bell, ArrowRight } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const router = useRouter()
const data = ref({ myStats: null, leaderboard: [], timeline: [], todos: [] })
const activeSection = ref('overview')
const activeTimeline = ref('all')
const radarChartRef = ref(null)
let radarChart = null

const timelineFilters = [
  { key: 'all', label: '全部' },
  { key: 'message', label: '消息' },
  { key: 'exchange', label: '交换' },
  { key: 'review', label: '评价' }
]

const topUsers = computed(() => (data.value.leaderboard || []).slice(0, 10))

const filteredTimeline = computed(() => {
  if (activeTimeline.value === 'all') return data.value.timeline || []
  return (data.value.timeline || []).filter(t => t.type === activeTimeline.value)
})

onMounted(async () => {
  try {
    const res = await statsAPI.getGrowthBoard()
    data.value = res.data
    nextTick(() => initRadarChart())
  } catch (e) {}
})

watch(() => data.value.myStats, () => {
  nextTick(() => initRadarChart())
})

function calcScore(u) {
  return (u.completedExchanges || 0) * 100 + (u.totalMessages || 0) + (u.matchCount || 0) * 2 + (u.skillTreeCount || 0) * 5
}

function goToProfile(userId) {
  router.push(`/profile/${userId}`)
}

function formatTime(t) {
  return dayjs(t).format('YYYY-MM-DD HH:mm')
}

function handleTodoClick(todo) {
  if (todo.action) {
    router.push(todo.action)
  } else if (todo.counterparty) {
    router.push(`/profile/${todo.counterparty}`)
  }
}

function initRadarChart() {
  if (!radarChartRef.value || !data.value.myStats) return
  if (radarChart) radarChart.dispose()
  radarChart = echarts.init(radarChartRef.value)
  const s = data.value.myStats
  const maxScore = 100
  const normalize = (v, max) => Math.min(100, Math.round((v / Math.max(max || 1, 1)) * 100))

  const indicators = [
    { name: '匹配度', max: maxScore },
    { name: '社交活跃', max: maxScore },
    { name: '交换成果', max: maxScore },
    { name: '口碑评分', max: maxScore },
    { name: '技能积累', max: maxScore }
  ]
  const values = [
    normalize(s.matchCount, 10),
    normalize(s.totalMessages, 50),
    normalize(s.completedExchanges, 5),
    normalize(s.avgRating * 20, 100),
    normalize((s.teachCount + s.learnCount + s.skillTreeCount), 10)
  ]

  radarChart.setOption({
    tooltip: {},
    radar: {
      indicator: indicators,
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: '#666', fontSize: 13, fontWeight: 600 },
      splitLine: { lineStyle: { color: '#eee' } },
      splitArea: { areaStyle: { color: ['#fafbff', '#f0f2ff'] } }
    },
    series: [{
      type: 'radar',
      data: [{
        value: values,
        name: '我的成长',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: 'rgba(102,126,234,0.5)' },
            { offset: 1, color: 'rgba(118,75,162,0.5)' }
          ])
        },
        lineStyle: { color: '#667eea', width: 2 },
        itemStyle: { color: '#667eea' }
      }]
    }]
  })
}
</script>

<style scoped>
.growth-board {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  margin: 0 0 8px;
  font-size: 26px;
  color: #333;
}

.page-subtitle {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.rank-badge {
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.rank-label {
  font-size: 12px;
  opacity: 0.85;
  margin-right: 4px;
}

.rank-num {
  font-size: 28px;
  font-weight: 700;
}

.rank-total {
  font-size: 14px;
  opacity: 0.85;
}

.todo-section {
  margin-top: 8px;
  padding: 20px;
  background: linear-gradient(135deg, #fff5f5 0%, #fff9f0 100%);
  border: 1px solid #ffd4d4;
  border-radius: 12px;
}

.todo-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #c0392b;
  margin-bottom: 16px;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: white;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid #e0e0e0;
}

.todo-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.12);
  border-color: #667eea40;
}

.todo-item.priority-high {
  border-left-color: #f56c6c;
}

.todo-item.priority-medium {
  border-left-color: #e6a23c;
}

.todo-item.priority-low {
  border-left-color: #67c23a;
}

.todo-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: #fafafa;
  flex-shrink: 0;
}

.todo-item.type-exchange .todo-icon { background: #e8f8ee; }
.todo-item.type-review .todo-icon { background: #fff3e0; }
.todo-item.type-message .todo-icon { background: #eef1ff; }

.todo-main {
  flex: 1;
  min-width: 0;
}

.todo-top {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.todo-category {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  background: #f0f0f0;
  color: #666;
}

.todo-category.cat-待确认 { background: #fef0f0; color: #f56c6c; }
.todo-category.cat-等待对方 { background: #fff9f0; color: #e6a23c; }
.todo-category.cat-待评价 { background: #fff3e0; color: #ff9800; }
.todo-category.cat-待回复 { background: #eef1ff; color: #667eea; }

.todo-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.todo-counterparty {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #667eea;
  margin-left: auto;
}

.todo-desc {
  margin-top: 6px;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.todo-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.todo-time {
  font-size: 11px;
  color: #aaa;
}

.todo-arrow {
  color: #667eea;
  font-size: 16px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  gap: 14px;
  padding: 20px;
  background: #fafbff;
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.stat-card:hover {
  border-color: #667eea;
  background: #f0f2ff;
  transform: translateY(-2px);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}

.stat-icon.match { background: #eef1ff; }
.stat-icon.chat { background: #fff7e6; }
.stat-icon.exchange { background: #e8f8ee; }
.stat-icon.review { background: #fff0e6; }
.stat-icon.skill { background: #e8f8ee; }

.stat-body {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

.stat-value.rate {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-value.rate em {
  font-style: normal;
  font-size: 16px;
  color: #ff9800;
}

.stat-label {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}

.stat-detail {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 420px;
  overflow-y: auto;
}

.leader-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  background: #fafafa;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.leader-row:hover {
  background: #f0f2ff;
  border-color: #667eea40;
}

.leader-row.is-me {
  background: linear-gradient(135deg, #667eea10, #764ba210);
  border-color: #667eea40;
}

.l-rank {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  background: #f0f0f0;
  color: #666;
  font-size: 13px;
  flex-shrink: 0;
}

.l-rank.rank-1 { background: linear-gradient(135deg, #ffd700, #ffb700); color: white; }
.l-rank.rank-2 { background: linear-gradient(135deg, #c0c0c0, #a0a0a0); color: white; }
.l-rank.rank-3 { background: linear-gradient(135deg, #cd7f32, #b87333); color: white; }

.l-info {
  flex: 1;
  min-width: 0;
}

.l-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.me-tag {
  background: #667eea;
  color: white;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
  font-weight: 500;
}

.l-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  flex-wrap: wrap;
}

.l-score {
  text-align: center;
  flex-shrink: 0;
}

.score-val {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
}

.score-label {
  font-size: 11px;
  color: #999;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  background: #f0f0f0;
  color: #666;
  transition: all 0.2s;
}

.filter-tab.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tl-item {
  display: flex;
  gap: 16px;
  padding-bottom: 24px;
  position: relative;
}

.tl-item:last-child {
  padding-bottom: 0;
}

.tl-item::before {
  content: '';
  position: absolute;
  left: 17px;
  top: 40px;
  bottom: 0;
  width: 2px;
  background: #eee;
}

.tl-item:last-child::before {
  display: none;
}

.tl-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 2px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  z-index: 1;
}

.tl-item.message .tl-dot { border-color: #667eea; background: #eef1ff; }
.tl-item.exchange .tl-dot { border-color: #67c23a; background: #e8f8ee; }
.tl-item.review .tl-dot { border-color: #ff9800; background: #fff3e0; }

.tl-body {
  flex: 1;
  padding: 6px 0;
}

.tl-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.tl-title {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.tl-user {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #667eea;
  cursor: pointer;
}

.tl-user:hover {
  text-decoration: underline;
}

.tl-time {
  margin-left: auto;
  font-size: 12px;
  color: #999;
}

.tl-desc {
  margin-top: 6px;
  color: #666;
  font-size: 13px;
  line-height: 1.5;
}

@media (max-width: 1024px) {
  .stats-overview { grid-template-columns: repeat(2, 1fr); }
  .grid-layout { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .stats-overview { grid-template-columns: 1fr; }
}
</style>
