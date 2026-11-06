import SourceBadge from '../SourceBadge'
import SectionIcon from '../SectionIcon'

/** Sticky header of a detail section: icon, title, data-source badge and provider link. */
export default function SectionHeader({ icon, title, subtitle, source, href, linkLabel }) {
  return (
    <div className="detailHeader">
      <span className="detailIcon"><SectionIcon id={icon} /></span>
      <div>
        <div className="detailTitle">{title}</div>
        <div className="detailSub">{subtitle}</div>
      </div>
      <div className="detailMeta">
        <SourceBadge source={source} />
        {href && <a className="phSrc" href={href} target="_blank" rel="noreferrer">{linkLabel} ↗</a>}
      </div>
    </div>
  )
}
