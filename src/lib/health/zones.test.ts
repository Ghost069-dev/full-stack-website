import { describe, expect, it } from "vitest";

import { getTestByKey } from "./clinical-db";
import { SAMPLE_REPORT, analyse, doctorQuestions, flagLabel, sortBySeverity, speechSummary, summarise } from "./report";

const one = (name: string, value: number, unit: string, age: number | null, sex: "M" | "F" | null) =>
  analyse([{ name, value, unit, labLow: null, labHigh: null }], { age, sex })[0]!;

describe("Ramesh Ji (62M) sample report", () => {
  const results = analyse(SAMPLE_REPORT.tests, SAMPLE_REPORT.profile);

  it("shows Hemoglobin 13.5 Green, Sugar 110 Yellow, HbA1c 9.4 Red, Creatinine 3.4 Red", () => {
    expect(results.map((r) => [r.key, r.zone])).toEqual([
      ["hemoglobin", "green"],
      ["fasting_sugar", "yellow"],
      ["hba1c", "red"],
      ["creatinine", "red"],
    ]);
  });

  it("uses the fasting sugar value 110 mg/dL", () => {
    expect(results[1]?.value).toBe(110);
  });

  it("produces two red flags, creatinine first", () => {
    const red = sortBySeverity(results).filter((r) => r.zone === "red").map(flagLabel);
    expect(red).toEqual(["Creatinine 3.4", "HbA1c 9.4"]);
  });

  it("is overall Red", () => {
    expect(summarise(results).zone).toBe("red");
  });

  it("greets Ramesh Ji by name in the Hindi read-aloud", () => {
    expect(speechSummary(results, "hi", "Ramesh Ji")).toMatch(/^नमस्ते Ramesh Ji।/);
  });
});

describe("clinical rule table", () => {
  it("fasting sugar: 99 Green, 100–125 Yellow (borderline), 126 Red", () => {
    expect(one("FBS", 99, "mg/dL", 40, "M").zone).toBe("green");
    expect(one("FBS", 100, "mg/dL", 40, "M").zone).toBe("yellow");
    expect(one("FBS", 125, "mg/dL", 40, "M").zone).toBe("yellow");
    expect(one("FBS", 126, "mg/dL", 40, "M").zone).toBe("red");
  });

  it("HbA1c: 5.6 Green, 5.7 Yellow, 8.5 Yellow, 8.6 Red", () => {
    expect(one("HbA1c", 5.6, "%", 50, "F").zone).toBe("green");
    expect(one("HbA1c", 5.7, "%", 50, "F").zone).toBe("yellow");
    expect(one("HbA1c", 8.5, "%", 50, "F").zone).toBe("yellow");
    expect(one("HbA1c", 8.6, "%", 50, "F").zone).toBe("red");
  });

  it("creatinine: Red above 2.0", () => {
    expect(one("Creatinine", 2.0, "mg/dL", 62, "M").zone).toBe("yellow");
    expect(one("Creatinine", 2.1, "mg/dL", 62, "M").zone).toBe("red");
  });

  it("adjusts hemoglobin for sex: 12.5 is Green for a woman, Yellow for a man", () => {
    expect(one("Hemoglobin", 12.5, "g/dL", 40, "F").zone).toBe("green");
    expect(one("Hemoglobin", 12.5, "g/dL", 40, "M").zone).toBe("yellow");
  });

  it("adjusts creatinine for sex: 1.2 is Green for a man, Yellow for a woman", () => {
    expect(one("Creatinine", 1.2, "mg/dL", 40, "M").zone).toBe("green");
    expect(one("Creatinine", 1.2, "mg/dL", 40, "F").zone).toBe("yellow");
  });

  it("adjusts TSH for age: 5.5 is Green at 75, Yellow at 40", () => {
    expect(one("TSH", 5.5, "uIU/mL", 75, "F").zone).toBe("green");
    expect(one("TSH", 5.5, "uIU/mL", 40, "F").zone).toBe("yellow");
  });

  it("converts creatinine from µmol/L (300 µmol/L ≈ 3.39 mg/dL → Red)", () => {
    const r = one("Creatinine", 300, "µmol/L", 62, "M");
    expect(r.value).toBeCloseTo(3.39, 1);
    expect(r.zone).toBe("red");
  });

  it("ignores the lab's printed range for tests in the table", () => {
    const r = analyse([{ name: "HbA1c", value: 9.4, unit: "%", labLow: 4, labHigh: 12 }], { age: 62, sex: "M" })[0]!;
    expect(r.source).toBe("clinical_db");
    expect(r.zone).toBe("red");
  });

  it("falls back to the lab's printed range only for unknown tests", () => {
    const r = analyse([{ name: "Serum Ferritin", value: 20, unit: "ng/mL", labLow: 30, labHigh: 400 }], { age: 40, sex: "F" })[0]!;
    expect(r.source).toBe("lab_range");
    expect(r.zone).toBe("red");
  });

  it("skips unknown tests that have no printed range", () => {
    expect(analyse([{ name: "Mystery", value: 3, unit: "", labLow: null, labHigh: null }], { age: 40, sex: "F" })).toEqual([]);
  });

  it("has every test named in all four languages", () => {
    const hb = getTestByKey("hemoglobin")!;
    expect(Object.keys(hb.name).sort()).toEqual(["en", "hi", "mr", "pa"]);
  });

  it("builds no doctor questions when everything is Green", () => {
    const green = analyse([{ name: "Hemoglobin", value: 14, unit: "g/dL", labLow: null, labHigh: null }], { age: 30, sex: "M" });
    expect(doctorQuestions(green, "pa")).toEqual([]);
  });
});
