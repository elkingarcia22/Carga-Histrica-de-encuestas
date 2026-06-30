const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/features/historical-import/conversational-import/question-scale-dimension-review/questionScaleDimensionReviewTypes.ts');
let content = fs.readFileSync(filePath, 'utf8');

const typesToAdd = `
export type QuestionReviewEditingIntentType =
  | 'view_overview'
  | 'view_by_dimension'
  | 'view_needs_review'
  | 'view_question_detail'
  | 'change_question_dimension'
  | 'change_question_type'
  | 'change_scale_type'
  | 'confirm_question'
  | 'confirm_section'
  | 'invalid_input'
  | 'ambiguous_input'
  | 'unsupported_intent';

export interface QuestionReviewEditingIntent {
  intent: QuestionReviewEditingIntentType;
  targetQuestionDisplayIndex?: number;
  targetQuestionId?: string;
  targetDimensionName?: string;
  targetQuestionType?: QuestionType;
  targetScaleType?: ScaleType;
  rawUserTextSanitized: string;
  confidence: 'high' | 'medium' | 'low';
  clarificationPrompt?: string;
}
`;

content += typesToAdd;
fs.writeFileSync(filePath, content);
console.log('Types updated');
