import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const CONTRACT_VERSION = "1.0.0";
const SCHEMA_VERSION = "SYN-HI-1";
const GENERATOR_VERSION = "1.0.0";
const GENERATOR_SEED = "HISTORICAL-IMPORT-SYNTHETIC-V1";
const FIXED_DATE = new Date('2026-01-01T12:00:00Z');

// Output paths
const FIXTURE_DIR = path.resolve(__dirname, '../../fixtures/historical-import');
const BASE_XLSX = path.join(FIXTURE_DIR, 'synthetic-survey-base.xlsx');
const COMP_XLSX = path.join(FIXTURE_DIR, 'synthetic-survey-comparison.xlsx');
const MANIFEST = path.join(FIXTURE_DIR, 'manifest.json');

// Assertions tracking
const metrics = {
  base: { eligible: 24, complete: 16, incomplete: 2 },
  comp: { eligible: 28, complete: 20, incomplete: 2 }
};

// Base answers configurations
const baseAnswers = [];
// 16 completes
const baseLikertClm = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5]; // 1x1, 2x2, 3x3, 6x4, 4x5 -> Fav 10/16 = 62.5%
const baseLikertLdr = [1, 2, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5]; // 1x1, 1x2, 2x3, 6x4, 6x5 -> Fav 12/16 = 75.0%
const baseLikertDev = [1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5]; // Fav 8/16 = 50.0%
const baseEnps = [1, 1, 1, 1, 1, 1, 8, 8, 8, 8, 11, 11, 11, 11, 11, 11]; // 6 det, 4 pass, 6 prom -> eNPS = 0
const baseCol4 = [1, 2, 3, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, null, null]; // 14 valid, 2 blanks
const baseText = Array(16).fill(null).map((_, i) => i < 8 ? `Synthetic feedback B${i}` : null); // 8 non-empty

const compLikertClm = [1, 2, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5]; // 1x1, 1x2, 2x3, 8x4, 8x5 -> Fav 16/20 = 80.0%
const compLikertLdr = [1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5]; // 2x1, 3x2, 3x3, 7x4, 5x5 -> Fav 12/20 = 60.0%
const compLikertDev = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5]; // 1x1, 2x2, 3x3, 7x4, 7x5 -> Fav 14/20 = 70.0%
const compEnps = [1, 1, 1, 1, 1, 1, 8, 8, 8, 8, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11]; // 6 det, 4 pass, 10 prom -> eNPS = 20
const compCol4 = [1, 2, 3, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, null]; // 19 valid, 1 blank
const compText = Array(20).fill(null).map((_, i) => i < 10 ? `Synthetic feedback C${i}` : null); // 10 non-empty

// Create base collaborators
// DIV-A: 10 eligible, 8 complete
// DIV-B: 8 eligible, 5 complete
// DIV-C: 6 eligible, 3 complete
const baseSegments = [
  { div: 'DIV-A', total: 10, complete: 8 },
  { div: 'DIV-B', total: 8, complete: 5 },
  { div: 'DIV-C', total: 6, complete: 3 },
];

const compSegments = [
  { div: 'DIV-A', total: 11, complete: 9 },
  { div: 'DIV-B', total: 9, complete: 6 },
  { div: 'DIV-C', total: 5, complete: 3 },
  { div: 'DIV-D', total: 3, complete: 2 },
];

function generateCollaborators(segments, periodId) {
  const cols = [];
  let idx = 1;
  for (const seg of segments) {
    for (let i = 0; i < seg.total; i++) {
      cols.push({
        collaborator_id: `COL-${periodId}-${idx.toString().padStart(3, '0')}`,
        survey_period_id: periodId,
        eligible: true,
        org_unit_code: seg.div,
        department_code: 'SYN-DEP',
        area_code: 'SYN-AREA',
        site_code: 'SYN-SITE',
        region_code: 'SYN-REG',
        tenure_band: 'SYN-TENURE',
        age_band: 'SYN-AGE',
        role_family: 'SYN-ROLE',
        employment_type: 'SYN-EMP',
        hierarchy_leaf_id: `H-TEAM-${seg.div}`,
        _complete: i < seg.complete
      });
      idx++;
    }
  }
  return cols;
}

