import React, { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// Helpers for calendar
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstWeekday = (year, month) => new Date(year, month, 1).getDay();

export default function SiteDiaryMockup() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 3)); // April 2025
  const [selectedDate, setSelectedDate] = useState(null);
  const [tableData, setTableData] = useState([
    { date: '14.05.2025', loc: 'Foundations', work: 'Concreting', workers: 3, hours: 12, amounts: '80m3', completed: '20m3' },
    { date: '15.05.2025', loc: 'Foundations', work: 'Finishing works', workers: 2, hours: 15, amounts: '500m2', completed: '100m2' },
    { date: '16.05.2025', loc: 'First floor', work: 'Assembly', workers: 4, hours: 36, amounts: '60',   completed: '25'   }
  ]);

  const updateCompleted = (index, value) => {
    setTableData(prev => prev.map((row, i) => i === index ? { ...row, completed: value } : row));
  };

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const monthName = format(currentMonth, "MMMM yyyy");
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const firstWeekday = getFirstWeekday(year, monthIndex);

  const prevMonth = () => setCurrentMonth(new Date(year, monthIndex - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, monthIndex + 1, 1));

  // Build calendar cells
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  const isCompletedDay = (day) => {
    if (!day) return false;
    const wd = new Date(year, monthIndex, day).getDay();
    return wd >= 1 && wd <= 5;
  };

  return (
    <div className="w-full min-h-screen p-4">
      {/* Calendar View */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="px-3 py-1 bg-gray-200 rounded">&lt;</button>
        <h2 className="text-xl font-semibold">{monthName}</h2>
        <button onClick={nextMonth} className="px-3 py-1 bg-gray-200 rounded">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center w-full mb-6">
        {daysOfWeek.map((d) => <div key={d} className="font-medium">{d}</div>)}
        {cells.map((day, idx) => (
          <div
            key={idx}
            className={`h-20 flex items-center justify-center border rounded cursor-pointer ${isCompletedDay(day) ? 'bg-green-100' : 'bg-white'}`}
            onClick={() => day && setSelectedDate(new Date(year, monthIndex, day))}
          >
            <span className="flex items-center">
              {day}
              {isCompletedDay(day) && <span className="ml-1 text-green-600">✓</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Diary Modal */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded shadow-lg w-full max-w-4xl max-h-full overflow-auto"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Site Diary for {format(selectedDate, "dd.MM.yyyy")}</h3>
                <button onClick={() => setSelectedDate(null)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>

              {/* Main Diary Table */}
              <table className="w-full table-auto border-collapse mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    {['Date','Location','Works','Workers','Hours','Project amounts','Completed'].map((h) => (
                      <th key={h} className="border px-2 py-1">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => (
                    <tr key={i} className="even:bg-gray-50">
                      <td className="border px-2 py-1">{row.date}</td>
                      <td className="border px-2 py-1">{row.loc}</td>
                      <td className="border px-2 py-1">{row.work}</td>
                      <td className="border px-2 py-1 text-center">{row.workers}</td>
                      <td className="border px-2 py-1 text-center">{row.hours}</td>
                      <td className="border px-2 py-1 text-center">{row.amounts}</td>
                      <td className="border px-2 py-1 text-center">
                        <input
                          className="w-full text-center border rounded px-1"
                          value={row.completed}
                          onChange={(e) => updateCompleted(i, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Complete Day Button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setSelectedDate(null)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >Complete Day</button>
              </div>

              {/* Delivered Materials */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Delivered Materials</h4>
                <ul className="space-y-2">
                  {['Rebar Ø10mm - 500kg','Rebar Ø12mm - 1,200kg','Rebar Ø16mm - 800kg'].map((item, i) => (
                    <li key={i} className="border p-2 rounded hover:bg-gray-50 cursor-pointer">{item}</li>
                  ))}
                </ul>
              </div>

              {/* Photos Carousel Mockup */}
              <div>
                <h4 className="font-semibold mb-2">Photos</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3,4,5,6].map((n) => (
                    <div key={n} className="h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500">Image {n}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
