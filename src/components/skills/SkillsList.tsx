import { memo, useMemo, useState, useRef, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import type { TFunction } from 'i18next'
import type { ManagedSkill, OnboardingPlan, ToolOption, ToolStatusDto } from './types'
import SkillCard from './SkillCard'

type GithubInfo = { label: string; href: string }

type SkillsListProps = {
  plan: OnboardingPlan | null
  visibleSkills: ManagedSkill[]
  managedSkills: ManagedSkill[]
  installedTools: ToolOption[]
  toolStatus: ToolStatusDto | null
  loading: boolean
  getGithubInfo: (url: string | null | undefined) => GithubInfo | null
  getGithubOpenUrl: (skill: ManagedSkill) => string | null
  getSkillSourceLabel: (skill: ManagedSkill) => string
  formatRelative: (ms: number | null | undefined) => string
  onReviewImport: () => void
  onUpdateSkill: (skill: ManagedSkill) => void
  onDeleteSkill: (skillId: string) => void
  onToggleTool: (skill: ManagedSkill, toolId: string) => void
  onSyncNow: (skill: ManagedSkill) => void
  onOpenDetail: (skill: ManagedSkill) => void
  t: TFunction
}

const SkillsList = ({
  plan,
  visibleSkills,
  managedSkills,
  installedTools,
  toolStatus,
  loading,
  getGithubInfo,
  getGithubOpenUrl,
  getSkillSourceLabel,
  formatRelative,
  onReviewImport,
  onUpdateSkill,
  onDeleteSkill,
  onToggleTool,
  onSyncNow,
  onOpenDetail,
  t,
}: SkillsListProps) => {
  const totalSkills = managedSkills.length
  const activeToolCount = toolStatus?.installed.length ?? 0
  const totalToolCount = toolStatus?.tools.length ?? 47
  const syncedCount = useMemo(() => {
    const installedCount = toolStatus?.installed.length ?? 0
    if (installedCount === 0) return 0
    return managedSkills.filter((s) => s.targets.length >= installedCount).length
  }, [managedSkills, toolStatus])
  const partialCount = useMemo(
    () =>
      managedSkills.filter(
        (s) =>
          s.targets.length > 0 &&
          s.targets.length < (toolStatus?.installed.length ?? 0),
      ).length,
    [managedSkills, toolStatus],
  )
  const lastUpdated = useMemo(() => {
    const sorted = [...managedSkills].sort(
      (a, b) => (b.updated_at ?? 0) - (a.updated_at ?? 0),
    )
    return sorted[0] ?? null
  }, [managedSkills])

  const [showToolsDetail, setShowToolsDetail] = useState(false)
  const toolsCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showToolsDetail) return
    const handleClick = (e: MouseEvent) => {
      if (toolsCardRef.current && !toolsCardRef.current.contains(e.target as Node)) {
        setShowToolsDetail(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showToolsDetail])

  const installedToolList = useMemo(
    () => toolStatus?.tools.filter((t) => t.installed) ?? [],
    [toolStatus],
  )
  const notInstalledToolList = useMemo(
    () => toolStatus?.tools.filter((t) => !t.installed) ?? [],
    [toolStatus],
  )

  const gitSkills = useMemo(
    () => visibleSkills.filter((s) => s.source_type.toLowerCase().includes('git')),
    [visibleSkills],
  )
  const localSkills = useMemo(
    () => visibleSkills.filter((s) => !s.source_type.toLowerCase().includes('git')),
    [visibleSkills],
  )
  const hasBothSections = gitSkills.length > 0 && localSkills.length > 0

  const renderSection = (skills: ManagedSkill[], sectionKey: 'sectionGitSkills' | 'sectionLocalSkills') => (
    <>
      {hasBothSections && (
        <div className="skill-section-header">
          <span className="skill-section-label">{t(sectionKey)}</span>
          <div className="skill-section-line" />
        </div>
      )}
      {skills.map((skill) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          installedTools={installedTools}
          loading={loading}
          getGithubInfo={getGithubInfo}
          getGithubOpenUrl={getGithubOpenUrl}
          getSkillSourceLabel={getSkillSourceLabel}
          formatRelative={formatRelative}
          onUpdate={onUpdateSkill}
          onDelete={onDeleteSkill}
          onToggleTool={onToggleTool}
          onSyncNow={onSyncNow}
          onOpenDetail={onOpenDetail}
          t={t}
        />
      ))}
    </>
  )

  return (
    <div className="skills-list-v2">
      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card accent">
          <div className="stat-value">{totalSkills}</div>
          <div className="stat-label">{t('statsTotal')}</div>
        </div>
        <div className="stat-card-wrapper" ref={toolsCardRef}>
          <div
            className="stat-card interactive"
            role="button"
            tabIndex={0}
            aria-expanded={showToolsDetail}
            onClick={() => setShowToolsDetail((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setShowToolsDetail((v) => !v)
              }
            }}
          >
            <div className="stat-value">{activeToolCount}</div>
            <div className="stat-label">{t('statsToolsActive')}</div>
            <div className="stat-sub">{t('statsOf', { total: totalToolCount })}</div>
          </div>
          {showToolsDetail && (
            <div className="tools-detail-popup">
              <div className="tools-detail-header">{t('toolsDetailTitle')}</div>
              {installedToolList.length > 0 && (
                <>
                  <div className="tools-detail-section-label">
                    {t('toolsDetailInstalled')} ({installedToolList.length})
                  </div>
                  <div className="tools-detail-list">
                    {installedToolList.map((tool) => (
                      <div key={tool.key} className="tools-detail-item">
                        <span className="tools-detail-dot on" />
                        {tool.label}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {installedToolList.length > 0 && notInstalledToolList.length > 0 && (
                <hr className="tools-detail-divider" />
              )}
              {notInstalledToolList.length > 0 && (
                <>
                  <div className="tools-detail-section-label">
                    {t('toolsDetailNotInstalled')} ({notInstalledToolList.length})
                  </div>
                  <div className="tools-detail-list">
                    {notInstalledToolList.map((tool) => (
                      <div key={tool.key} className="tools-detail-item">
                        <span className="tools-detail-dot off" />
                        {tool.label}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-value">{syncedCount}</div>
          <div className="stat-label">{t('statsSynced')}</div>
          {partialCount > 0 && (
            <div className="stat-sub">{t('statsPartial', { count: partialCount })}</div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-value stat-value-sm">
            {lastUpdated ? lastUpdated.name : '—'}
          </div>
          <div className="stat-label">{t('statsLastUpdated')}</div>
          {lastUpdated && (
            <div className="stat-sub">{formatRelative(lastUpdated.updated_at)}</div>
          )}
        </div>
      </div>

      {/* Discovered Banner */}
      {plan && plan.total_skills_found > 0 ? (
        <div className="discovered-banner">
          <div className="banner-left">
            <div className="banner-icon">
              <MessageCircle size={18} />
            </div>
            <div className="banner-content">
              <div className="banner-title">{t('discoveredTitle')}</div>
              <div className="banner-subtitle">
                {t('discoveredCount', { count: plan.total_skills_found })}
              </div>
            </div>
          </div>
          <button
            className="btn btn-warning"
            type="button"
            onClick={onReviewImport}
            disabled={loading}
          >
            {t('reviewImport')}
          </button>
        </div>
      ) : null}

      {/* Skills */}
      {visibleSkills.length === 0 ? (
        <div className="empty">{t('skillsEmpty')}</div>
      ) : (
        <div className="skills-sections">
          {gitSkills.length > 0 && renderSection(gitSkills, 'sectionGitSkills')}
          {localSkills.length > 0 && renderSection(localSkills, 'sectionLocalSkills')}
        </div>
      )}
    </div>
  )
}

export default memo(SkillsList)