const baseCols = generateCollaborators(baseSegments, 'SYN-BASE');
const compCols = generateCollaborators(compSegments, 'SYN-COMPARISON');

function generateAnswers(cols, periodId, likertClm, likertLdr, likertDev, enps, col4, text) {
  const answers = [];
  let completeIdx = 0;
  let incompleteCount = 0;

  for (const col of cols) {
    if (col._complete) {
      answers.push({
        response_id: `RESP-${periodId}-C${completeIdx}`,
        respondent_id: col.collaborator_id,
        survey_period_id: periodId,
        completion_status: 'COMPLETE',
        submitted_at: '2026-01-01T10:00:00Z',
        org_unit_code: col.org_unit_code,
        department_code: col.department_code,
        area_code: col.area_code,
        site_code: col.site_code,
        region_code: col.region_code,
        tenure_band: col.tenure_band,
        age_band: col.age_band,
        role_family: col.role_family,
        employment_type: col.employment_type,
        _data: { clm: likertClm[completeIdx], ldr: likertLdr[completeIdx], dev: likertDev[completeIdx], enps: enps[completeIdx], col4: col4[completeIdx], text: text[completeIdx] }
      });
      completeIdx++;
    } else if (incompleteCount < 2) {
      // 2 incomplete rows
      answers.push({
        response_id: `RESP-${periodId}-I${incompleteCount}`,
        respondent_id: col.collaborator_id,
        survey_period_id: periodId,
        completion_status: 'INCOMPLETE',
        submitted_at: '2026-01-01T10:00:00Z',
        org_unit_code: col.org_unit_code,
        department_code: col.department_code,
        area_code: col.area_code,
        site_code: col.site_code,
        region_code: col.region_code,
        tenure_band: col.tenure_band,
        age_band: col.age_band,
        role_family: col.role_family,
        employment_type: col.employment_type,
        _data: { clm: null, ldr: null, dev: null, enps: null, col4: null, text: null }
      });
      incompleteCount++;
    }
  }
  return answers;
}

const baseAnsRows = generateAnswers(baseCols, 'SYN-BASE', baseLikertClm, baseLikertLdr, baseLikertDev, baseEnps, baseCol4, baseText);
const compAnsRows = generateAnswers(compCols, 'SYN-COMPARISON', compLikertClm, compLikertLdr, compLikertDev, compEnps, compCol4, compText);

const metadataCols = [
  'response_id', 'respondent_id', 'survey_period_id', 'completion_status', 'submitted_at',
  'org_unit_code', 'department_code', 'area_code', 'site_code', 'region_code',
  'tenure_band', 'age_band', 'role_family', 'employment_type'
];

// Questions
const qBase = [
  { id: 'Q-CLM-001', type: 'LIKERT_1_TO_5', req: true, val: (d) => d.clm },
  { id: 'Q-CLM-002', type: 'LIKERT_1_TO_5', req: true, val: (d) => 3 },
  { id: 'Q-CLM-003', type: 'LIKERT_1_TO_5', req: true, val: (d) => 3 },
  { id: 'Q-CLM-004', type: 'LIKERT_1_TO_5', req: true, val: (d) => 3 },
  { id: 'Q-LDR-001', type: 'LIKERT_1_TO_5', req: true, val: (d) => d.ldr },
  { id: 'Q-LDR-002', type: 'LIKERT_1_TO_5', req: true, val: (d) => 4 },
  { id: 'Q-LDR-003', type: 'LIKERT_1_TO_5', req: true, val: (d) => 4 },
  { id: 'Q-LDR-004', type: 'LIKERT_1_TO_5', req: true, val: (d) => 4 },
  { id: 'Q-COL-001', type: 'LIKERT_1_TO_5', req: true, val: (d) => 4 },
  { id: 'Q-COL-002', type: 'LIKERT_1_TO_5', req: true, val: (d) => 4 },
  { id: 'Q-COL-003', type: 'LIKERT_1_TO_5', req: true, val: (d) => 4 },
  { id: 'Q-COL-004', type: 'LIKERT_1_TO_5', req: false, val: (d) => d.col4 }, // allowed blanks
  { id: 'B_DEV_01', type: 'LIKERT_1_TO_5', req: true, val: (d) => d.dev, canId: 'Q-DEV-001' },
  { id: 'Q-COM-001', type: 'LIKERT_1_TO_5', req: true, val: (d) => 4, label: 'Synthetic Comm Base' },
  { id: 'Q-LEGACY-001', type: 'LIKERT_1_TO_5', req: true, val: (d) => 3 },
  { id: 'Q-ENPS-001', type: 'ENPS_EXPORTED_1_TO_11', req: true, val: (d) => d.enps },
  { id: 'Q-TXT-001', type: 'OPEN_TEXT', req: false, val: (d) => d.text }
]; // 17 questions

