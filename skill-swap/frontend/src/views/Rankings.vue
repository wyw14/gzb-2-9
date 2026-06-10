<template>
  <div class="rankings">
    <div class="card">
      <h1 class="page-title">技能供需与导师榜</h1>

      <div class="stats-overview">
        <div class="stat-card big">
          <div class="stat-icon">📊</div>
          <div>
            <div class="stat-value">{{ stats.successRate }}%</div>
            <div class="stat-label">交换成功率</div>
          </div>
        </div>
        <div class="stat-card big">
          <div class="stat-icon">🤝</div>
          <div>
            <div class="stat-value">{{ stats.completedExchanges }}</div>
            <div class="stat-label">已完成交换</div>
          </div>
        </div>
        <div class="stat-card big">
          <div class="stat-icon">👥</div>
          <div>
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </div>
        <div class="stat-card big">
          <div class="stat-icon">📚</div>
          <div>
            <div class="stat-value">{{ stats.totalSkills }}</div>
            <div class="stat-label">技能总数</div>
          </div>
        </div>
      </div>

      <div class="ranking-tabs">
        <div class="tab" :class="{ active: activeTab === 'hot-learn' }" @click="activeTab = 'hot-learn'">
          🔥 热门想学
        </div>
        <div class="tab" :class="{ active: activeTab === 'hot-teach' }" @click="activeTab = 'hot-teach'">
          🎓 热门可教
        </div>
        <div class="tab" :class="{ active: activeTab === 'gap' }" @click="activeTab = 'gap'">
          📈 供需缺口
        </div>
        <div class="tab" :class="{ active: activeTab === 'mentors' }" @click="activeTab = 'mentors'">
          ⭐ 高评分导师
        </div>
        <div class="tab" :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'">
          🏆 活跃交换者
        </div>
      </div>

      <div v-if="activeTab === 'hot-learn'" class="ranking-content">
        <div ref="hotLearnChartRef" style="height: 400px"></div>
        <div class="ranking-list">
          <div v-for="(skill, index) in hotLearnSkills" :key="skill.name" class="ranking-item clickable" @click="goToMatches(skill.name)">
            <div class="rank-num" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
            <div class="rank-info">
              <span class="rank-name">{{ skill.name }}</span>
              <div class="rank-bars">
                <div class="bar-item">
                  <span class="bar-label">想学</span>
                  <div class="bar-track">
                    <div class="bar-fill learn" :style="{ width: getBarWidth(skill.learnCount) }"></div>
                  </div>
                  <span class="bar-value">{{ skill.learnCount }}</span>
                </div>
                <div class="bar-item">
                  <span class="bar-label">可教</span>
                  <div class="bar-track">
                    <div class="bar-fill teach" :style="{ width: getBarWidth(skill.teachCount) }"></div>
                  </div>
                  <span class="bar-value">{{ skill.teachCount }}</span>
                </div>
              </div>
            </div>
            <div class="rank-total">{{ skill.learnCount }} 人想学</div>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'hot-teach'" class="ranking-content">
        <div ref="hotTeachChartRef" style="height: 400px"></div>
        <div class="ranking-list">
          <div v-for="(skill, index) in hotTeachSkills" :key="skill.name" class="ranking-item clickable" @click="goToMatches(skill.name)">
            <div class="rank-num" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
            <div class="rank-info">
              <span class="rank-name">{{ skill.name }}</span>
              <div class="rank-bars">
                <div class="bar-item">
                  <span class="bar-label">可教</span>
                  <div class="bar-track">
                    <div class="bar-fill teach" :style="{ width: getBarWidth(skill.teachCount) }"></div>
                  </div>
                  <span class="bar-value">{{ skill.teachCount }}</span>
                </div>
                <div class="bar-item">
                  <span class="bar-label">想学</span>
                  <div class="bar-track">
                    <div class="bar-fill learn" :style="{ width: getBarWidth(skill.learnCount) }"></div>
                  </div>
                  <span class="bar-value">{{ skill.learnCount }}</span>
                </div>
              </div>
            </div>
            <div class="rank-total">{{ skill.teachCount }} 人可教</div>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'gap'" class="ranking-content">
        <div ref="gapChartRef" style="height: 400px"></div>
        <div class="ranking-list">
          <div v-for="(skill, index) in gapSkills" :key="skill.name" class="ranking-item clickable" @click="goToMatches(skill.name)">
            <div class="rank-num" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
            <div class="rank-info">
              <span class="rank-name">{{ skill.name }}</span>
              <div class="demand-info">
                <span class="demand-tag" :class="skill.demand > 0 ? 'high' : 'low'">
                  {{ skill.demand > 0 ? `缺口 ${skill.demand} 人` : `过剩 ${Math.abs(skill.demand)} 人` }}
                </span>
              </div>
            </div>
            <div class="demand-ratio">
              {{ skill.learnCount }} / {{ skill.teachCount }}
              <small>学/教</small>
            </div>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'mentors'" class="ranking-content">
        <div class="users-grid">
          <div v-for="(mentor, index) in mentors" :key="mentor.id" class="user-rank-card" @click="goToProfile(mentor.id)">
            <div class="user-rank-num" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
            <el-avatar :src="mentor.avatar" :size="64" />
            <div class="user-rank-name">{{ mentor.username }}</div>
            <div class="user-rank-rating">
              <el-rate :model-value="mentor.rating" disabled size="small" />
              <span class="rating-num">{{ mentor.rating }}</span>
            </div>
            <div class="mentor-skills-preview">
              <span v-for="s in mentor.teachSkills?.slice(0, 3)" :key="s" class="mini-skill-tag">{{ s }}</span>
              <span v-if="mentor.teachSkills?.length > 3" class="mini-skill-tag more">+{{ mentor.teachSkills.length - 3 }}</span>
            </div>
            <div class="user-rank-stats">
              <div class="stat">
                <span class="num">{{ mentor.reviewCount || 0 }}</span>
                <span class="label">评价</span>
              </div>
              <div class="stat">
                <span class="num">{{ mentor.exchangeCount || 0 }}</span>
                <span class="label">交换</span>
              </div>
              <div class="stat">
                <span class="num">{{ mentor.teachSkills?.length || 0 }}</span>
                <span class="label">可教</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'active'" class="ranking-content">
        <div ref="activeChartRef" style="height: 400px"></div>
        <div class="ranking-list">
          <div v-for="(user, index) in activeExchangers" :key="user.id" class="ranking-item clickable user-row" @click="goToProfile(user.id)">
            <div class="rank-num" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
            <el-avatar :src="user.avatar" :size="48" />
            <div class="rank-info">
              <span class="rank-name">{{ user.username }}</span>
              <div class="user-sub-stats">
                <span class="sub-stat">
                  <el-rate :model-value="user.rating" disabled size="small" />
                  <em>{{ user.rating }}</em>
                </span>
                <span class="sub-stat teach">{{ user.teachCount }} 可教</span>
                <span class="sub-stat learn">{{ user.learnCount }} 想学</span>
              </div>
            </div>
            <div class="exchange-badge">{{ user.exchangeCount }} 次交换</div>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { statsAPI } from '../api'
