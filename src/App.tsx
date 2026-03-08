import { useState } from 'react';
import './App.css';

const flowers = ['🌸', '🌷', '💐', '🌺', '🌹', '🪷'];

function getRandomFlower() {
  return flowers[Math.floor(Math.random() * flowers.length)];
}

async function generateCompliment(history: string[]): Promise<string> {
  const apiKey = 'NmiwCDyHHWt7OQn3kQzlEj5mJB7rGOGT';

  const res = await fetch('/mistral-api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      temperature: 0.9,
      messages: [
        {
          role: 'system',
          content:
            'Ты пишешь красивые, короткие и искренние комплименты женщинам на 8 марта. Каждый комплимент должен быть уникальным и отличаться от предыдущих.',
        },
        {
          role: 'user',
          content: `
Вот комплименты которые уже были:
${history.join('\n')}

Напиши новый короткий комплимент женщине на 8 марта.
Не повторяй предыдущие.
Отвечай только текстом комплимента.
`,
        },
      ],
    }),
  });

  const data = await res.json();

  return data.choices?.[0]?.message?.content?.trim() ?? 'поругайте Айнура генерация сломалась';
}

export default function App() {
  const [compliment, setCompliment] = useState<string | null>(null);
  const [flower, setFlower] = useState('🌸');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<string[]>([]);

  const generate = async () => {
    if (loading) return;

    setLoading(true);
    setCompliment(null);
    setError(null);

    try {
      const text = await generateCompliment(history);

      setFlower(getRandomFlower());
      setCompliment(text);

      setHistory((prev) => {
        const updated = [...prev, text];

        // оставляем максимум 10
        if (updated.length > 10) {
          return updated.slice(updated.length - 10);
        }

        return updated;
      });
    } catch {
      setError('Не удалось получить комплимент. Проверь API ключ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="petals-container">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="petal" style={{ '--i': i } as React.CSSProperties}>
            🌸
          </span>
        ))}
      </div>

      <div className="card">
        <div className="header-flower">{flower}</div>
        <h1 className="title">С 8 Марта!</h1>
        <p className="subtitle">Для самых прекрасных</p>

        <div className={`compliment-box ${compliment || error ? 'visible' : ''}`}>
          <p className="compliment-text">{error ?? compliment ?? ''}</p>
        </div>

        <button className="btn" onClick={generate} disabled={loading}>
          {loading ? <span>⏳</span> : <span>💝</span>}
          {loading ? 'Генерирую...' : 'Получить комплимент'}
        </button>
      </div>

      <p className="made-by">С любовью от Айнура</p>
    </div>
  );
}