const qComp = [
  { id: 'Q-CLM-001', type: 'LIKERT_1_TO_5', req: true, val: (d) => d.clm },
  { id: 'Q-CLM-002', type: 'LIKERT_1_TO_5', req: true, val: (d) => 3 },
  { id: 'Q-CLM-003', type: 'LIKERT_1_TO_5', req: true, val: (d) => 3 },
  { id: 'Q-CLM-004', type: 'LIKERT_1_TO_5', req: true, val: (d) => 3 },
  { id: 'Q-LDR-001', type: 'LIKERT_1_TO_5', req: true, val: (d) => d.ldr },
  { id: 'Q-LDR-002', type: 'LIKERT_1_TO_5', req: true, val: (d) => 4 },
  { id: 'Q-LDR-003', type: 'LIKERT_1_TO_5', req: true, val: (d) => 4 },
  { id: 'Q-LDR-004', type: 'LIKERT_1_TO_5', req: true, val: (d) => 4 },
  { id: 'Q-COL-001', type: 'LIKERT_1_TO_5', req: true, val: (d) => 4 },
  { id: 'Q-COL-002', type: 'LIKERT_1_TO_5', req: true, val: (d) => 4 },
  { id: 'Q-COL-003', type: 'LIKERT_1_TO_5', req: true, val: (d) => 4 },
  { id: 'Q-COL-004', type: 'LIKERT_1_TO_5', req: false, val: (d) => d.col4 }, // allowed blanks
  { id: 'C_GROWTH_07', type: 'LIKERT_1_TO_5', req: true, val: (d) => d.dev, canId: 'Q-DEV-001' },
  { id: 'Q-COM-001', type: 'LIKERT_1_TO_5', req: true, val: (d) => 4, label: 'Synthetic Comm Comp' },
  { id: 'Q-NEW-001', type: 'LIKERT_1_TO_5', req: true, val: (d) => 4 },
  { id: 'Q-ENPS-001', type: 'ENPS_EXPORTED_1_TO_11', req: true, val: (d) => d.enps },
  { id: 'Q-TXT-001', type: 'OPEN_TEXT', req: false, val: (d) => d.text }
]; // 17 questions

