import React, { useState } from "react";
import Totalcosttable from "../analytics_tables/Totalcosttable.jsx";
import WeeklyCostTable from "../analytics_tables/WeeklyCostTable.jsx";
import UnitsTable from "../analytics_tables/UnitsTable.jsx";
import Totals from "../analytics_tables/Totals.jsx";
import Boq from "../analytics_tables/Boq.jsx";
export default function Analytics() {
  const [selectedMonth, setSelectedMonth] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      {/* Monthly total chart: pass click handler */}
      <Totalcosttable onMonthSelect={setSelectedMonth} />

      {/* Weekly chart: only show when a month is selected */}
      {selectedMonth && <WeeklyCostTable month={selectedMonth} />}
        <UnitsTable />
      <Totals/>
        <Boq/>
    </div>
  );
}
