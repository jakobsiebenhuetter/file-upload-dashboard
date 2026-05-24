const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testPathIgnorePatterns: ['./tests/', './Util/'],
  coverageDirectory: "jest-test-report",
  testEnvironment: "jsdom",
  transform: {
    ...tsJestTransformCfg,
  },
};