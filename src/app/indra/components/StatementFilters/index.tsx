'use client';

interface StatementFiltersProps {
  statementTypes: string[];
  activeFilter: string;
  onFilterChange: (type: string) => void;
  totalCount: number;
  filteredCount?: number;
}

export default function StatementFilters({
  statementTypes,
  activeFilter,
  onFilterChange,
  totalCount,
  filteredCount,
}: StatementFiltersProps) {
  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Filtrer par type de relation</h3>
        <span className="text-sm text-gray-500">
          {filteredCount !== undefined && activeFilter
            ? `${filteredCount} sur ${totalCount} statements`
            : `${totalCount} statements au total`}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onFilterChange('')}
          className={`px-2 py-1 text-xs rounded-full ${
            activeFilter === ''
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Tous
        </button>
        
        {statementTypes.map((type) => (
          <button
            key={type}
            onClick={() => onFilterChange(type)}
            className={`px-2 py-1 text-xs rounded-full ${
              activeFilter === type
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
} 