import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    collectCoverageFrom: [
        'src/controllers/**/*.ts',
        'src/services/**/*.ts',
        'src/repositories/**/*.ts',
        'src/middlewares/**/*.ts',
        '!src/**/*.d.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
};

export default config;