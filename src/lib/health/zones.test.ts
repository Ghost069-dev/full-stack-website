import { describe, expect, it } from "vitest";

import { SAMPLE_REPORT, analyse, doctorQuestions, explain, summarise } from "./report";
import { classifyZone } from "./zones";

describe("traffic-light zones", () => {
  it("puts a value inside the reference range in the Green zone", () => {
    expect(classifyZone(13.5, 13.0, 17.0)).toBe("green");
  });

  it("puts a value slightly above the range (fasting sugar 128 vs 70–100) in the Yellow zone", () => {
    expect(classifyZone(128, 70, 100)).toBe("yellow");
  });

  it("puts a value far above the range (HbA1c 9.4 vs 4.0–5.6) in the Red zone", () => {
    expect(classifyZone(9.4, 4.0, 5.6)).toBe("red");
  });

  it("puts a value far above the range (creatinine 3.4 vs 0.7–1.3) in the Red zone", () => {
    expect(classifyZone(3.4, 0.7, 1.3)).toBe("red");
  });

  it("treats values far below the range as Red too", () => {
    expect(classifyZone(8, 13, 17)).toBe("red");
  });
});

describe("Ramesh Ji sample report", () => {
  const results = analyse(SAMPLE_REPORT.tests);

  it("shows Green, Yellow, Red, Red for Hemoglobin, Sugar, HbA1c, Creatinine", () => {
    expect(results.map((r) => r.zone)).toEqual(["green", "yellow", "red", "red"]);
  });

  it("gives an overall Red summary when any test is Red", () => {
    expect(summarise(results).zone).toBe("red");
  });

  it("tells the patient to see a doctor soon for Red results, in Hindi", () => {
    const creatinine = results[3];
    expect(creatinine).toBeDefined();
    expect(explain(creatinine!, "hi")).toContain("जल्द से जल्द डॉक्टर को दिखाएँ");
  });

  it("only builds doctor questions from Yellow and Red results", () => {
    const greenOnly = analyse([{ name: "Hemoglobin", value: 14, unit: "g/dL", low: 13, high: 17 }]);
    expect(doctorQuestions(greenOnly, "en")).toEqual([]);
    expect(doctorQuestions(results, "en").length).toBeGreaterThan(0);
  });
});
