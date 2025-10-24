
import React, { useEffect, useState } from 'react';

export const LoadingBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(oldProgress => {
        if (oldProgress >= 100) return 0;
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto p-1 bg-gray-800 border-2 border-gray-600">
      <div
        className="h-6 bg-green-500 transition-all duration-200 ease-linear"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};
