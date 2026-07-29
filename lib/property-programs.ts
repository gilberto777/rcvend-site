import type { Property, PropertyProgram } from "@/types/property";

export const propertyProgramOptions: Array<{ value: PropertyProgram; label: string }> = [
  { value: "his2", label: "HIS 2" },
  { value: "hmp", label: "HMP" },
  { value: "r2v", label: "R2V" },
  { value: "nr", label: "NR" },
];

const programPatterns: Record<PropertyProgram, RegExp> = {
  his2: /(^|[^A-Z0-9])HIS\s*[-–]?\s*2([^A-Z0-9]|$)/i,
  hmp: /(^|[^A-Z0-9])HMP([^A-Z0-9]|$)/i,
  r2v: /(^|[^A-Z0-9])R2V([^A-Z0-9]|$)/i,
  nr: /(^|[^A-Z0-9])NR([^A-Z0-9]|$)/i,
};

export function getPropertyPrograms(
  property: Pick<Property, "title" | "slug" | "description" | "meta_title" | "meta_description" | "characteristics">,
) {
  const searchableText = [
    property.title,
    property.slug,
    property.description,
    property.meta_title,
    property.meta_description,
    ...property.characteristics,
  ]
    .filter(Boolean)
    .join(" ");

  return propertyProgramOptions
    .filter((program) => programPatterns[program.value].test(searchableText))
    .map((program) => program.value);
}

export function getPropertyProgramLabel(program: PropertyProgram) {
  return propertyProgramOptions.find((option) => option.value === program)?.label ?? program.toUpperCase();
}
