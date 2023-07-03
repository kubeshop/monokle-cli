import { Config } from "@monokle/validation";

export type Framework = "pss-restricted" | "pss-baseline" | "nsa";

export const getFrameworkConfig = async (framework?: Framework): Promise<Config | undefined> => {
  if (!framework) {
    return undefined;
  }
  const { default: config } = await import(`./${framework}.js`);
  return config;
};
