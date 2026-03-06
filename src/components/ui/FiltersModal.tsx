import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';
import { useTranslation } from 'react-i18next';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  userRole: 'owner' | 'sitter';
}

export interface FilterOptions {
  petType: 'all' | 'dog' | 'cat';
  maxDistance: number;
  minRating: number;
  maxPrice: number | null;
  sortBy: 'distance' | 'rating' | 'price' | 'newest';
}

const FiltersModal: React.FC<FiltersModalProps> = ({ isOpen, onClose, onApply, userRole }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<FilterOptions>({
    petType: 'all',
    maxDistance: 50,
    minRating: 0,
    maxPrice: null,
    sortBy: 'distance',
  });

  useEffect(() => {
    const saved = localStorage.getItem('userFilters');
    if (saved) {
      try {
        setFilters(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading filters:', e);
      }
    }
  }, []);

  const handleApply = () => {
    localStorage.setItem('userFilters', JSON.stringify(filters));
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      petType: 'all',
      maxDistance: 50,
      minRating: 0,
      maxPrice: null,
      sortBy: 'distance',
    };
    setFilters(defaultFilters);
    localStorage.removeItem('userFilters');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t('filters.title', 'Filters')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {userRole === 'owner' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {t('filters.petType', 'Pet Type')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['all', 'dog', 'cat'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilters({ ...filters, petType: type })}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      filters.petType === type
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type === 'all' ? t('filters.all', 'All') : type === 'dog' ? `🐕 ${t('filters.dogs', 'Dogs')}` : `🐱 ${t('filters.cats', 'Cats')}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {t('filters.maxDistance', 'Maximum Distance')}: {filters.maxDistance} km
            </label>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={filters.maxDistance}
              onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>5 km</span>
              <span>200 km</span>
            </div>
          </div>

          {userRole === 'owner' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {t('filters.minRating', 'Minimum Rating')}
              </label>
              <div className="grid grid-cols-6 gap-2">
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilters({ ...filters, minRating: rating })}
                    className={`py-2 px-3 rounded-lg font-medium transition-all ${
                      filters.minRating === rating
                        ? 'bg-yellow-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {rating === 0 ? t('filters.any', 'Any') : `${rating}★`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {userRole === 'owner' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {t('filters.maxPrice', 'Maximum Price per Hour')}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder={t('filters.noLimit', 'No limit')}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-600 dark:text-gray-400">€/hr</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {t('filters.sortBy', 'Sort By')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFilters({ ...filters, sortBy: 'distance' })}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  filters.sortBy === 'distance'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                📍 {t('filters.distance', 'Distance')}
              </button>
              {userRole === 'owner' && (
                <>
                  <button
                    onClick={() => setFilters({ ...filters, sortBy: 'rating' })}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      filters.sortBy === 'rating'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    ⭐ {t('filters.rating', 'Rating')}
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, sortBy: 'price' })}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      filters.sortBy === 'price'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    💰 {t('filters.price', 'Price')}
                  </button>
                </>
              )}
              <button
                onClick={() => setFilters({ ...filters, sortBy: 'newest' })}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  filters.sortBy === 'newest'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🆕 {t('filters.newest', 'Newest')}
              </button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex gap-3">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1"
          >
            {t('filters.reset', 'Reset')}
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t('filters.apply', 'Apply Filters')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersModal;
