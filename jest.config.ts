
import type { Config } from 'jest'

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/",
  ],
  coverageProvider: "v8",
  coverageReporters: [
    "text"
  ],
  maxConcurrency: 3,
  moduleDirectories: [
    "node_modules",
    "src",
  ],
  preset: 'ts-jest',
  roots: [
    "."
  ],
  slowTestThreshold: 20,
  testEnvironment: "jsdom",
  testTimeout: 90000,
}
export default config