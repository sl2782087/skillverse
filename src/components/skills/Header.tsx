import { memo } from 'react'
import { Layers, Languages, Search, Settings } from 'lucide-react'
import type { TFunction } from 'i18next'

type HeaderProps = {
  language: string
  loading: boolean
  activeView: 'myskills' | 'explore' | 'detail' | 'settings'
  onToggleLanguage: () => void
  onOpenSettings: () => void
  onViewChange: (view: 'myskills' | 'explore') => void
  t: TFunction
}

const Header = ({
  language,
  activeView,
  onToggleLanguage,
  onOpenSettings,
  onViewChange,
  t,
}: HeaderProps) => {
  return (
    <aside className="skills-rail">
      <div className="rail-top">
        <div className="rail-logo" aria-label={t('appName')}>
          <img src="/logo.png" alt="" className="rail-logo-img" />
        </div>
        <nav className="rail-nav" aria-label={t('navMySkillsTooltip')}>
          <button
            type="button"
            className={`rail-btn${activeView === 'myskills' || activeView === 'detail' ? ' active' : ''}`}
            title={t('navMySkillsTooltip')}
            aria-label={t('navMySkillsTooltip')}
            onClick={() => onViewChange('myskills')}
          >
            <Layers size={20} />
          </button>
          <button
            type="button"
            className={`rail-btn${activeView === 'explore' ? ' active' : ''}`}
            title={t('navExploreTooltip')}
            aria-label={t('navExploreTooltip')}
            onClick={() => onViewChange('explore')}
          >
            <Search size={20} />
          </button>
        </nav>
      </div>
      <div className="rail-bottom">
        <button
          type="button"
          className="rail-btn"
          title={t('navLanguageTooltip')}
          aria-label={t('navLanguageTooltip')}
          onClick={onToggleLanguage}
        >
          <Languages size={18} />
          <span className="rail-lang-badge">{language === 'en' ? 'EN' : '中'}</span>
        </button>
        <button
          type="button"
          className={`rail-btn${activeView === 'settings' ? ' active' : ''}`}
          title={t('navSettingsTooltip')}
          aria-label={t('navSettingsTooltip')}
          onClick={onOpenSettings}
        >
          <Settings size={20} />
        </button>
      </div>
    </aside>
  )
}

export default memo(Header)