import { ArrowRight } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const router = useRouter()
const activeTab = ref('hot-learn')
const stats = ref({ totalUsers: 0, totalSkills: 0, completedExchanges: 0, successRate: 0 })
const popularSkills = ref([])
const mentors = ref([])
const activeExchangers = ref([])

const hotLearnChartRef = ref(null)
const hotTeachChartRef = ref(null)
const gapChartRef = ref(null)
const activeChartRef = ref(null)
let hotLearnChart = null
let hotTeachChart = null
let gapChart = null
let activeChart = null

const hotLearnSkills = computed(() =>
  [...popularSkills.value].sort((a, b) => b.learnCount - a.learnCount)
)

const hotTeachSkills = computed(() =>
  [...popularSkills.value].sort((a, b) => b.teachCount - a.teachCount)
)

const gapSkills = computed(() =>
  [...popularSkills.value].sort((a, b) => b.demand - a.demand)
)

const maxCount = computed(() =>
  Math.max(...popularSkills.value.map(s => Math.max(s.teachCount, s.learnCount)), 1)
)

onMounted(async () => {
  await loadStats()
  await loadPopularSkills()
  await loadMentors()
  await loadActiveExchangers()
})

watch(activeTab, (newTab) => {
  nextTick(() => {
    if (newTab === 'hot-learn') initHotLearnChart()
    else if (newTab === 'hot-teach') initHotTeachChart()
    else if (newTab === 'gap') initGapChart()
    else if (newTab === 'active') initActiveChart()
  })
})

