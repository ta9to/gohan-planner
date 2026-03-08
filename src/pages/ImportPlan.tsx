import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { validateMealPlan, importPlan, loadPlans } from '../storage'
import type { MealPlan } from '../types'
import styles from './ImportPlan.module.css'

type ParseState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'valid'; plan: MealPlan }

export default function ImportPlan() {
  const navigate = useNavigate()
  const [jsonText, setJsonText] = useState('')
  const [parseState, setParseState] = useState<ParseState>({ status: 'idle' })
  const [overwriteConfirm, setOverwriteConfirm] = useState(false)
  const [pendingPlan, setPendingPlan] = useState<MealPlan | null>(null)

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setJsonText(text)
    setParseState({ status: 'idle' })
    setOverwriteConfirm(false)
    setPendingPlan(null)

    if (!text.trim()) return

    try {
      const parsed: unknown = JSON.parse(text)
      const plan = validateMealPlan(parsed)
      setParseState({ status: 'valid', plan })
    } catch (err) {
      if (err instanceof SyntaxError) {
        setParseState({ status: 'error', message: `JSONの構文エラー: ${err.message}` })
      } else if (err instanceof Error) {
        setParseState({ status: 'error', message: err.message })
      } else {
        setParseState({ status: 'error', message: '不明なエラーが発生しました' })
      }
    }
  }, [])

  const handleImport = useCallback(() => {
    if (parseState.status !== 'valid') return
    const plan = parseState.plan

    const existing = loadPlans()
    const isDuplicate = existing.some((p) => p.id === plan.id)

    if (isDuplicate && !overwriteConfirm) {
      setPendingPlan(plan)
      setOverwriteConfirm(true)
      return
    }

    importPlan(plan)
    navigate('/plans')
  }, [parseState, overwriteConfirm, navigate])

  const handleCancelOverwrite = useCallback(() => {
    setOverwriteConfirm(false)
    setPendingPlan(null)
  }, [])

  const handleConfirmOverwrite = useCallback(() => {
    if (!pendingPlan) return
    importPlan(pendingPlan)
    navigate('/plans')
  }, [pendingPlan, navigate])

  const shoppingCount = parseState.status === 'valid'
    ? parseState.plan.shoppingList.length
    : 0

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">献立をインポート</h1>
        <p className="page-subtitle">Claude Codeスキルで生成したJSONをペーストしてください</p>
      </div>

      <div className={`card ${styles.importCard}`}>
        <label className={styles.label} htmlFor="json-input">
          MealPlan JSON
        </label>
        <textarea
          id="json-input"
          className={`${styles.textarea} ${
            parseState.status === 'error' ? styles.textareaError :
            parseState.status === 'valid' ? styles.textareaValid : ''
          }`}
          placeholder={'{\n  "id": "...",\n  "title": "今週の献立",\n  ...\n}'}
          value={jsonText}
          onChange={handleTextChange}
          rows={12}
          spellCheck={false}
        />

        {parseState.status === 'error' && (
          <div className={styles.errorMsg}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {parseState.message}
          </div>
        )}

        {parseState.status === 'valid' && (
          <div className={styles.preview}>
            <div className={styles.previewTitle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              プレビュー
            </div>
            <div className={styles.previewGrid}>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>タイトル</span>
                <span className={styles.previewValue}>{parseState.plan.title}</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>日数</span>
                <span className={styles.previewValue}>{parseState.plan.days}日間</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>人数</span>
                <span className={styles.previewValue}>{parseState.plan.servings}人前</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>食材数</span>
                <span className={styles.previewValue}>{shoppingCount}品目</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>気分</span>
                <span className={styles.previewValue}>{parseState.plan.mood || '—'}</span>
              </div>
            </div>
            {parseState.plan.nutritionalFocus.length > 0 && (
              <div className={styles.previewBadges}>
                {parseState.plan.nutritionalFocus.map((f) => (
                  <span key={f} className="badge">{f}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className="btn btn-primary btn-full"
          disabled={parseState.status !== 'valid'}
          onClick={handleImport}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          インポートする
        </button>
      </div>

      {overwriteConfirm && pendingPlan && (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <h3 className={styles.dialogTitle}>同じIDのプランが存在します</h3>
            <p className={styles.dialogText}>
              「{pendingPlan.title}」(ID: {pendingPlan.id}) は既に存在します。上書きしますか？
            </p>
            <div className={styles.dialogActions}>
              <button className="btn btn-secondary" onClick={handleCancelOverwrite}>
                キャンセル
              </button>
              <button className="btn btn-primary" onClick={handleConfirmOverwrite}>
                上書きする
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
