export interface SortingConfig {
  field: string;
  order: "asc" | "desc";
  fieldLabels: Record<string, string>;
  onSortingChange: (sorting: SortingConfig) => void;
}

export interface ConsultationSortingProps {
  sortingConfig: SortingConfig;
  isLoading?: boolean;
}


