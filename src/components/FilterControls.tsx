import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FilterOptions, LogLevel } from '../types';
import { getLevelColor } from '../utils/logUtils';

interface FilterControlsProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ filters, onFilterChange }) => {
  const [showHelp, setShowHelp] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onFilterChange({ ...filters, appliedSearch: filters.search });
    }
  };

  const handleLevelClick = (level: LogLevel) => {
    // Toggle the selected level
    const newSelectedLevels = {
      ...filters.selectedLevels,
      [level]: !filters.selectedLevels[level]
    };

    onFilterChange({
      ...filters,
      selectedLevels: newSelectedLevels
    });
  };

  const toggleFilters = () => {
    onFilterChange({ ...filters, active: !filters.active });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      appliedSearch: '',
      selectedLevels: {
        'info': false,
        'warn': false,
        'error': false,
        'debug': false,
        'trace': false
      },
      client: 'all',
      active: false
    });
  };

  // Memoize derived state to prevent recalculations on every render
  const {
    hasSelectedLevels,
    clientFilterActive,
    hasUnappliedChanges,
    hasAppliedFilters,
    logLevels
  } = useMemo(() => {
    // Check if any level is selected
    const hasSelectedLevels = Object.values(filters.selectedLevels).some(selected => selected);

    // Check if the client filter is active based on the applied search
    const clientFilterActive = /#client:\S+/.test(filters.appliedSearch);

    // Determine if there's an unapplied search
    const hasUnappliedChanges = filters.search !== filters.appliedSearch;

    // Determine if any filters are applied
    const hasAppliedFilters = filters.appliedSearch !== '' || hasSelectedLevels;

    // Available log levels
    const logLevels: LogLevel[] = ['error', 'warn', 'info', 'debug', 'trace'];

    return {
      hasSelectedLevels,
      clientFilterActive,
      hasUnappliedChanges,
      hasAppliedFilters,
      logLevels
    };
  }, [filters.selectedLevels, filters.appliedSearch, filters.search]);

  return (
    <FilterContainer role="toolbar" aria-label="Log filter controls">
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search logs... (press Enter to apply)"
          value={filters.search}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          $hasClientFilter={clientFilterActive}
          $hasUnappliedChanges={hasUnappliedChanges}
          $filtersActive={filters.active}
          aria-label="Search logs"
          aria-describedby={hasUnappliedChanges ? "search-status" : undefined}
        />
        <HelpIcon
          onClick={() => setShowHelp(!showHelp)}
          title="Show search syntax help"
          role="button"
          aria-label="Search help"
          aria-expanded={showHelp}
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && setShowHelp(!showHelp)}
        >?</HelpIcon>
        {showHelp && (
          <HelpTooltip role="dialog" aria-label="Search syntax help">
            <p><strong>Search Syntax:</strong></p>
            <p><code>#client:name</code> - Filter logs from a specific client</p>
            <p><code>text #client:name</code> - Filter logs containing "text" from a specific client</p>
            <p><strong>Note:</strong> Press Enter to apply search filters</p>
            <CloseButton
              onClick={() => setShowHelp(false)}
              aria-label="Close help"
            >✕</CloseButton>
          </HelpTooltip>
        )}
      </SearchContainer>

      <LevelBadgeContainer role="group" aria-label="Log level filters">
        {logLevels.map(level => (
          <LevelBadge
            key={level}
            level={level}
            $active={filters.selectedLevels[level]}
            onClick={() => handleLevelClick(level)}
            title={`Click to ${filters.selectedLevels[level] ? 'remove' : 'add'} ${level} filter`}
            role="checkbox"
            aria-checked={filters.selectedLevels[level]}
            aria-label={`${level} log level filter`}
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleLevelClick(level)}
          >
            {level.toUpperCase()}
          </LevelBadge>
        ))}
      </LevelBadgeContainer>

      <FilterControlButtons>
        <ToggleButton
          onClick={toggleFilters}
          $active={filters.active}
          title={filters.active ? "Disable filters" : "Enable filters"}
          aria-pressed={filters.active}
        >
          {filters.active ? "Filters On" : "Filters Off"}
        </ToggleButton>

        {hasAppliedFilters && (
          <ClearButton
            onClick={clearFilters}
            title="Clear all filters"
            aria-label="Clear all filters"
          >
            Clear
          </ClearButton>
        )}
      </FilterControlButtons>

      {filters.active && clientFilterActive && (
        <ClientFilterIndicator role="status">
          Client Filter Active
        </ClientFilterIndicator>
      )}

      {hasUnappliedChanges && (
        <SearchStatus id="search-status" role="status">
          Press Enter to apply search
        </SearchStatus>
      )}
    </FilterContainer>
  );
};

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 20px;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input<{
  $hasClientFilter: boolean;
  $hasUnappliedChanges: boolean;
  $filtersActive: boolean;
}>`
  background-color: ${({ theme }) => theme.terminalBackground};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ $hasClientFilter, $hasUnappliedChanges, theme }) => 
    $hasClientFilter ? theme.blue : 
    $hasUnappliedChanges ? theme.warning : 
    theme.border
  };
  border-radius: 4px;
  padding: 5px 10px;
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  width: 300px;

  &:focus {
    outline: none;
    border-color: ${({ $hasUnappliedChanges, theme }) => 
      $hasUnappliedChanges ? theme.warning : theme.blue
    };
  }

  &::placeholder {
    color: ${({ theme }) => theme.infoText}aa;
  }
`;

const HelpIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background-color: ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.background};
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  margin-left: 8px;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: ${({ theme }) => theme.blue};
  }
`;

const HelpTooltip = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 300px;
  background-color: ${({ theme }) => theme.terminalBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  padding: 10px;
  margin-top: 5px;
  z-index: 10;
  font-size: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);

  p {
    margin: 5px 0;
  }

  code {
    background-color: ${({ theme }) => theme.background};
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Fira Code', monospace;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  padding: 2px 5px;
  font-size: 10px;

  &:hover {
    color: ${({ theme }) => theme.red};
  }
`;

  const FilterControlButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  `;

  const ToggleButton = styled.button<{ $active: boolean }>`
  background-color: ${({ $active, theme }) => 
    $active ? theme.accent : theme.buttonBackground};
  color: ${({ $active, theme }) => 
    $active ? theme.accentText : theme.buttonText};
  border: 1px solid ${({ $active, theme }) => 
    $active ? theme.accent : theme.border};
  padding: 6px 12px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background-color: ${({ $active, theme }) => 
      $active ? theme.accentHover : theme.buttonHoverBackground};
  }
  `;

  const ClearButton = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.mutedText};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 6px 12px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.buttonHoverBackground};
    color: ${({ theme }) => theme.text};
  }
  `;

const LevelBadgeContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;


const LevelBadge = styled.div<{ level: LogLevel, $active: boolean }>`
  color: ${({ level, theme, $active }) => $active ? theme.background : getLevelColor(level, theme)};
  background-color: ${({ level, theme, $active }) => 
    $active ? getLevelColor(level, theme) : `${getLevelColor(level, theme)}22`};
  border: 1px solid ${({ level, theme }) => getLevelColor(level, theme)};
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(110%);
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }
`;

const ClientFilterIndicator = styled.div`
  background-color: ${({ theme }) => theme.blue}22;
  color: ${({ theme }) => theme.blue};
  border: 1px solid ${({ theme }) => theme.blue};
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: bold;
`;

const SearchStatus = styled.div`
  background-color: ${({ theme }) => theme.warning}22;
  color: ${({ theme }) => theme.warning};
  border: 1px solid ${({ theme }) => theme.warning};
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  font-style: italic;
`;

export default FilterControls;
