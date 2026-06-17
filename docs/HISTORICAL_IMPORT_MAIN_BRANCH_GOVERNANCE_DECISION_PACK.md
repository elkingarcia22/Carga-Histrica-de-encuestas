# Historical Import Main Branch Governance Decision Pack

## 1. Purpose

This document outlines the required governance decision pack for branch protection on the `main` branch of the Historical Import repository. It identifies the current state, associated risks, options for branch protection, and establishes the pre-conditions and authorities required prior to the implementation of any branch protection rules.

> [!WARNING]
> This is a decision pack. **Implementation is NOT authorized.** No configurations, branch protection rules, or rulesets are applied to the repository.

## 2. Current State

The following configuration for the `main` branch was observed in the read-only audit:

```text
Branch protection enabled: NO
Force push prohibited: NO
Branch deletion prohibited: NO
Pull request required: NO
Required status checks: NO
Signed commits required: NO
Linear history required: NO
Admin enforcement: NO
```

## 3. Verified Risks

### High Risks

* Force push sobre `main`.
* Eliminación de `main`.
* Cambios directos sin revisión.
* Publicación sin checks obligatorios.
* Falta de auditabilidad de excepciones.

### Medium Risks

* Ausencia de aprobación mínima.
* Ausencia de resolución obligatoria de conversaciones.
* Falta de CODEOWNERS.
* Falta de linear history.
* Falta de signed commits.
* Administradores sin controles equivalentes.

## 4. Governance Objectives

* Secure the `main` branch from unauthorized, unreviewed, or destructive changes.
* Ensure all code entering the main branch meets quality and security requirements via CI/CD.
* Establish a documented, auditable path for emergency access (break-glass).
* Ensure any access changes or exceptions are formally authorized by accountable owners.

## 5. Options A, B and C

### Opción A · Protección mínima

```text
Block force pushes
Block branch deletion
Require pull request
Require one approval
Require conversation resolution
```

### Opción B · Protección estándar recomendada

```text
Block force pushes
Block branch deletion
Require pull request
Require two approvals
Dismiss stale approvals
Require conversation resolution
Require status checks
Require branch up to date
Require linear history
Apply controls to administrators
```

### Opción C · Protección reforzada

Incluye Opción B más:

```text
Require CODEOWNERS review
Require signed commits
Restrict push actors
Require deployment/environment approval
Break-glass process with audit evidence
```

## 6. Option Comparison Matrix

### Opción A

```text
Security benefit: LOW
Governance benefit: LOW
Developer friction: LOW
CI/CD dependency: LOW
Operational risk: HIGH
Rollback complexity: LOW
Required owner: Technical Owner
Required evidence: APPROVAL_RECORD
Open questions: Are one-approver PRs sufficient for compliance?
```

### Opción B

```text
Security benefit: MEDIUM
Governance benefit: MEDIUM
Developer friction: MEDIUM
CI/CD dependency: HIGH
Operational risk: MEDIUM
Rollback complexity: MEDIUM
Required owner: Technical Owner, Security Owner
Required evidence: APPROVAL_RECORD, STATUS_CHECKS_IDENTIFIED
Open questions: Are required status checks stable? Do we have 2 available reviewers?
```

### Opción C

```text
Security benefit: HIGH
Governance benefit: HIGH
Developer friction: HIGH
CI/CD dependency: HIGH
Operational risk: LOW
Rollback complexity: HIGH
Required owner: Technical Owner, Security Owner, Deployment Owner
Required evidence: APPROVAL_RECORD, AUDITABLE_BREAK_GLASS_PROCEDURE
Open questions: Who will act as CODEOWNERS? Do all developers sign commits?
```

## 7. Existing Workflow Assessment

There are currently no workflows present in `.github/workflows/`.

```text
Workflow: NONE
Trigger: NONE
Check name: NONE
Required today: NO
Suitable to become required: NO
Risk of making required: HIGH (Blocks repository permanently as check does not exist)
```

