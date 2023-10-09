import {print} from "./utils/screens.js";
import {authenticatorGetter} from "./utils/authenticator.js";

export abstract class ExtendableError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = new.target.name;
    }
}

export class Unauthenticated extends ExtendableError {}
export class AlreadyAuthenticated extends ExtendableError {}

export function handleFailure(err: unknown, debug: boolean) {
    if (!(err instanceof Error)) {
        return;
    }

    displayError(err);

    if (debug) {
        console.log();
        console.error(err)
    }

    process.exit(1)
}

export function displayError(err: Error) {
    switch (err.name) {
        case Unauthenticated.name: {
            print("To get started with Monokle, please run: monokle login")
            return;
        }
        case AlreadyAuthenticated.name: {
            const authenticator = authenticatorGetter.authenticator;
            print(`You are already authenticated as ${authenticator.user.email!}.`)
            return;
        }
        default: {
            print("Something unexpected happened, you can run with --debug for more details");
            return;
        }
    }
}