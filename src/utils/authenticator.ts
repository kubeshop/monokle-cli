import { createMonokleAuthenticatorFromOrigin, Authenticator } from "@monokle/synchronizer";
import { settings } from "./settings.js";

const AUTHENTICATOR_CLIENT_ID = 'mc-cli';

// This class exists for test purposes to easily mock the authenticator.
// It also ensures singleton instance of the authenticator is used.
class AuthenticatorGetter {
  private _authenticator: Authenticator | undefined = undefined;

  get authenticator(): Authenticator | undefined {
    return this._authenticator;
  }

  async getInstance(): Promise<Authenticator> {
    // Lazy create synchronizer so initial configuration (like origin) can be set by other parts of the code.
    if (!this._authenticator) {
      const origin = settings.origin;

      try {
        this._authenticator = await createMonokleAuthenticatorFromOrigin(AUTHENTICATOR_CLIENT_ID, origin || undefined);
      } catch (err) {
        // If we can't use given origin, it doesn't make sense to continue.
        throw err;
      }
    }

    return this._authenticator;
  }
}

export const authenticatorGetter = new AuthenticatorGetter();
