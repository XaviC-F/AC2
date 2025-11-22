'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config/config';

export default function CreateObjectivePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [resolutionDate, setResolutionDate] = useState('');
  const [strategy, setStrategy] = useState('');
  const [optInPercent, setOptInPercent] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let users: string[] = [];
    if (file) {
      const text = await file.text();
      users = text
        .trim()
        .split(/\r?\n/)
        .flatMap((line) => line.split(','))
        .map((u) => u.trim())
        .filter(Boolean);
    }
    const data = {
      title: title,
      description: description,
      invited_names: users,
      resolution_date: resolutionDate,
      resolution_strategy: strategy || 'asap',
      minimum_percentage: optInPercent ? Number(optInPercent) : null,
    };
    console.log('Creating objective:', data);
    const response = await fetch(`${API_URL}objective`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then(r => r.json()).catch(err => {throw new Error(`Request failed: ${err}`); });
    router.push(`/objective/${response.objective_id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Create Objective
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Users CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Resolution Date
            </label>
            <input
              type="date"
              required
              value={resolutionDate}
              onChange={(e) => setResolutionDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Resolution Strategy (optional)
            </label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select strategy</option>
              <option value="asap">As soon as possible</option>
              <option value="optimistic">Optimistic</option>
              <option value="pessimistic">Pessimistic</option>
              <option value="random">Random</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Minimum Opt-In % (optional)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={optInPercent}
              onChange={(e) => setOptInPercent(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Objective
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
