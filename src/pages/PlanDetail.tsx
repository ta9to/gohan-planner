import { useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { loadPlans } from '../storage'
import MealCard from '../components/MealCard'
import styles from './PlanDetail.module.css'

function IconArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

const CATEGORY_LABELS: Record<string, string> = {
  produce: '野菜・果物',
  meat: '肉・魚',
  dairy: '乳製品・卵',
  grains: '穀物・パン',
  seasonings: '調味料',
  frozen: '冷凍食品',
  other: 'その他',
}

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const plan = useMemo(() => {
    if (!id) return null
    return loadPlans().find((p) => p.id === id) ?? null
  }, [id])

  if (!plan) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p className="empty-state-title">プランが見つかりません</p>
          <p className="empty-state-text">削除されたか、IDが不正です</p>
          <Link to="/plans" className="btn btn-primary">一覧に戻る</Link>
        </div>
      </div>
    )
  }

  const groupedShopping = plan.shoppingList.reduce<Record<string, typeof plan.shoppingList>>(
    (acc, item) => {
      const cat = item.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    },
    {}
  )

  return (
    <div className="page-container">
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <IconArrowLeft />
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{plan.title}</h1>
          <p className={styles.meta}>
            {plan.days}日間 · {plan.servings}人前 · {plan.mood}
          </p>
        </div>
      </div>

      {plan.nutritionalFocus.length > 0 && (
        <div className={styles.badges}>
          {plan.nutritionalFocus.map((f) => (
            <span key={f} className="badge">{f}</span>
          ))}
        </div>
      )}

      {plan.notes && (
        <div className={`card ${styles.notesCard}`}>
          <h3 className={styles.sectionTitle}>メモ</h3>
          <p className={styles.notesText}>{plan.notes}</p>
        </div>
      )}

      <h2 className={styles.sectionTitle}>日別の献立</h2>
      {plan.meals.map((dayMeal) => (
        <div key={dayMeal.day} className={styles.daySection}>
          <div className={styles.dayHeader}>
            <span className={styles.dayNumber}>Day {dayMeal.day}</span>
            {dayMeal.date && <span className={styles.dayDate}>{dayMeal.date}</span>}
          </div>
          <div className={styles.mealsGrid}>
            <MealCard type="breakfast" meal={dayMeal.breakfast} />
            <MealCard type="lunch" meal={dayMeal.lunch} />
            <MealCard type="dinner" meal={dayMeal.dinner} />
          </div>
        </div>
      ))}

      {plan.shoppingList.length > 0 && (
        <>
          <h2 className={`${styles.sectionTitle} ${styles.shoppingTitle}`}>買い物リスト</h2>
          <div className={styles.shoppingCategories}>
            {Object.entries(groupedShopping).map(([cat, items]) => (
              <div key={cat} className={`card ${styles.categoryCard}`}>
                <h3 className={styles.categoryLabel}>{getCategoryLabel(cat)}</h3>
                <ul className={styles.itemList}>
                  {items.map((item) => (
                    <li key={item.id} className={styles.shoppingItem}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemAmount}>{item.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
