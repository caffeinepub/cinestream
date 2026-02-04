import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface FilterBarProps {
  mediaType: 'all' | 'movie' | 'tv';
  onMediaTypeChange: (type: 'all' | 'movie' | 'tv') => void;
  sortBy: 'popularity' | 'rating' | 'release';
  onSortByChange: (sort: 'popularity' | 'rating' | 'release') => void;
}

export default function FilterBar({ mediaType, onMediaTypeChange, sortBy, onSortByChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-8">
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/70 text-glass">Type:</span>
        <Select value={mediaType} onValueChange={onMediaTypeChange}>
          <SelectTrigger className="w-32 glass-panel border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="movie">Movies</SelectItem>
            <SelectItem value="tv">TV Shows</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/70 text-glass">Sort:</span>
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-36 glass-panel border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Popularity</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="release">Release Date</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {mediaType !== 'all' && (
        <Badge variant="secondary" className="glass-panel">
          {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
        </Badge>
      )}
    </div>
  );
}