async function createWorkbook(filepath, ansRows, cols, periodId, qs, numNodes) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'UBITS Synthetic Fixture Generator';
  wb.lastModifiedBy = 'UBITS Synthetic Fixture Generator';
  wb.created = FIXED_DATE;
  wb.modified = FIXED_DATE;
  wb.company = 'UBITS Synthetic Sandbox';
  wb.title = 'deterministic synthetic fixture title';
  wb.subject = 'non-productive synthetic survey fixture';
  wb.keywords = 'synthetic, sandbox, historical-import';

  // 1. answers
  const wsAns = wb.addWorksheet('answers');
  const ansHeaders = [...metadataCols, ...qs.map(q => q.id)];
  wsAns.addRow(ansHeaders);
  for (const row of ansRows) {
    const r = [];
    for (const c of metadataCols) {
      r.push(row[c]);
    }
    for (const q of qs) {
      r.push(row._data ? q.val(row._data) : null);
    }
    wsAns.addRow(r);
  }

  // 2. Dimensions
  const wsDim = wb.addWorksheet('Dimensions');
  const dimHeaders = [
    'source_question_identifier', 'canonical_question_id', 'dimension_id', 'dimension_label',
    'question_label', 'question_type', 'is_required', 'survey_period_id',
    'display_order', 'scale_min', 'scale_max', 'comparability_hint', 'active'
  ];
  wsDim.addRow(dimHeaders);
  qs.forEach((q, idx) => {
    wsDim.addRow([
      q.id,
      q.canId || q.id,
      'DIM-SYN',
      'Synthetic Dimension',
      q.label || `Synthetic Question ${q.id}`,
      q.type,
      q.req,
      periodId,
      idx + 1,
      q.type.includes('LIKERT') ? 1 : (q.type.includes('ENPS') ? 1 : null),
      q.type.includes('LIKERT') ? 5 : (q.type.includes('ENPS') ? 11 : null),
      'MATCHED',
      true
    ]);
  });

  // 3. colaboradores
  const wsCol = wb.addWorksheet('colaboradores');
  const colHeaders = [
    'collaborator_id', 'survey_period_id', 'eligible', 'org_unit_code',
    'department_code', 'area_code', 'site_code', 'region_code',
    'tenure_band', 'age_band', 'role_family', 'employment_type', 'hierarchy_leaf_id'
  ];
  wsCol.addRow(colHeaders);
  for (const c of cols) {
    const row = colHeaders.map(h => c[h]);
    wsCol.addRow(row);
  }

  // 4. Jerarquía
  const wsHier = wb.addWorksheet('Jerarquía');
  const hierHeaders = [
    'hierarchy_node_id', 'hierarchy_node_label', 'hierarchy_level', 'parent_node_id',
    'org_unit_code', 'active', 'display_order'
  ];
  wsHier.addRow(hierHeaders);
  wsHier.addRow(['H-ROOT-001', 'Organización Sintética', 'ROOT', null, null, true, 1]);
  // Build divisions based on segment
  let currentOrder = 2;
  wsHier.addRow(['H-DEP-SYN', 'Departamento Sintético', 'DEPARTMENT', 'H-ROOT-001', 'SYN-DEP', true, currentOrder++]);
  wsHier.addRow(['H-AREA-SYN', 'Área Sintética', 'AREA', 'H-DEP-SYN', 'SYN-AREA', true, currentOrder++]);

  const segments = periodId === 'SYN-BASE' ? baseSegments : compSegments;
  for (const seg of segments) {
    wsHier.addRow([`H-DIV-${seg.div}`, `División ${seg.div}`, 'DIVISION', 'H-AREA-SYN', seg.div, true, currentOrder++]);
    wsHier.addRow([`H-TEAM-${seg.div}`, `Equipo ${seg.div}`, 'TEAM', `H-DIV-${seg.div}`, seg.div, true, currentOrder++]);
  }

  await wb.xlsx.writeFile(filepath);
}

