import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

export default function UnitsTable() {
  const [data, setData] = useState([]);
  const [grouped, setGrouped] = useState([]);

  useEffect(() => {
  axios.get(`${import.meta.env.VITE_API_URL}/api/analytics/by-unit`) // or whatever your FastAPI port is
    .then(res => {
      if (Array.isArray(res.data)) {
        setData(res.data);
        const groupedData = groupByLocation(res.data);
        setGrouped(groupedData);
      } else {
        console.error("Unexpected response:", res.data);
      }
    })
    .catch(err => console.error("API error:", err));
}, []);

  const groupByLocation = (rawData) => {
    const locations = [...new Set(rawData.map(item => item.location_name))];
    const workTypes = [...new Set(rawData.map(item => item.work_type))];

    return locations.map(location => {
      const entry = { location };
      workTypes.forEach(type => {
        const match = rawData.find(d => d.location_name === location && d.work_type === type);
        entry[type] = match ? match.cost : 0;
      });
      return entry;
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Costs per Work and Floor</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={grouped} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
          <XAxis dataKey="location" angle={-45} textAnchor="end" interval={0} height={100} />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          {Object.keys(grouped[0] || {}).filter(key => key !== 'location').map((key, idx) => (
            <Bar key={key} dataKey={key} stackId="a" fill={getBarColor(idx)} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function getBarColor(index) {
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d0ed57', '#a4de6c', '#d88884'
  ];
  return colors[index % colors.length];
}
