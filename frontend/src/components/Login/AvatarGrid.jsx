import React from 'react';

const AvatarGrid = ({ students, onSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 p-4 w-full">
      {students.map((student) => (
        <button
          key={student.id}
          onClick={() => onSelect(student)}
          className="card-premium flex flex-col items-center p-8 group cursor-pointer"
        >
          <div className="w-28 h-28 rounded-full overflow-hidden bg-primary/5 border-4 border-primary/10 mb-4 group-hover:scale-110 transition-transform">
            <img
              src={`/src/assets/avatars/${student.avatar_id}.svg`}
              alt={student.name}
              className="w-full h-full object-cover p-2"
              onError={(e) => {
                e.target.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + student.name;
              }}
            />
          </div>
          <span className="text-xl font-display font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
            {student.name}
          </span>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Year {student.year_level}
          </span>
        </button>
      ))}
    </div>
  );
};

export default AvatarGrid;
