import os from "os";
import nodeMachineId from "node-machine-id";
import { VERSION } from "../version.js";

const CLIENT_NAME = 'Monokle CLI';

export function getClientConfig() {
	return {
		name: CLIENT_NAME,
		version: VERSION,
		os: `${os.type()} ${os.release()}`,
		additionalData: {
			machineId: nodeMachineId.machineIdSync(),
		}
	};
}