async function loadStats() {
  const res = await statsAPI.getSuccessRate()
  stats.value = res.data
}

async function loadPopularSkills() {
  const res = await statsAPI.getPopularSkills()
  popularSkills.value = res.data.slice(0, 15)
  nextTick(() => initHotLearnChart())
}

async function loadMentors() {
  try {
    const res = await statsAPI.getMentors()
    mentors.value = res.data
  } catch (e) {
    mentors.value = []
  }
}

async function loadActiveExchangers() {
  try {
    const res = await statsAPI.getActiveExchangers()
    activeExchangers.value = res.data
  } catch (e) {
    activeExchangers.value = []
  }
}

function getBarWidth(count) {
  return `${(count / maxCount.value) * 100}%`
}

function goToMatches(skillName) {
  router.push({ path: '/matches', query: { skill: skillName } })
}

function goToProfile(userId) {
  router.push(`/profile/${userId}`)
}

function initHotLearnChart() {
  if (!hotLearnChartRef.value) return
  if (hotLearnChart) hotLearnChart.dispose()
  hotLearnChart = echarts.init(hotLearnChartRef.value)
  const data = hotLearnSkills.value.slice(0, 10)
  hotLearnChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['想学人数', '可教人数'] },
    xAxis: { type: 'category', data: data.map(s => s.name) },
    yAxis: { type: 'value' },
    series: [
      { name: '想学人数', type: 'bar', data: data.map(s => s.learnCount), itemStyle: { color: '#e6a23c' } },
      { name: '可教人数', type: 'bar', data: data.map(s => s.teachCount), itemStyle: { color: '#67c23a' } }
    ]
  })
}

function initHotTeachChart() {
  if (!hotTeachChartRef.value) return
  if (hotTeachChart) hotTeachChart.dispose()
  hotTeachChart = echarts.init(hotTeachChartRef.value)
  const data = hotTeachSkills.value.slice(0, 10)
  hotTeachChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['可教人数', '想学人数'] },
    xAxis: { type: 'category', data: data.map(s => s.name) },
    yAxis: { type: 'value' },
    series: [
      { name: '可教人数', type: 'bar', data: data.map(s => s.teachCount), itemStyle: { color: '#67c23a' } },
      { name: '想学人数', type: 'bar', data: data.map(s => s.learnCount), itemStyle: { color: '#e6a23c' } }
    ]
  })
}

function initGapChart() {
  if (!gapChartRef.value) return
  if (gapChart) gapChart.dispose()
  gapChart = echarts.init(gapChartRef.value)
  const data = gapSkills.value.slice(0, 10)
  gapChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['供需缺口'] },
    xAxis: { type: 'category', data: data.map(s => s.name) },
    yAxis: { type: 'value', name: '缺口（想学-可教）' },
    series: [{
      name: '供需缺口',
      type: 'bar',
      data: data.map(s => s.demand),
      itemStyle: {
        color: params => params.data >= 0 ? '#f56c6c' : '#67c23a'
      }
    }]
  })
}

