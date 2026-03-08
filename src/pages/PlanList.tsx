import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { loadPlans, loadActivePlanId, saveActivePlanId, deletePlan } from '../storage'
import type { MealPlan } from '../types'
import styles from './PlanList.module.css'

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function PlanList() {
  const [plans, setPlans] = useState<MealPlan[]>(() => loadPlans())
  const [activePlanId, setActivePlanId] = useState<string | null>(() => loadActivePlanId())
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleSetActive = useCallback((id: string) => {
    saveActivePlanId(id)
    setActivePlanId(id)
  }, [])

  const handleDeleteRequest = useCallback((id: string) => {
    setDeleteConfirmId(id)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteConfirmId) return
    deletePlan(deleteConfirmId)
    setPlans(loadPlans())
    setActivePlanId(loadActivePlanId())
    setDeleteConfirmId(null)
  }, [deleteConfirmId])

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmId(null)
  }, [])

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">献立一覧</h1>
        <p className="page-subtitle">{plans.length}件のプラン</p>
      </div>

      {plans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-title">プランがありません</p>
          <p className="empty-state-text">
            インポート画面からJSONをペーストして追加できます
          </p>
          <Link to="/import" className="btn btn-primary">
            献立をインポート
          </Link>
        </div>
      ) : (
        <div className={styles.planList}>
          {plans.map((plan) => (
            <div key={plan.id} className={`card ${styles.planCard} ${activePlanId === plan.id ? styles.activePlan : ''}`}>
              {activePlanId === plan.id && (
                <div className={styles.activeTag}>アクティブ</div>
              )}
              <Link to={`/plans/${plan.id}`} className={styles.planCardLink}>
                <h2 className={styles.planTitle}>{plan.title}</h2>
                <div className={styles.planMeta}>
                  <span>{formatDate(plan.createdAt)}</span>
                  <span>·</span>
                  <span>{plan.days}日間</span>
                  <span>·</span>
                  <span>{plan.servings}人前</span>
                </div>
                {plan.mood && (
                  <div className={styles.moodBadge}>
                    <span className="badge badge-accent">{plan.mood}</span>
                  </div>
                )}
                {plan.nutritionalFocus.length > 0 && (
                  <div className={styles.focusBadges}>
                    {plan.nutritionalFocus.slice(0, 3).map((f) => (
                      <span key={f} className="badge">{f}</span>
                    ))}
                    {plan.nutritionalFocus.length > 3 && (
                      <span className="badge">+{plan.nutritionalFocus.length - 3}</span>
                    )}
                  </div>
                )}
              </Link>
              <div className={styles.planActions}>
                {activePlanId !== plan.id ? (
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleSetActive(plan.id)}
                  >
                    買い物リストに設定
                  </button>
                ) : (
                  <span className={styles.activeLabel}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    設定済み
                  </span>
                )}
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteRequest(plan.id)}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirmId && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <h3 className={styles.dialogTitle}>プランを削除しますか？</h3>
            <p className={styles.dialogText}>
              「{plans.find((p) => p.id === deleteConfirmId)?.title}」を削除します。この操作は元に戻せません。
            </p>
            <div className={styles.dialogActions}>
              <button className="btn btn-secondary" onClick={handleDeleteCancel}>
                キャンセル
              </button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
