import type { MealItem } from '../types'
import styles from './MealCard.module.css'

interface MealCardProps {
  type: 'breakfast' | 'lunch' | 'dinner'
  meal?: MealItem
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
}

const MEAL_ICONS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
}

export default function MealCard({ type, meal }: MealCardProps) {
  const label = MEAL_LABELS[type]
  const icon = MEAL_ICONS[type]

  return (
    <div className={`${styles.mealCard} ${styles[type]}`}>
      <div className={styles.mealHeader}>
        <span className={styles.mealIcon}>{icon}</span>
        <span className={styles.mealType}>{label}</span>
      </div>
      {meal ? (
        <div className={styles.mealBody}>
          <h4 className={styles.mealName}>{meal.name}</h4>
          {meal.description && (
            <p className={styles.mealDesc}>{meal.description}</p>
          )}
          <div className={styles.mealMeta}>
            {meal.cookTime > 0 && (
              <span className={styles.metaItem}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {meal.cookTime}分
              </span>
            )}
            {meal.nutrition?.highlight && (
              <span className={styles.nutritionBadge}>{meal.nutrition.highlight}</span>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.mealEmpty}>未設定</div>
      )}
    </div>
  )
}
