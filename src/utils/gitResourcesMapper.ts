import { dirname, relative, resolve } from "path";
import { simpleGit, CheckRepoActions, SimpleGit } from "simple-git";
import { Resource } from "@monokle/parser";
import { ValidationResponse } from "@monokle/validation";

export type Paths = {
  new: string;
  old: string;
};

export class GitResourceMapper {
  protected resourcePathsMap: Map<string, Paths> = new Map(); // <resource.id, Paths>
  protected mappedResources: Resource[] = [];

  constructor(
    protected resources: Resource[]
  ) { }

  async mapResourcePathsToRepoRootRelative() {
    if (this.mappedResources.length > 0) {
      return this.mappedResources;
    }

    const gitInstances: Map<string, SimpleGit> = new Map();

    for (const resource of this.resources) {
      const resourcePath = resource.filePath;
      const resourceDir = dirname(resourcePath);
      const fullResourcePath = resolve(resourcePath);
      const fullResourceDir = resolve(resourceDir);

      const git = gitInstances.get(fullResourceDir) || simpleGit(fullResourceDir);
      gitInstances.set(fullResourceDir, git);

      const isGitRepo = await git.checkIsRepo();
      if (!isGitRepo) {
        this.mappedResources.push(resource);
        continue;
      }

      const isGitRepoRoot = await git.checkIsRepo(CheckRepoActions.IS_REPO_ROOT);

      let repoRootFull = fullResourceDir;
      if (!isGitRepoRoot) {
        const gitRoot = await git.revparse(["--show-toplevel"]);
        repoRootFull = resolve(gitRoot);
      }

      const relativePath = relative(repoRootFull, fullResourcePath);

      const mappedResource = {
        ...resource,
        filePath: relativePath,
      }

      this.resourcePathsMap.set(resource.id, {
        new: relativePath,
        old: resourcePath,
      });

      this.mappedResources.push(mappedResource);
    }

    return this.mappedResources;
  }

  restoreInitialResourcePaths(validationResponse: ValidationResponse) {
    validationResponse.runs.forEach(run => {
      run.results.forEach(result => {
        const resourceLocationWithId = result.locations.find(location => location.physicalLocation?.artifactLocation?.uriBaseId === 'RESOURCE');
        const resourceId = resourceLocationWithId?.physicalLocation?.artifactLocation?.uri;
        const resourcePaths = this.resourcePathsMap.get(resourceId || '');

        if (resourcePaths) {
          const srcRootLocation = result.locations.find(location => location.physicalLocation?.artifactLocation?.uriBaseId === 'SRCROOT');
          if (srcRootLocation) {
            srcRootLocation.physicalLocation!.artifactLocation.uri = resourcePaths.old;
          }

          const resourceLogicalLocation = result.locations.find(location => location.logicalLocations?.find(locationPart => locationPart.kind === 'resource'));
          const resourceLogicalLocationObj = resourceLogicalLocation?.logicalLocations!.find(locationPart => locationPart.kind === 'resource');
          const newFullyQualifiedName = resourceLogicalLocationObj?.fullyQualifiedName;
          if (newFullyQualifiedName) {
            resourceLogicalLocationObj.fullyQualifiedName = resourceLogicalLocationObj.fullyQualifiedName?.replace(
              new RegExp(`${resourcePaths.new}$`),
              resourcePaths.old
            );
          }
        }
      });
    });

    return validationResponse;
  }
}

// Location references so it is easier to grasp what GitResourceMapper.restoreInitialResourcePaths() does:
//
// With repo root relative paths:
// "locations": [
//   {
//     "physicalLocation": {
//       "artifactLocation": {
//         "uriBaseId": "SRCROOT",
//         "uri": "standalone/deployment.yaml"
//       },
//       "region": {
//         "startLine": 23,
//         "startColumn": 18,
//         "endLine": 23,
//         "endColumn": 35
//       }
//     }
//   },
//   {
//     "physicalLocation": {
//       "artifactLocation": {
//         "uriBaseId": "RESOURCE",
//         "uri": "3e1520dd-1689-505b-8894-f481b0a234ef"
//       },
//       "region": {
//         "startLine": 23,
//         "startColumn": 18,
//         "endLine": 23,
//         "endColumn": 35
//       }
//     },
//     "logicalLocations": [
//       {
//         "kind": "resource",
//         "fullyQualifiedName": "panda-blog.third-branch.deployment@standalone/deployment.yaml",
//         "name": "panda-blog"
//       },
//       {
//         "kind": "element",
//         "name": "image",
//         "fullyQualifiedName": "spec.template.spec.containers.0.image"
//       }
//     ]
//   }
// ]
//
// With paths relative to how CLI command was run:
// "locations": [
//   {
//     "physicalLocation": {
//       "artifactLocation": {
//         "uriBaseId": "SRCROOT",
//         "uri": "../monokle-demo/standalone/deployment.yaml"
//       },
//       "region": {
//         "startLine": 23,
//         "startColumn": 18,
//         "endLine": 23,
//         "endColumn": 35
//       }
//     }
//   },
//   {
//     "physicalLocation": {
//       "artifactLocation": {
//         "uriBaseId": "RESOURCE",
//         "uri": "3e1520dd-1689-505b-8894-f481b0a234ef"
//       },
//       "region": {
//         "startLine": 23,
//         "startColumn": 18,
//         "endLine": 23,
//         "endColumn": 35
//       }
//     },
//     "logicalLocations": [
//       {
//         "kind": "resource",
//         "fullyQualifiedName": "panda-blog.third-branch.deployment@../monokle-demo/standalone/deployment.yaml",
//         "name": "panda-blog"
//       },
//       {
//         "kind": "element",
//         "name": "image",
//         "fullyQualifiedName": "spec.template.spec.containers.0.image"
//       }
//     ]
//   }
// ]
