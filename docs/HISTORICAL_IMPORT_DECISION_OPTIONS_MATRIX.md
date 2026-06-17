# HISTORICAL_IMPORT_DECISION_OPTIONS_MATRIX

| Decision Domain | Candidate Option | Existing Corporate Evidence | Benefits | Risks | Preconditions | Owner Approval | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Database** | PostgreSQL (Candidate A) | Not found | Mature, relational integrity, RLS for tenant isolation. | Operational overhead if self-hosted. | Cloud provider & Region approved. | Required | OPEN |
| **Database** | MySQL (Candidate B) | Not found | Wide ecosystem. | Less robust RLS natively. | Cloud provider & Region approved. | Required | OPEN |
| **Object Storage** | AWS S3 / GCP GCS (Candidate A) | Not found | Highly scalable, lifecycle policies, encryption. | Vendor lock-in, misconfiguration risks. | Cloud provider & Region approved. | Required | OPEN |
| **Queue / Broker** | SQS / PubSub (Candidate A) | Not found | Managed, serverless, high throughput. | Specific to cloud provider. | Cloud provider & Region approved. | Required | OPEN |
| **Worker Runtime** | ECS / Cloud Run / Lambda (Candidate A) | Not found | Scalable processing for heavy files. | Timeout limits, cold starts. | Cloud provider & Region approved. | Required | OPEN |
| **Authentication** | Auth0 / Cognito / Firebase (Candidate A) | Not found | Managed identity, standard OIDC/SAML. | Integration effort with existing apps. | Security approval. | Required | OPEN |
| **Tenant Isolation** | Row-Level Security (RLS) (Candidate A) | Not found | Strong isolation at DB level. | Performance impact on complex queries. | Canonical tenant ID defined. | Required | OPEN |
| **Tenant Isolation** | App-Level Filtering (Candidate B) | Not found | Simpler implementation. | Higher risk of cross-tenant leaks. | Canonical tenant ID defined. | Required | OPEN |
| **Staging to Core** | API / Event-driven (Candidate A) | Not found | Decoupled architecture. | Eventual consistency complexity. | Core publication contract defined. | Required | OPEN |
| **Audit** | Appended Logs / Audit Table (Candidate A) | Not found | Immutable history. | Storage costs. | Retention policy defined. | Required | OPEN |
| **Observability** | Datadog / New Relic / OTEL (Candidate A) | Not found | Comprehensive monitoring. | Cost, PII leakage in logs. | PII blocklist defined. | Required | OPEN |
| **Malware Scanning** | Cloud-native scanner / ClamAV (Candidate A) | Not found | Prevents malicious uploads. | Processing delay, false positives. | Object storage selected. | Required | OPEN |
| **AI Usage** | OpenAI / Vertex AI (with Zero Retention DPA) (Candidate A) | Not found | Advanced mapping intelligence. | Data privacy risks, hallucination. | AI policy and DPA approved. | Required | OPEN |
| **Safe Sample Storage** | Dedicated secure bucket (Candidate A) | Not found | Isolated, accessible to developers. | Access control management overhead. | Storage provider approved. | Required | OPEN |
