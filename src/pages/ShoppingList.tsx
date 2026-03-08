import { useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { loadPlans, loadActivePlanId, updateShoppingItems } from '../storage'
import type { MealPlan, ShoppingItem } from '../types'
import styles from './ShoppingList.module.css'

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

function groupByCategory(items: ShoppingItem[]): Record<string, ShoppingItem[]> {
  return items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    const cat = item.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})
}

export default function ShoppingList() {
  const activePlanId = useMemo(() => loadActivePlanId(), [])
  const [plan, setPlan] = useState<MealPlan | null>(() => {
    if (!activePlanId) return null
    return loadPlans().find((p) => p.id === activePlanId) ?? null
  })

  const handleToggle = useCallback((itemId: string) => {
    if (!plan) return
    const updated = plan.shoppingList.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    )
    const updatedPlan = { ...plan, shoppingList: updated }
    updateShoppingItems(plan.id, updated)
    setPlan(updatedPlan)
  }, [plan])

  const handleReset = useCallback(() => {
    if (!plan) return
    const updated = plan.shoppingList.map((item) => ({ ...item, checked: false }))
    const updatedPlan = { ...plan, shoppingList: updated }
    updateShoppingItems(plan.id, updated)
    setPlan(updatedPlan)
  }, [plan])

  if (!plan) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">買い物リスト</h1>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <p className="empty-state-title">アクティブなプランがありません</p>
          <p className="empty-state-text">
            献立一覧からプランを選んで「買い物リストに設定」してください
          </p>
          <Link to="/plans" className="btn btn-primary">
            献立一覧へ
          </Link>
        </div>
      </div>
    )
  }

  const items = plan.shoppingList
  const checkedCount = items.filter((i) => i.checked).length
  const totalCount = items.length
  const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  const uncheckedItems = items.filter((i) => !i.checked)
  const checkedItems = items.filter((i) => i.checked)
  const uncheckedGroups = groupByCategory(uncheckedItems)
  const checkedGroups = groupByCategory(checkedItems)

  return (
    <div className="page-container">
      <div className="page-header">
        <div className={styles.headerRow}>
          <div>
            <h1 className="page-title">買い物リスト</h1>
            <p className="page-subtitle">{plan.title}</p>
          </div>
          <button
            className={`btn btn-secondary ${styles.resetBtn}`}
            onClick={handleReset}
          >
            リセット
          </button>
        </div>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <span>{checkedCount} / {totalCount} 完了</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {Object.keys(uncheckedGroups).length > 0 && (
        <div className={styles.categorySection}>
          {Object.entries(uncheckedGroups).map(([cat, catItems]) => (
            <div key={cat} className={`card ${styles.categoryCard}`}>
              <h3 className={styles.categoryLabel}>
                {getCategoryLabel(cat)}
                <span className={styles.categoryCount}>{catItems.length}</span>
              </h3>
              <ul className={styles.itemList}>
                {catItems.map((item) => (
                  <li key={item.id}>
                    <label className={styles.itemRow}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={item.checked}
                        onChange={() => handleToggle(item.id)}
                      />
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemAmount}>{item.amount}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {checkedItems.length > 0 && (
        <div className={styles.checkedSection}>
          <h3 className={styles.checkedTitle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            完了済み ({checkedItems.length})
          </h3>
          {Object.entries(checkedGroups).map(([cat, catItems]) => (
            <div key={cat} className={`card ${styles.categoryCard} ${styles.checkedCard}`}>
              <h3 className={styles.categoryLabel}>{getCategoryLabel(cat)}</h3>
              <ul className={styles.itemList}>
                {catItems.map((item) => (
                  <li key={item.id}>
                    <label className={`${styles.itemRow} ${styles.checkedItem}`}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={item.checked}
                        onChange={() => handleToggle(item.id)}
                      />
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemAmount}>{item.amount}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
