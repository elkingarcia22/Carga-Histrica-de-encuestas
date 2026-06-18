import type { ComparisonViewModelInput, ComparisonViewModelResult } from './viewModelTypes';

export interface ComparisonViewModelContract {
  buildComparisonViewModel(input: ComparisonViewModelInput): ComparisonViewModelResult;
}