function initActiveChart() {
  if (!activeChartRef.value) return
  if (activeChart) activeChart.dispose()
  activeChart = echarts.init(activeChartRef.value)
  const data = activeExchangers.value.slice(0, 10)
  activeChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map(u => u.username) },
    yAxis: { type: 'value', name: '交换次数' },
    series: [{
      name: '交换次数',
      type: 'bar',
      data: data.map(u => u.exchangeCount),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#667eea' },
          { offset: 1, color: '#764ba2' }
        ])
      }
    }]
  })
}
</script>

<style scoped>
.rankings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card.big {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  border-radius: 12px;
}

.stat-card.big .stat-icon {
  font-size: 48px;
}

.stat-card.big .stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.stat-card.big .stat-label {
  color: #666;
  font-size: 14px;
}

.ranking-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  border-bottom: 2px solid #eee;
  overflow-x: auto;
}

.tab {
  padding: 12px 20px;
  cursor: pointer;
  font-weight: 500;
  color: #999;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 14px;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab:hover:not(.active) {
  color: #667eea80;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
  transition: all 0.2s;
}

.ranking-item.clickable {
  cursor: pointer;
}

.ranking-item.clickable:hover {
  background: #f0f2ff;
  transform: translateX(4px);
}

.rank-num {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  background: #f0f0f0;
  color: #666;
  flex-shrink: 0;
}

.rank-1 { background: linear-gradient(135deg, #ffd700, #ffb700); color: white; }
.rank-2 { background: linear-gradient(135deg, #c0c0c0, #a0a0a0); color: white; }
.rank-3 { background: linear-gradient(135deg, #cd7f32, #b87333); color: white; }

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-name {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  display: block;
  margin-bottom: 12px;
}

.rank-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 40px;
  font-size: 12px;
  color: #666;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s;
}

.bar-fill.teach { background: linear-gradient(90deg, #67c23a, #85ce61); }
.bar-fill.learn { background: linear-gradient(90deg, #e6a23c, #f0c78a); }

.bar-value {
  width: 40px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.rank-total {
  font-size: 16px;
  font-weight: 700;
  color: #667eea;
  white-space: nowrap;
}

.arrow-icon {
  color: #667eea;
  font-size: 18px;
  flex-shrink: 0;
}

.ranking-item.clickable:hover .arrow-icon {
  transform: translateX(4px);
}

.demand-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.demand-tag.high { background: #fef0f0; color: #f56c6c; }
.demand-tag.low { background: #f0f9ff; color: #67c23a; }

.demand-ratio {
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.demand-ratio small {
  display: block;
  font-size: 12px;
  color: #999;
  font-weight: normal;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.user-rank-card {
  position: relative;
  background: #fafafa;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.user-rank-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
}

.user-rank-num {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  background: #f0f0f0;
  color: #666;
}

.user-rank-name {
  font-weight: 600;
  color: #333;
  margin: 12px 0 8px;
}

.user-rank-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #ff9800;
  font-weight: 600;
}

.rating-num {
  font-size: 14px;
}

.mentor-skills-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  margin-bottom: 16px;
  min-height: 26px;
}

.mini-skill-tag {
  padding: 2px 8px;
  background: #667eea15;
  color: #667eea;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.mini-skill-tag.more {
  background: #f0f2ff;
  color: #999;
}

.user-rank-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.user-rank-stats .stat {
  display: flex;
  flex-direction: column;
}

.user-rank-stats .num {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
}

.user-rank-stats .label {
  font-size: 12px;
  color: #999;
}

.user-row {
  gap: 16px;
}

.user-sub-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.sub-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

.sub-stat em {
  font-style: normal;
  font-weight: 600;
  color: #ff9800;
  margin-left: 2px;
}

.sub-stat.teach {
  color: #67c23a;
  font-weight: 500;
}

.sub-stat.learn {
  color: #e6a23c;
  font-weight: 500;
}

.exchange-badge {
  padding: 6px 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 1024px) {
  .stats-overview { grid-template-columns: repeat(2, 1fr); }
  .users-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .ranking-tabs { gap: 0; }
  .tab { padding: 10px 12px; font-size: 13px; }
  .users-grid { grid-template-columns: 1fr; }
}
</style>
