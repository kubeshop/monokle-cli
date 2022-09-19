import { S } from "../utils/screens.mjs";

export const success = () => `
${S.success} All resources are valid.
`;

export const failure = (validationCount: number) => `
${S.warning} ${validationCount} resources are invalid.
`