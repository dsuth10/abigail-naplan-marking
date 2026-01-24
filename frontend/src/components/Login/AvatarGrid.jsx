import React from 'react';

const AvatarGrid = ({ students, onSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
      {students.map((student) => (
        <button
          key={student.id}
          onClick={() => onSelect(student)}
          className="flex flex-col items-center p-4 rounded-xl transition-all hover:bg-blue-50 hover:scale-105 group"
        >
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-transparent group-hover:border-blue-400 mb-3 shadow-md">
            <img
              src={`/src/assets/avatars/${student.avatar_id}.svg`}
              alt={student.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + student.name;
              }}
            />
          </div>
          <span className="text-lg font-semibold text-gray-700 group-hover:text-blue-600">
            {student.name}
          </span>
          <span className="text-sm text-gray-400">
            Year {student.year_level}
          </span>
        </button>
      ))}
    </div>
  );
};

export default AvatarGrid;
