'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BookMarked, ChevronLeft, ChevronRight, List } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

const ARTICLE_RE = /(Стаття\s+\d+(?:[\u2013\-\.]\d+)*(?:\s*КУпАП)?)/gi
const RULE_SECTION_RE = /(Розділ\s+(?:\d+|[IVXLCDM]+)(?:\.|\b))/g

function highlightLawArticles(html: string): string {
  if (!html) return html
  return html.replace(
    ARTICLE_RE,
    '<mark class="law-article">$1</mark>',
  )
}

function highlightRuleSections(html: string): string {
  if (!html) return html
  return html.replace(
    RULE_SECTION_RE,
    '<span class="rule-section">$1</span>',
  )
}

interface Chapter {
  id: number
  title: string
  slug: string
  number: number
  content: string
  order: number
  section_title: string
  section_slug: string
}

interface ChapterListItem {
  id: number
  title: string
  slug: string
  number: number
  order: number
}

export default function ChapterPage() {
  const params = useParams()
  const router = useRouter()
  const sectionSlug = params.sectionSlug as string
  const chapterSlug = params.chapterSlug as string

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [allChapters, setAllChapters] = useState<ChapterListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showToc, setShowToc] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/theory/sections/${sectionSlug}/chapters/${chapterSlug}/`).then(r => r.data),
      api.get(`/theory/sections/${sectionSlug}/chapters/`).then(r => r.data),
    ]).then(([ch, all]) => {
      setChapter(ch)
      setAllChapters(all)
    }).catch(() => router.push('/theory'))
      .finally(() => setLoading(false))
  }, [sectionSlug, chapterSlug])

  const isFinesSection = sectionSlug === 'shtrafi'
  const isRulesSection = sectionSlug === 'pravila-dorozhnogo-ruhu'

  const processedContent = useMemo(() => {
    if (!chapter) return ''
    let html = chapter.content
    if (isFinesSection) html = highlightLawArticles(html)
    if (isRulesSection) html = highlightRuleSections(html)
    return html
  }, [chapter, isFinesSection, isRulesSection])

  if (loading || !chapter) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  const currentIdx = allChapters.findIndex(c => c.slug === chapterSlug)
  const prevChapter = currentIdx > 0 ? allChapters[currentIdx - 1] : null
  const nextChapter = currentIdx < allChapters.length - 1 ? allChapters[currentIdx + 1] : null

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-sm text-base-content/50 flex-wrap">
          <Link href="/theory" className="hover:text-primary transition-colors">Теорія</Link>
          <ChevronRight className="w-3 h-3" />
          {allChapters.length > 1 ? (
            <>
              <Link href={`/theory/${sectionSlug}`} className="hover:text-primary transition-colors">
                {chapter.section_title}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-base-content/80">{chapter.title}</span>
            </>
          ) : (
            <span className="text-base-content/80">{chapter.section_title}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="mb-6">
            {allChapters.length > 1 && (
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <BookMarked className="w-4 h-4" />
                <span className="text-sm font-bold tracking-wide uppercase">
                  Розділ {chapter.number || (currentIdx + 1)}
                </span>
                <span className="text-xs text-primary/60 font-medium">
                  з {allChapters.length}
                </span>
              </div>
            )}
            <h1 className="text-2xl font-bold">{chapter.title}</h1>
          </div>

          {/* Content */}
          <div className="card bg-base-100 border border-base-300/60">
            <div className="card-body p-5 lg:p-8">
              <article
                className="theory-content prose prose-sm lg:prose-base max-w-none
                  prose-headings:text-base-content prose-headings:font-bold
                  prose-p:text-base-content/80 prose-p:leading-relaxed
                  prose-li:text-base-content/80
                  prose-strong:text-base-content
                  prose-table:text-sm
                  prose-th:bg-base-200 prose-th:p-2
                  prose-td:p-2 prose-td:border-base-300"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            </div>
          </div>

          {/* Prev/Next navigation */}
          <div className="flex gap-3 mt-6">
            {prevChapter ? (
              <Link
                href={`/theory/${sectionSlug}/${prevChapter.slug}`}
                className="flex-1 flex items-center gap-3 p-4 rounded-xl bg-base-100 border border-base-300/60 hover:border-primary/30 transition-colors group"
              >
                <ChevronLeft className="w-5 h-5 text-base-content/30 group-hover:text-primary transition-colors flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-base-content/40">Попередній</p>
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{prevChapter.title}</p>
                </div>
              </Link>
            ) : <div className="flex-1" />}

            {nextChapter ? (
              <Link
                href={`/theory/${sectionSlug}/${nextChapter.slug}`}
                className="flex-1 flex items-center justify-end gap-3 p-4 rounded-xl bg-base-100 border border-base-300/60 hover:border-primary/30 transition-colors group text-right"
              >
                <div className="min-w-0">
                  <p className="text-xs text-base-content/40">Наступний</p>
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{nextChapter.title}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-base-content/30 group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            ) : <div className="flex-1" />}
          </div>
        </div>

        {/* Sidebar — chapter navigation (hidden for single-chapter sections) */}
        {allChapters.length > 1 && <div className="hidden lg:block lg:w-72 flex-shrink-0">
          <div className="card bg-base-100 border border-base-300/60 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="card-body p-3">
              <h3 className="font-semibold text-sm px-2 mb-2">{chapter.section_title}</h3>
              <div className="space-y-0.5">
                {allChapters.map((ch, i) => {
                  const isActive = ch.slug === chapterSlug
                  return (
                    <Link
                      key={ch.id}
                      href={`/theory/${sectionSlug}/${ch.slug}`}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
                      }`}
                    >
                      <span className="w-5 text-center font-mono flex-shrink-0">{ch.number || i + 1}</span>
                      <span className="truncate">{ch.title}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>}
      </div>

      {/* Mobile TOC button (hidden for single-chapter sections) */}
      {allChapters.length > 1 && (
        <div className="lg:hidden fixed bottom-36 right-4 z-30">
          <button
            className="btn btn-circle btn-primary shadow-lg"
            onClick={() => setShowToc(!showToc)}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Mobile TOC drawer */}
      {showToc && allChapters.length > 1 && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setShowToc(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-80 bg-base-100 z-50 lg:hidden overflow-y-auto shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{chapter.section_title}</h3>
                <button className="btn btn-ghost btn-sm btn-square" onClick={() => setShowToc(false)}>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {allChapters.map((ch, i) => {
                  const isActive = ch.slug === chapterSlug
                  return (
                    <Link
                      key={ch.id}
                      href={`/theory/${sectionSlug}/${ch.slug}`}
                      onClick={() => setShowToc(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-base-content/60 hover:bg-base-200'
                      }`}
                    >
                      <span className="w-6 text-center font-mono flex-shrink-0 text-xs">{ch.number || i + 1}</span>
                      <span>{ch.title}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