## 8. Required Checks Preconditions

Before any status checks can be marked as required, the following preconditions must be met:

* Workflows must be created and merged into `main`.
* Workflows must be demonstrably stable.
* Workflows must trigger correctly on pull requests targeting `main`.
* Workflows must not depend on unavailable secrets.

## 9. Administrator Enforcement Decision

Applying controls to administrators ensures that no user can bypass protections. However, it requires a robust break-glass procedure to prevent lockouts during emergencies. This decision is pending approval from the Security Owner and Technical Owner.

## 10. Break-glass Policy Proposal

In the event of a critical emergency where normal branch protection rules prevent necessary action:

```text
Trigger conditions: Severe production incident blocking operations where normal PR flow is impossible.
Authorized role: Security Owner or Incident Owner
Independent approval: Required from at least one peer owner (e.g., Technical Owner)
Time-limited access: Access granted for a strictly defined window (e.g., 1 hour)
Audit evidence: Incident ticket, approval logs, and explicit documentation of bypassed rules.
Post-event review: Mandatory incident review identifying why break-glass was needed and how to avoid it.
Credential handling: Use of dedicated, auditable break-glass service accounts if applicable.
Rollback: Reversion of bypassed rules to standard protection immediately after the incident.
```

## 11. Rollback Plan

If applied branch protection rules negatively impact CI/CD pipelines or block development:

1. The Technical Owner authorizes a temporary suspension of the specific blocking rule.
2. The rules are adjusted to the previous known-good state.
3. The impact is documented and reviewed before re-applying the rule.

## 12. Required Owners and Authorities

The following roles must be formally assigned and approved before branch protection can be configured:

* Technical Owner
* Security Owner
* Deployment Owner
* Incident Owner (for break-glass)

## 13. Recommended Configuration

```text
RECOMMENDED_CONFIGURATION: Opción B · Protección estándar recomendada
CORPORATE_DECISION_PENDING
IMPLEMENTATION_NOT_AUTHORIZED
```

## 14. Open Decisions

* Approval of Option B or alternative.
* Identification and implementation of CI/CD checks.
* Formalization of break-glass procedure.
* Assignment of accountable owners.

## 15. Approval Record Template

```text
Decision: [Option A / B / C]
Technical Owner: [Name/Reference] - [Date] - [Signature/Approval]
Security Owner: [Name/Reference] - [Date] - [Signature/Approval]
Deployment Owner: [Name/Reference] - [Date] - [Signature/Approval]
Break-glass Authority: [Name/Reference] - [Date] - [Signature/Approval]
Corporate Authorization: [Reference ID]
```

## 16. Future Application Gate

The branch protection configuration cannot be applied until the following pre-conditions are verified:

```text
[ ] Technical Owner approved
[ ] Security Owner approved
[ ] Deployment Owner approved
[ ] Break-glass authority approved
[ ] Required checks identified
[ ] Required checks stable
[ ] CI/CD impact evaluated
[ ] Admin enforcement decision completed
[ ] Rollback documented
[ ] Corporate authorization recorded
```

## 17. Current Safe Postures

* MAIN_BRANCH_UNPROTECTED
* BRANCH_PROTECTION_RECOMMENDATION_DOCUMENTED
* CORPORATE_BRANCH_GOVERNANCE_DECISION_PENDING
* BRANCH_PROTECTION_CONFIGURATION_NOT_AUTHORIZED
* DEPLOYMENT_PROVENANCE_NOT_VERIFIABLE
* CORPORATE_OR_PROVIDER_EVIDENCE_REQUIRED
* NO_NEW_CORPORATE_EVIDENCE
* WAVE_1_OWNERSHIP_GOVERNANCE_STILL_OPEN
* WAVE_2_NOT_AUTHORIZED
* ARCHITECTURE_LOCK_BLOCKED
* NO_IMPLEMENTATION_PHASE_AUTHORIZED
* R1H5_DEFINED_BUT_NOT_TRIGGERED
