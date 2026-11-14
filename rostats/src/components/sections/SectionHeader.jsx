import SourceBadge from '../SourceBadge'

/** Heading of a section: title, scope, where the data comes from and its state. */
export default function SectionHeader({ title, subtitle, source, href, linkLabel }) {
  return (
    <header className="secHead">
      <div className="secTop">
        <h2 className="secTitle display" id="section-title">{title}</h2>
        <SourceBadge source={source} />
      </div>
      <p className="secSub">
        {subtitle}
        {href && <> · <a href={href} target="_blank" rel="noreferrer">{linkLabel}</a></>}
      </p>
    </header>
  )
}

/** Placeholder with the shape of a section, shown until its source answers. */
export function SectionSkeleton({ label }) {
  return (
    <div className="secSkeleton" role="status" aria-label={label}>
      <div className="skeleton secSkeletonHero" />
      {[0, 1, 2, 3, 4].map(i => <div className="skeleton secSkeletonRow" key={i} />)}
    </div>
  )
}
