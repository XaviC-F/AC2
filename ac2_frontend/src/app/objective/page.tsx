'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link';
import { objectives, Objective } from './data';

const PAGE_SIZE = 5;

export default function ListPage() {
  const searchParams = useSearchParams()

  let page = 1;
  try {
    page = Number(searchParams.get('page') || "");
  } catch (_) {
    // ignore
  }
  if (page === 0) {
    page = 1;
  }
  const start = (page - 1) * PAGE_SIZE;
 const end = start + PAGE_SIZE;
 const pageItems = objectives.slice(start, end);
 const hasPrev = page > 1;
 const hasNext = end < objectives.length;
 return (
   <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
     <div className="max-w-3xl mx-auto">
       <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
         Objectives
       </h1>
       <ul className="space-y-4">
         {pageItems.map((obj: Objective) => (
           <li key={obj.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
             <Link
               href={`/objective/${obj.id}`}
               className="text-xl font-semibold text-blue-600 dark:text-blue-300 hover:underline"
             >
               {obj.title}
             </Link>
             <p className="text-gray-700 dark:text-gray-300 mt-1">
               {obj.description}
             </p>
           </li>
         ))}
       </ul>
       <div className="flex justify-between mt-6">
         <Link
           href={`/list?page=${Math.max(page - 1, 1)}`}
           className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded ${!hasPrev ? 'opacity-50 pointer-events-none' : ''}`}
         >
           Previous
         </Link>
         <Link
           href={`/list?page=${page + 1}`}
           className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded ${!hasNext ? 'opacity-50 pointer-events-none' : ''}`}
         >
           Next
         </Link>
       </div>
     </div>
   </div>
 );
}

