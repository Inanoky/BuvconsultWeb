import React, { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Helper: get number of days in a month
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
// Helper: get weekday index of first day (0=Sun)
const getFirstWeekday = (year, month) => new Date(year, month, 1).getDay();

export default function SiteDiaryMockup() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 3)); // April 2025
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const monthName = format(currentMonth, "MMMM yyyy");
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const firstWeekday = getFirstWeekday(year, monthIndex);

  const prevMonth = () => setCurrentMonth(new Date(year, monthIndex - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, monthIndex + 1, 1));

  // Build calendar cells: blank slots then day numbers
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  // Mark weekdays (Mon-Fri) as completed
  const isCompleted = (day) => {
    if (!day) return false;
    const date = new Date(year, monthIndex, day);
    const wd = date.getDay();
    return wd >= 1 && wd <= 5;
  };

  return (
    <div className="w-full min-h-screen p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          &lt;
        </button>
        <h2 className="text-xl font-semibold">{monthName}</h2>
        <button
          onClick={nextMonth}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          &gt;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center w-full">
        {daysOfWeek.map((d) => (
          <div key={d} className="font-medium">
            {d}
          </div>
        ))}

        {cells.map((day, idx) => {
          const completed = isCompleted(day);
          return (
            <div
              key={idx}
              className={`h-20 flex items-center justify-center border rounded cursor-pointer
                ${completed ? "bg-green-100" : "bg-white"}`}
              onClick={() => day && setSelectedDate(new Date(year, monthIndex, day))}
            >
              <span className="flex items-center">
                {day}
                {completed && <span className="ml-1 text-green-600">✓</span>}
              </span>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded shadow-lg w-11/12 max-w-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3 className="text-lg font-semibold mb-2">
                Site Diary for {format(selectedDate, "dd.MM.yyyy")}
              </h3>
              <textarea
                rows={8}
                className="w-full border border-gray-300 rounded p-2 mb-4"
                placeholder="Enter diary notes..."
                defaultValue="Mock diary content..."
              />
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedDate(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
