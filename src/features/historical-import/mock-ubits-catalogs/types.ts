export type MockCatalogStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type MockCatalogSource = 'SYSTEM' | 'CUSTOM' | 'IMPORT';
export type MockQuestionScale = '1_TO_5' | '0_TO_10' | 'YES_NO' | 'CUSTOM' | 'OPEN';
export type MockQuestionType = 'LIKERT' | 'NPS' | 'MULTIPLE_CHOICE' | 'OPEN_ENDED' | 'BOOLEAN';
export type MockUserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface MockUbitsAlias {
  id: string;
  sourceText: string;
  normalizedText: string;
  targetEntityType: 'DIMENSION' | 'QUESTION' | 'DEMOGRAPHIC' | 'DEMOGRAPHIC_VALUE' | 'SURVEY_TYPE';
  targetEntityId: string | null; // null if it's a global alias without a specific target yet
  matchMethodHint?: 'EXACT' | 'FUZZY' | 'SYNONYM' | 'MANUAL';
  createdAt: string;
  updatedAt: string;
}

export interface MockUbitsDimension {
  id: string;
  name: string;
  canonicalName: string;
  description: string;
  aliases: string[];
  status: MockCatalogStatus;
  createdAt: string;
  updatedAt: string;
  source: MockCatalogSource;
  questionIds: string[];
  metadata: {
    category: string;
    isCore: boolean;
  };
}

export interface MockUbitsQuestion {
  id: string;
  dimensionId: string | null;
  text: string;
  canonicalText: string;
  aliases: string[];
  questionType: MockQuestionType;
  scale: MockQuestionScale;
  status: MockCatalogStatus;
  recommendedForComparison: boolean;
  createdAt: string;
  updatedAt: string;
  source: MockCatalogSource;
  metadata: {
    language: string;
    isReverseScored: boolean;
  };
}

export interface MockUbitsDemographic {
  id: string;
  name: string;
  canonicalName: string;
  aliases: string[];
  valueIds: string[];
  isFilterable: boolean;
  isRequiredForImport: boolean;
  status: MockCatalogStatus;
  createdAt: string;
  updatedAt: string;
  source: MockCatalogSource;
  metadata: {
    dataType: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN';
    displayOrder: number;
  };
}

export interface MockUbitsDemographicValue {
  id: string;
  demographicId: string;
  name: string;
  canonicalName: string;
  aliases: string[];
  status: MockCatalogStatus;
  createdAt: string;
  updatedAt: string;
  source: MockCatalogSource;
  metadata: {
    isActiveForFiltering: boolean;
  };
}

export interface MockUbitsUser {
  id: string;
  fullName: string;
  email: string | null;
  documentId: string | null;
  employeeId: string | null;
  country: string | null;
  status: MockUserStatus;
  demographicValueIds: string[];
  createdAt: string;
  updatedAt: string;
  source: MockCatalogSource;
  metadata: {
    role: string;
    lastLoginAt: string | null;
  };
}

export interface MockUbitsSurveyType {
  id: string;
  name: string;
  aliases: string[];
  defaultScale: MockQuestionScale;
  supportedComparisonModes: ('TREND' | 'BENCHMARK' | 'INTERNAL_NORM')[];
  status: MockCatalogStatus;
  createdAt: string;
  updatedAt: string;
  source: MockCatalogSource;
  metadata: {
    isAnonymousByDefault: boolean;
    frequencyHint: string;
  };
}

export interface MockUbitsCatalogs {
  dimensions: MockUbitsDimension[];
  questions: MockUbitsQuestion[];
  demographics: MockUbitsDemographic[];
  demographicValues: MockUbitsDemographicValue[];
  users: MockUbitsUser[];
  surveyTypes: MockUbitsSurveyType[];
  aliases: MockUbitsAlias[];
}