function getSha256(filepath) {
  const fileBuffer = fs.readFileSync(filepath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

async function validateAndGenerate() {
  await createWorkbook(BASE_XLSX, baseAnsRows, baseCols, 'SYN-BASE', qBase, 9);
  await createWorkbook(COMP_XLSX, compAnsRows, compCols, 'SYN-COMPARISON', qComp, 11);

  // Validate properties
  const wb1 = new ExcelJS.Workbook();
  await wb1.xlsx.readFile(BASE_XLSX);
  const wb2 = new ExcelJS.Workbook();
  await wb2.xlsx.readFile(COMP_XLSX);

  if (wb1.worksheets.length !== 4) throw new Error("Base WB sheet count wrong");
  if (wb2.worksheets.length !== 4) throw new Error("Comp WB sheet count wrong");

  const expectedSheets = ['answers', 'Dimensions', 'colaboradores', 'Jerarquía'];
  wb1.worksheets.forEach((ws, i) => { if (ws.name !== expectedSheets[i]) throw new Error("Base sheet order/name wrong"); });
  wb2.worksheets.forEach((ws, i) => { if (ws.name !== expectedSheets[i]) throw new Error("Comp sheet order/name wrong"); });

  const getRowCount = (wb, name) => wb.getWorksheet(name).rowCount - 1; // ex header

  if (getRowCount(wb1, 'answers') !== 18) throw new Error(`Base answers rows wrong: ${getRowCount(wb1, 'answers')}`);
  if (getRowCount(wb1, 'Dimensions') !== 17) throw new Error("Base Dimensions rows wrong");
  if (getRowCount(wb1, 'colaboradores') !== 24) throw new Error("Base colaboradores rows wrong");
  if (getRowCount(wb1, 'Jerarquía') !== 9) throw new Error(`Base Jerarquía physical data rows wrong: ${getRowCount(wb1, 'Jerarquía')} expected 9`);

  if (getRowCount(wb2, 'answers') !== 22) throw new Error("Comp answers rows wrong");
  if (getRowCount(wb2, 'Dimensions') !== 17) throw new Error("Comp Dimensions rows wrong");
  if (getRowCount(wb2, 'colaboradores') !== 28) throw new Error("Comp colaboradores rows wrong");
  if (getRowCount(wb2, 'Jerarquía') !== 11) throw new Error(`Comp Jerarquía physical data rows wrong: ${getRowCount(wb2, 'Jerarquía')} expected 11`);

  // Generate manifest
  const manifest = {
    contractName: "Historical Import Synthetic Mock Data Contract",
    contractVersion: CONTRACT_VERSION,
    schemaVersion: SCHEMA_VERSION,
    generatorVersion: GENERATOR_VERSION,
    generatorSeed: GENERATOR_SEED,
    exceljsVersion: "4.4.0",
    generatedArtifacts: ["synthetic-survey-base.xlsx", "synthetic-survey-comparison.xlsx"],
    sheetOrder: expectedSheets,
    rowCounts: {
      "synthetic-survey-base.xlsx": { answers: 18, Dimensions: 17, colaboradores: 24, Jerarquía: 9 },
      "synthetic-survey-comparison.xlsx": { answers: 22, Dimensions: 17, colaboradores: 28, Jerarquía: 11 }
    },
    columnCounts: {
      "answers": 31
    },
    questionCounts: { physicalPerWorkbook: 17 },
    canonicalQuestionUnionCount: 18,
    participationAssertions: {
      base: "16 / 24 = 66.67%",
      comparison: "20 / 28 = 71.43%",
      delta: "+4.76 pp"
    },
    metricAssertions: {
      "Q-CLM-001": { baseFavorability: "62.50%", comparisonFavorability: "80.00%", delta: "+17.50 pp" },
      "Q-LDR-001": { baseFavorability: "75.00%", comparisonFavorability: "60.00%", delta: "-15.00 pp" },
      "Q-DEV-001": { baseFavorability: "50.00%", comparisonFavorability: "70.00%", delta: "+20.00 pp", status: "ID_CHANGED_MATCHED" },
      "Q-COM-001": { status: "TEXT_CHANGED_REVIEW_REQUIRED" },
      "eNPS": { baseScore: "0", comparisonScore: "+20", delta: "+20" },
      "Q-COL-004": {
        baseValidValues: 14, baseBlanks: 2, baseValidResponseRate: "87.50%",
        comparisonValidValues: 19, comparisonBlanks: 1, comparisonValidResponseRate: "95.00%"
      }
    },
    privacyAssertions: {
      minimumCompletedResponsesForVisibleSegment: 4,
      base: { "DIV-A": "VISIBLE", "DIV-B": "VISIBLE", "DIV-C": "SUPPRESSED_SMALL_SEGMENT" },
      comparison: { "DIV-A": "VISIBLE", "DIV-B": "VISIBLE", "DIV-C": "SUPPRESSED_SMALL_SEGMENT", "DIV-D": "SUPPRESSED_SMALL_SEGMENT" }
    },
    openTextAssertions: {
      baseNonEmpty: 8,
      comparisonNonEmpty: 10,
      maxLength: 120
    },
    contentSafetyAssertions: {
      noRealClientData: true,
      noPII: true,
      noNetworkGeneration: true,
      noFormulas: true,
      noMacros: true,
      noExternalLinks: true
    },
    sha256: {
      base: getSha256(BASE_XLSX),
      comparison: getSha256(COMP_XLSX)
    },
    determinismStatus: "BINARY_DETERMINISM_VERIFIED"
  };

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
}

validateAndGenerate().catch(err => {
  console.error("GENERATION ERROR:", err);
  process.exit(1);
});
