import { S } from "../utils/screens.js";

export const success = () => `
${S.success} All resources are valid.
`;

export const failure = (validationCount: number) => `
${S.warning} ${validationCount} resources are invalid.
`