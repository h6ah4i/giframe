import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
    {
        ignores: ['dist/**', 'node_modules/**']
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsparser,
            ecmaVersion: 6,
            sourceType: 'module'
        },
        plugins: {
            '@typescript-eslint': tseslint
        },
        rules: {
            // Core ESLint rules
            'curly': ['error', 'all'],
            'eqeqeq': ['error', 'smart'],
            'brace-style': ['error', 'stroustrup'],
            'operator-linebreak': ['error', 'before'],
            'no-trailing-spaces': ['error', { skipBlankLines: false }],

            // TypeScript-specific rules
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    'selector': 'interface',
                    'format': ['PascalCase'],
                    'custom': {
                        'regex': '^I[A-Z]',
                        'match': true
                    }
                }
            ],
            '@typescript-eslint/no-inferrable-types': 'off',

            // Recommended TypeScript rules
            ...tseslint.configs['recommended'].rules,

            // Override rules for specific cases
            '@typescript-eslint/no-explicit-any': ['error'],
            '@typescript-eslint/no-unused-expressions': ['error'],
            '@typescript-eslint/no-unsafe-function-type': ['error']
        }
    },
    // Special config for test files
    {
        files: ['test/**/*.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-expressions': 'off', // For chai assertions
            '@typescript-eslint/no-unsafe-function-type': 'off'
        }
    }
];