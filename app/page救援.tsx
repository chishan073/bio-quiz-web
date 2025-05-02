'use client';

import React, { useEffect, useState } from 'react';

export default function Page() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
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

  const handleSubmit = async () => {
    const user_id = 1; // 假設使用者 ID 為 1（未來可用登入系統替代）
    const allResults = {};

    for (const question of questions) {
      const selected_option = answers[question.id];
      if (!selected_option) continue;

      const res = await fetch('http://localhost:3001/api/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          question_id: question.id,
          selected_option,
        }),
      });

      const data = await res.json();
      allResults[question.id] = data;
    }

    setResults(allResults);
  };

  if (loading) {
    return <div className="p-4">載入中…</div>;
  }

  return (
    <div className="p-6 space-y-4">
      {questions.map((q) => (
        <div key={q.id} className="border rounded p-4 shadow">
          <h2 className="font-semibold mb-2">{q.question_text}</h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(q.options).map(([key, val]) => {
              const isSelected = answers[q.id] === key;
              const result = results[q.id];
              const isCorrect = result?.correct_option === key;
              const isWrong = result && isSelected && !isCorrect;

              return (
                <button
                  key={key}
                  className={`py-2 px-4 rounded border ${
                    isCorrect
                      ? 'bg-green-500 text-white'
                      : isWrong
                      ? 'bg-red-500 text-white'
                      : isSelected
                      ? 'bg-blue-500 text-white'
                      : ''
                  }`}
                  onClick={() => {
                    setAnswers({ ...answers, [q.id]: key });
                  }}
                >
                  {key}. {String(val)}
                </button>
              );
            })}
          </div>
          {results[q.id] && (
            <div className="mt-2 text-sm">
            <p className={results[q.id].is_correct ? "text-green-600" : "text-red-600"}>
              {results[q.id].is_correct
                ? '✅ 答對了！'
                : `❌ 答錯了，正確答案是 ${results[q.id].correct_option}`}
            </p>
            <p className="text-gray-600 mt-1">📘 解析：{results[q.id].explanation}</p>
          </div>
          )}
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        提交答案
      </button>
    </div>
  );
}
