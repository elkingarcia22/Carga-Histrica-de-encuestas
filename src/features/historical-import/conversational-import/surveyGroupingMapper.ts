export interface SurveyGroup {
  id: string;
  name: string;
  files: File[];
  year: string;
  surveyType: string;
}

export function detectSurveyGroups(files: File[]): SurveyGroup[] {
  const groups: Record<string, SurveyGroup> = {};

  files.forEach((file) => {
    const name = file.name.toLowerCase();

    let year = "Desconocido";
    const yearMatch = name.match(/20\d{2}/);
    if (yearMatch) {
      year = yearMatch[0];
    }

    let type = "General";
    if (name.includes("clima")) type = "Clima";
    else if (name.includes("pulso")) type = "Pulso";
    else if (name.includes("engagement")) type = "Engagement";

    const groupId = `${type}_${year}`.toLowerCase().replace(/\s+/g, '_');
    const groupName = `${type} ${year !== "Desconocido" ? year : ""}`.trim();

    if (!groups[groupId]) {
      groups[groupId] = {
        id: groupId,
        name: groupName,
        files: [],
        year,
        surveyType: type
      };
    }
    groups[groupId].files.push(file);
  });

  return Object.values(groups);
}
