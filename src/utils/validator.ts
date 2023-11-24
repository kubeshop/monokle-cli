import { ResourceParser, MonokleValidator, RemotePluginLoader, requireFromStringCustomPluginLoader, SchemaLoader, AnnotationSuppressor, FingerprintSuppressor, DisabledFixer } from "@monokle/validation";
import { fetchOriginConfig } from "@monokle/synchronizer";
import { settings } from "./settings.js";

// This class exists for test purposes to easily mock the validator.
// It also ensures singleton instance of the synchronizer is used.
class ValidatorGetter {
  private _validator: MonokleValidator | undefined = undefined;

  async getInstance(): Promise<MonokleValidator> {
    // Lazy create Validator so initial configuration (like origin) can be set by other parts of the code.
    if (!this._validator) {
      const origin = settings.origin;

      try {
        const originConfig = await fetchOriginConfig(origin);
        this._validator = new MonokleValidator(
            {
              loader: new RemotePluginLoader(requireFromStringCustomPluginLoader),
              parser: new ResourceParser(),
              schemaLoader: new SchemaLoader(originConfig.schemasOrigin || undefined),
              suppressors: [new AnnotationSuppressor(), new FingerprintSuppressor()],
              fixer: new DisabledFixer(),
            },
            {
              plugins: {
                'kubernetes-schema': true,
                'yaml-syntax': true,
                'pod-security-standards': true,
                'resource-links': true,
              },
            }
          );
      } catch (err) {
        // If we can't use given origin, it doesn't make sense to continue.
        throw err;
      }
    }

    return this._validator;
  }
}

export const validatorGetter = new ValidatorGetter();
