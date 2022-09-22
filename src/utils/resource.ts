import { v5 } from "uuid";
import { parse } from "path";
import { Resource } from "@monokle/validation";

const RESOURCE_UUID_NAMESPACE = "6fa71997-8aa8-4b89-b987-cec4fd3de770";

export const createResourceId = (
  fileId: string,
  name: string,
  kind: string,
  namespace?: string | null
): string => {
  return v5(
    `${fileId}${kind}${name}${namespace || ""}`,
    RESOURCE_UUID_NAMESPACE
  );
};

export function createResourceName(
  filePath: string,
  content: any,
  kind: string
): string {
  const parsedPath = parse(filePath);

  // dirname for kustomizations
  // if (
  //   kind === KUSTOMIZATION_KIND &&
  //   (!content?.apiVersion ||
  //     content.apiVersion.startsWith(KUSTOMIZATION_API_GROUP))
  // ) {
  //   return parsedPath.dir.replace(/^\/*/, '');
  // }

  try {
    //  metadata name
    return typeof content.metadata.name === "string"
      ? content.metadata.name.trim()
      : JSON.stringify(content.metadata.name).trim();
  } catch (error) {
    // filename
    return parsedPath.name;
  }
}

export function getResourcesForPath(
  filePath: string,
  resourceMap: Record<string, Resource>
) {
  return Object.values(resourceMap).filter(
    (resource) => resource?.filePath === filePath
  );
}
