'use client';

import React, { useEffect, useState } from 'react';

export default function Page() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState('');
  const [source, setSource] = useState('');
  const [results, setResults] = useState({});

  // 取得題目並處理過濾條件
  const handleFilterChange = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (chapter) queryParams.append('chapter', chapter);
      if (source) queryParams.append('source', source);

      const res = await fetch(`http://localhost:3001/api/questions?${queryParams.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error('載入題目失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFilterChange();
  }, [chapter, source]);

  // 提交答案並顯示結果
  const handleSubmit = async () => {
    try {
      const user_id = 1;  // 假設用戶ID，實際可根據需要更動
      for (const question_id in answers) {
        const selected_option = answers[question_id];
        const res = await fetch('http://localhost:3001/api/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id, question_id, selected_option })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setResults(prev => ({
          ...prev,
          [question_id]: {
            is_correct: data.is_correct,
            correct_option: data.correct_option,
            explanation: data.explanation
          }
        }));
      }
    } catch (err) {
      console.error('提交答案失敗:', err);
    }
  };

  if (loading) {
    return <div className="p-4">載入中…</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex space-x-4 mb-4">
        <select
          className="border p-2 rounded"
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
        >
          <option value="">選擇章節</option>
          <option value="細胞結構">細胞結構</option>
          <option value="細胞週期">細胞週期</option>
          {/* 其他章節選項 */}
        </select>
        <select
          className="border p-2 rounded"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="">選擇來源</option>
          <option value="普通生物學">普通生物學</option>
          <option value="基因學">基因學</option>
          {/* 其他來源選項 */}
        </select>
      </div>

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

          {results[q.id] && (
            <div className="mt-2">
              {results[q.id].is_correct ? (
                <p className="text-green-500">✅ 答對了！</p>
              ) : (
                <p className="text-red-500">
                  ❌ 答錯了，正確答案是 {results[q.id].correct_option}.
                </p>
              )}
              <p className="text-sm text-gray-600">
                解釋: {results[q.id].explanation}
              </p>
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
