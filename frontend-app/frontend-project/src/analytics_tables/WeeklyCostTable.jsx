import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from "recharts";
import axios from "axios";
import { EuroOutlined } from "@ant-design/icons";

const COLORS = [
  "#4e79a7","#59a14f","#f28e2b","#e15759","#76b7b2",
  "#edc948","#b07aa1","#ff9da7","#9c755f","#bab0ab"
];

const currencyFormatter = new Intl.NumberFormat("en-EN", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const WeeklyCostTable = ({ month }) => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchWeekly = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:8000/api/analytics/summary"
        );
        const allWeekly = data.weekly_spending || [];
        const filtered = month
          ? allWeekly.filter(w => w.month === month)
          : allWeekly;
        if (!filtered.length) return;

        // Identify dynamic category keys (exclude 'week' and 'month')
        const dynamicCats = Object.keys(filtered[0]).filter(
          k => k !== "week" && k !== "month"
        );
        setCategories(dynamicCats);

        // First loop: compute total per week
        const totals = {};
        filtered.forEach(item => {
          let sum = 0;
          dynamicCats.forEach(cat => {
            sum += item[cat] || 0;
          });
          totals[item.week] = sum;
        });

        // Second loop: inject TotalWeekSum into each entry
        const withTotals = filtered.map(item => ({
          ...item,
          TotalWeekSum: totals[item.week]
        }));

        setWeeklyData(withTotals);
      } catch (err) {
        console.error("Failed to fetch weekly analytics:", err);
      }
    };
    fetchWeekly();
  }, [month]);

  return (
    <div style={{ padding: "20px" }}>
      <h3><EuroOutlined /> Weekly Spending {month && `(Month: ${month})`}</h3>

      <ResponsiveContainer width="95%" height={300}>
        <BarChart
          data={weeklyData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <XAxis dataKey="week" />
          <YAxis tickFormatter={val => currencyFormatter.format(val)} />
          <Tooltip formatter={val => currencyFormatter.format(val)} />
          <Legend />

          {categories.map((category, idx) => (
            <Bar
              key={category}
              dataKey={category}
              stackId="a"
              fill={COLORS[idx % COLORS.length]}
            >
              {idx === categories.length - 1 && (
                <LabelList
                  dataKey="TotalWeekSum"
                  position="top"
                  formatter={val =>
                    val > 0 ? currencyFormatter.format(val) : ""
                  }
                />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyCostTable;
