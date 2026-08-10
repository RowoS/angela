import { ReportsPageClient } from './components/ReportsPageClient'
import { getReportsData } from '@/lib/actions/reports-actions'
import type { ReportPeriod, ReportsData } from '@/lib/types/reports'


const DEFAULT_PERIOD: ReportPeriod = '6m'

export default async function ReportsPage() {
  let initial: ReportsData | null = null
  try {
    initial = await getReportsData(DEFAULT_PERIOD)
  } catch {
    initial = null
  }

  return <ReportsPageClient initial={initial} initialPeriod={DEFAULT_PERIOD} />
}