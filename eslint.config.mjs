// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // Reglas típicas de NestJS: muchos decoradores y DTOs usan `any`
      // implícitamente en los bordes del framework (Nest, Prisma, class-
      // validator), así que se relajan en vez de desactivarlas del todo.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
  {
    // En los specs, expect(mockRepo.metodo).toHaveBeenCalledWith(...) dispara
    // un falso positivo de unbound-method: el método nunca se invoca "suelto",
    // solo se pasa como referencia al matcher de Jest. Es el ajuste recomendado
    // por la propia documentación de typescript-eslint para proyectos con Jest.
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
);
