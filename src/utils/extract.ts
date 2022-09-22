import { Resource } from "@monokle/validation";
import { LineCounter, parseAllDocuments, parseDocument } from "yaml";
import { createResourceName, createResourceId } from "./resource.js";

export const KUSTOMIZATION_KIND = "Kustomization";
export const KUSTOMIZATION_API_GROUP = "kustomize.config.k8s.io";

export type File = {
  id: string;
  path: string;
  content: string;
};

export function extractK8sResources(files: File[]): Resource[] {
  const resources: Resource[] = [];

  for (const file of files) {
    const lineCounter = new LineCounter();
    const documents = parseAllYamlDocuments(file.content, lineCounter);

    for (const document of documents) {
      const content = document.toJS();

      if (document.errors.length) {
        continue;
      }

      const resource: Partial<Resource> = {
        fileId: file.id,
        filePath: file.path,
        text: document.toString({ directives: false }),
      };

      if (isKubernetesLike(content)) {
        const name = createResourceName(file.path, content, content.kind);
        Object.assign(resource, {
          name,
          id: createResourceId(
            file.id,
            content.kind,
            name,
            content.metadata?.namespace
          ),
          namespace: extractNamespace(content),
          apiVersion: content.apiVersion,
          kind: content.kind,
          content,
        });

        resources.push(resource as Resource);
      } else if (
        content &&
        isUntypedKustomizationFile(file.path) &&
        documents.length === 1
      ) {
        const name = createResourceName(file.path, content, KUSTOMIZATION_KIND);
        Object.assign(resource, {
          name,
          id: createResourceId(file.id, name, KUSTOMIZATION_KIND),
          apiVersion: content.apiVersion,
          kind: content.kind,
          content,
        });

        resources.push(resource as Resource);
      }
    }
  }

  return resources;
}

type KubernetesLike = {
  apiVersion: string;
  kind: string;
  metadata?: {
    name: string;
    namespace?: string;
  };
  spec?: {
    names?: {
      kind?: string;
    };
  };
};

function isKubernetesLike(content: any): content is KubernetesLike {
  return (
    content &&
    typeof content.apiVersion === "string" &&
    typeof content.kind === "string"
  );
}

// some (older) kustomization yamls don't contain kind/group properties to identify them as such
// they are identified only by their name
function isUntypedKustomizationFile(filePath = ""): boolean {
  return /kustomization*.yaml/.test(filePath.toLowerCase().trim());
}

export function isYamlFile(file: File): boolean {
  return file.path.endsWith(".yml") || file.path.endsWith(".yaml");
}
export function parseYamlDocument(text: string, lineCounter?: LineCounter) {
  return parseDocument(text, { lineCounter, uniqueKeys: false, strict: false });
}

/**
 * Wrapper that ensures consistent options
 */

export function parseAllYamlDocuments(text: string, lineCounter?: LineCounter) {
  return parseAllDocuments(text, {
    lineCounter,
    uniqueKeys: false,
    strict: false,
  });
}

function extractNamespace(content: any) {
  // namespace could be an object if it's a helm template value...
  return content.metadata?.namespace &&
    typeof content.metadata.namespace === "string"
    ? content.metadata.namespace
    : undefined;
}
