import React from 'react';

const AvatarGrid = ({ students, onSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 p-4">
      {students.map((student) => (
        <button
          key={student.id}
          onClick={() => onSelect(student)}
          className="clay-card flex flex-col items-center p-6 group cursor-pointer"
        >
          <div className="w-28 h-28 rounded-full overflow-hidden bg-white/50 border-4 border-white mb-4 shadow-sm group-hover:shadow-md transition-shadow">
            <img
              src={`/src/assets/avatars/${student.avatar_id}.svg`}
              alt={student.name}
              className="w-full h-full object-cover p-2"
              onError={(e) => {
                e.target.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + student.name;
              }}
            />
          </div>
          <span className="text-xl font-bold text-[var(--color-text)] mb-1 group-hover:text-[var(--color-primary)] transition-colors">
            {student.name}
          </span>
          <span className="text-sm font-semibold text-indigo-400">
            Year {student.year_level}
          </span>
        </button>
      ))}
    </div>
  );
};

export default AvatarGrid;
