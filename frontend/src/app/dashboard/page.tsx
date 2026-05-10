import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ChartBarMultiple } from "@/components/chart-bar-multiple"
import { ChartTooltipLabelCustom } from "@/components/chart-tooltip-label-custom"
import { ChartPieInteractive } from "@/components/chart-pie-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"

import data from "./data.json"

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-3 lg:px-6 items-start">
          <ChartBarMultiple />
          <ChartPieInteractive />
          <ChartTooltipLabelCustom />
        </div>
        <DataTable data={data} />
      </div>
    </div>
  )
}
