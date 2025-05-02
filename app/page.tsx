'use client';

import React, { useEffect, useState } from 'react';

export default function Page() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/questions');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error('載入題目失敗:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  if (loading) {
    return <div className="p-4">載入中…</div>;
  }

  return (
    <div className="p-6 space-y-4">
      {questions.map((q) => (
        <div key={q.id} className="border rounded p-4 shadow">
          <h2 className="font-semibold mb-2">{q.question_text}</h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(q.options).map(([key, val]) => (
              <button
                key={key}
                className={`py-2 px-4 rounded ${
                  answers[q.id] === key ? 'bg-blue-500 text-white' : 'border'
                }`}
                onClick={() => {
                  setAnswers({ ...answers, [q.id]: key });
                }}
              >
                {key}. {String(val)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
