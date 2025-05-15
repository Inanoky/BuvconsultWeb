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
  "#4e79a7", "#59a14f", "#f28e2b", "#e15759", "#76b7b2",
  "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ab"
];

const currencyFormatter = new Intl.NumberFormat("en-EN", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const Totalcosttable = ({ onMonthSelect }) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/analytics/summary`
        );
        const monthly = data.monthly_spending || [];
        if (!monthly.length) return;

        // Identify category keys
        const dynamicCats = Object.keys(monthly[0]).filter(k => k !== "month");
        setCategories(dynamicCats);

        // First loop: build totals lookup
        const totals = {};
        monthly.forEach(item => {
          let sum = 0;
          dynamicCats.forEach(cat => {
            sum += item[cat] || 0;
          });
          totals[item.month] = sum;
        });

        // Second loop: inject TotalMonthSum into each entry
        const withTotals = monthly.map(item => ({
          ...item,
          TotalMonthSum: totals[item.month],
        }));

        setMonthlyData(withTotals);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h3><EuroOutlined /> Monthly Spending by Category</h3>

      <ResponsiveContainer width="95%" height={300}>
        <BarChart
          data={monthlyData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          onClick={({ activeLabel }) => activeLabel && onMonthSelect(activeLabel)}
        >
          <XAxis dataKey="month" />
          <YAxis tickFormatter={val => currencyFormatter.format(val)} />
          <Tooltip formatter={val => currencyFormatter.format(val)} />
          <Legend />

          {categories.map((category, index) => (
            <Bar
              key={category}
              dataKey={category}
              stackId="a"
              fill={COLORS[index % COLORS.length]}
            >
              {index === categories.length - 1 && (
                <LabelList
                  dataKey="TotalMonthSum"
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

export default Totalcosttable;
