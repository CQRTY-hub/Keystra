import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["node_modules/**", ".next/**", "prisma/migrations/**"],
  },
];

export default eslintConfig;
