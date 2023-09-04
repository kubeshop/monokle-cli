import { createDefaultMonokleAuthenticator, Authenticator} from "@monokle/synchronizer";

// This class exists for test purposes to easily mock the authenticator.
// It also ensures singleton instance of the authenticator is used.
class AuthenticatorGetter {
  private _authenticator: Authenticator;

  constructor() {
    this._authenticator = createDefaultMonokleAuthenticator();
  }

  get authenticator() {
    return this._authenticator;
  }
}

export const authenticatorGetter = new AuthenticatorGetter();
