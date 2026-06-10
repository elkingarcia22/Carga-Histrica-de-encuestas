import { z } from 'zod';
import type {
  IdentityType,
  PrivacyState,
  DemographicAssociation,
  CanonicalParticipant
} from '../../../types/survey-import';

import {
  participantIdSchema,
  demographicIdSchema,
  confidenceScoreSchema,
  matchStatusSchema,
  reviewStatusSchema,
  issueIdSchema
} from './commonSchemas';

export const identityTypeSchema: z.ZodType<IdentityType> = z.enum([
  'ubits-user',
  'external-participant',
  'anonymous-participant',
  'unresolved'
]);

export const privacyStateSchema: z.ZodType<PrivacyState> = z.enum([
  'visible',
  'anonymized',
  'redacted'
]);

export const demographicAssociationSchema: z.ZodType<DemographicAssociation> = z.object({
  demographicId: demographicIdSchema,
  value: z.string()
}).strict();

export const canonicalParticipantSchema: z.ZodType<CanonicalParticipant> = z.object({
  internalId: participantIdSchema,
  externalId: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email({ message: 'El correo no tiene un formato válido.' }).optional(),
  visibleName: z.string().optional(),
  identityType: identityTypeSchema,
  suggestedUbitsMatchId: z.string().optional(),
  matchConfidence: confidenceScoreSchema,
  matchStatus: matchStatusSchema,
  isDuplicate: z.boolean(),
  demographics: z.array(demographicAssociationSchema),
  privacyState: privacyStateSchema,
  relatedIssueIds: z.array(issueIdSchema),
  reviewStatus: reviewStatusSchema
}).strict();
