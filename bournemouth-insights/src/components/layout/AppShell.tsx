import { NavLink } from 'react-router-dom'
import { StatusBadge } from '@/components/ui/StatusBadge'

import type { ReactNode } from 'react'
import { site } from '@/config/site'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                {site.projectName}
              </h1>
              <StatusBadge label={site.experimentalBadge} />
            </div>
            <p className="mt-1 max-w-xl text-sm text-slate-600">{site.toneNote}</p>
          </div>

          <nav className="flex shrink-0 items-center gap-3 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                  isActive ? 'bg-slate-100 text-slate-900' : '',
                ].join(' ')
              }
              end
            >
              Overview
            </NavLink>
            <NavLink
              to="/housing"
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                  isActive ? 'bg-slate-100 text-slate-900' : '',
                ].join(' ')
              }
            >
              Housing
            </NavLink>
            <NavLink
              to="/population"
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                  isActive ? 'bg-slate-100 text-slate-900' : '',
                ].join(' ')
              }
            >
              Population
            </NavLink>
            <NavLink
              to="/economy"
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                  isActive ? 'bg-slate-100 text-slate-900' : '',
                ].join(' ')
              }
            >
              Economy
            </NavLink>
            <NavLink
              to="/safety"
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                  isActive ? 'bg-slate-100 text-slate-900' : '',
                ].join(' ')
              }
            >
              Safety
            </NavLink>
            <NavLink
              to="/insights"
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                  isActive ? 'bg-slate-100 text-slate-900' : '',
                ].join(' ')
              }
            >
              Insights
            </NavLink>
            <NavLink
              to="/methodology"
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                  isActive ? 'bg-slate-100 text-slate-900' : '',
                ].join(' ')
              }
            >
              Methodology
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                  isActive ? 'bg-slate-100 text-slate-900' : '',
                ].join(' ')
              }
            >
              About
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <p className="max-w-3xl">{site.experimentalNote}</p>
            <div className="shrink-0 text-slate-600">
              <span className="font-medium text-slate-700">Created by:</span> {site.creatorName}
              <span className="px-2 text-slate-300">·</span>
              <span>{site.creatorPurpose}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
