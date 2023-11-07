import {failure, print, warningInfo} from "./utils/screens.js";
import {authenticatorGetter} from "./utils/authenticator.js";

export abstract class ExtendableError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = new.target.name;
    }
}

export class Unauthenticated extends ExtendableError {}
export class AlreadyAuthenticated extends ExtendableError {}
export class InvalidArgument extends ExtendableError {}
export class NotFound extends ExtendableError {
    constructor(object: string, identifier: string | undefined, public level: "error" | "warning" = "error") {
        super(identifier ? `No such ${object}, received '${identifier}'` : `No ${object} found`);
    }
}
export class FailedPrecondition extends ExtendableError {}
export class ValidationFailed extends ExtendableError {}

export function handleFailure(err: unknown, debug: boolean, commandName?: string) {
    if (!(err instanceof Error)) {
        return;
    }

    displayError(err, commandName);

    if (debug) {
        console.log();
        console.error(err)
    }

    process.exit(1)
}

export function displayError(err: Error, commandName?: string) {
    switch (err.name) {
        case Unauthenticated.name: {
            print("To get started with Monokle, please run: monokle login")
            return;
        }
        case AlreadyAuthenticated.name: {
            const authenticator = authenticatorGetter.authenticator;
            print(warningInfo(`You are already authenticated as ${authenticator.user.email!}.`))
            return;
        }
        case InvalidArgument.name: {
            print(failure(err.message));
            return;
        }
        case FailedPrecondition.name: {
            print(failure(err.message, "precondition"));
            return;
        }
        case NotFound.name: {
            const level = err instanceof NotFound ? err.level : "error";
            if (level === "error") {
                print(failure(err.message));
            } else {
                print(warningInfo(err.message));
            }
            return;
        }
        case ValidationFailed.name: {
            return; // We just want to exit with process.exit(1)
        }
        default: {
            print(getFriendlyErrorMessage(err, commandName) ?? "Something unexpected happened, you can run with --debug for more details");
            return;
        }
    }
}

function getFriendlyErrorMessage(err: Error, commandName?: string): string | undefined {
    const errMsg = err.message.toLowerCase().trim();

    if (errMsg.startsWith('not found') && (commandName === "validate" || commandName === "config")) {
        return "Error communicating with Monokle Cloud. Seems like used project id may be invalid, please make sure it's correct.";
    }

    return undefined;
}
