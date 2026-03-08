import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { loadPlans, loadActivePlanId } from '../storage'
import MealCard from '../components/MealCard'
import type { DayMeal } from '../types'
import styles from './Dashboard.module.css'

function getTodayMeals(plans: ReturnType<typeof loadPlans>, activePlanId: string | null): DayMeal | null {
  if (!activePlanId) return null
  const plan = plans.find((p) => p.id === activePlanId)
  if (!plan) return null

  const today = new Date()
  const planStart = new Date(plan.createdAt)
  planStart.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((today.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0 || diffDays >= plan.days) {
    return plan.meals[0] ?? null
  }
  return plan.meals[diffDays] ?? plan.meals[0] ?? null
}

export default function Dashboard() {
  const plans = useMemo(() => loadPlans(), [])
  const activePlanId = useMemo(() => loadActivePlanId(), [])
  const activePlan = useMemo(() => plans.find((p) => p.id === activePlanId) ?? null, [plans, activePlanId])
  const todayMeals = useMemo(() => getTodayMeals(plans, activePlanId), [plans, activePlanId])

  const todayStr = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <div className="page-container">
      <div className={styles.header}>
        <div>
          <p className={styles.dateLabel}>{todayStr}</p>
          <h1 className={styles.title}>献立プランナー</h1>
        </div>
      </div>

      {activePlan ? (
        <>
          <div className={`card ${styles.activePlanCard}`}>
            <div className={styles.activePlanBadge}>アクティブプラン</div>
            <h2 className={styles.activePlanTitle}>{activePlan.title}</h2>
            <div className={styles.activePlanMeta}>
              <span>{activePlan.days}日間</span>
              <span>·</span>
              <span>{activePlan.servings}人前</span>
              <span>·</span>
              <span>{activePlan.mood}</span>
            </div>
            {activePlan.nutritionalFocus.length > 0 && (
              <div className={styles.badges}>
                {activePlan.nutritionalFocus.map((focus) => (
                  <span key={focus} className="badge">{focus}</span>
                ))}
              </div>
            )}
            <Link to={`/plans/${activePlan.id}`} className={`btn btn-secondary ${styles.detailBtn}`}>
              詳細を見る
            </Link>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>今日のご飯</h3>
            {todayMeals ? (
              <div className={styles.mealsGrid}>
                <MealCard type="breakfast" meal={todayMeals.breakfast} />
                <MealCard type="lunch" meal={todayMeals.lunch} />
                <MealCard type="dinner" meal={todayMeals.dinner} />
              </div>
            ) : (
              <p className={styles.noMeals}>今日の献立データがありません</p>
            )}
          </div>

          <div className={styles.section}>
            <Link to="/shopping" className="btn btn-primary btn-full">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              買い物リストを見る
            </Link>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🍱</div>
          <p className="empty-state-title">アクティブなプランがありません</p>
          <p className="empty-state-text">
            献立プランをインポートして、今日から使い始めましょう
          </p>
          <Link to="/import" className="btn btn-primary">
            献立をインポート
          </Link>
        </div>
      )}
    </div>
  )
}
