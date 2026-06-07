import { BrandLogo } from './BrandLogo'

interface NavigationProps {
  showLogo?: boolean
}

export function Navigation({ showLogo = true }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-space/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {showLogo && (
          <a href="/" className="flex items-center gap-3 group">
            <BrandLogo size="sm" />
            <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
              AI Career Navigator
            </span>
          </a>
        )}
      </div>
    </nav>
  )
}
