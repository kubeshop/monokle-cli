import normalizeUrl from 'normalize-url';

type UserProjectRepo = {
  id: string;
  projectId: number;
  provider: string;
  owner: string;
  name: string;
  prChecks: boolean;
  canEnablePrChecks: boolean;
};

type UserProject = {
  id: number;
  slug: string;
  name: string;
  repositories: UserProjectRepo[];
};

type UserData = {
  data: {
    me: {
      projects: [
        {
          project: UserProject
        }
      ]
    }
  }
};

type PolicyData = {
  data: {
    getProject: {
      id: number;
      policy: {
        id: string;
        json: any;
      }
    }
  }
};

type AccessData = {
  email: string;
  accessToken: string;
};

const getUserQuery = `
  query getUser {
    me {
      projects {
        project {
          id
          slug
          name
          repositories {
            id
            projectId
            provider
            owner
            name
            prChecks
            canEnablePrChecks
          }
        }
      }
    }
  }
`;

const getPolicyQuery = `
  query getPolicy($slug: String!) {
    getProject(input: { slug: $slug }) {
      id
      policy {
        id
        json
      }
    }
  }
`;

export const REMOTE_POLICY_URL_DEFAULT = 'https://api.monokle.com'

export async function getDeviceCode(remotePolicyUrl?: string): Promise<string | undefined> {
  return 'F00-B4R'; // Mock code for now, till API is ready.
  // return queryApi(...); query for device code
}

export async function getUser(accessToken: string, remotePolicyUrl?: string): Promise<UserData | undefined> {
  return queryApi(getUserQuery, accessToken, remotePolicyUrl);
}

export async function getPolicy(slug: string, accessToken: string, remotePolicyUrl?: string): Promise<PolicyData | undefined> {
  return queryApi(getPolicyQuery, accessToken, { slug }, remotePolicyUrl);
}

export async function waitForToken(deviceCode: string, intervalMs = 500, timeoutMs = 60 * 1000): Promise<AccessData> {
  return new Promise((res, rej) => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timer;
    let requestPending = false;

    timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      rej(new Error('Timeout waiting for token.'));
    }, timeoutMs);

    intervalId = setInterval(async () => {
      if (requestPending) {
        return;
      }

      requestPending = true;

      try {
        // Mock for now, till API is ready.
        const accessData = {
          email: process.env.MONOKLE_CLI_USER_EMAIL ?? 'sampleuser@kubeshop.io',
          accessToken: process.env.MONOKLE_CLI_ACCESS_TOKEN ?? 'SAMPLE_ACCESS_TOKEN_F00-B4R',
        };

        // const accessToken = queryApi(...); // query for access token
        if (accessData) {
          clearTimeout(timeoutId);
          clearInterval(intervalId);
          res(accessData);
        }
      } catch (err) {
        rej(err);
      } finally {
        requestPending = false;
      }
    }, intervalMs);
  });
}

async function queryApi(query: string, token: string, variables = {}, remotePolicyUrl?: string) {
  const apiUrl = remotePolicyUrl ?? REMOTE_POLICY_URL_DEFAULT;

  if (!apiUrl) {
    // Log error as this should not happen, we only should use this helper when remote policy is enabled.
    // logger.error('Trying to use \'queryApi\' despite remote policy not being configured.');
    return undefined;
  }

  const apiEndpointUrl = normalizeUrl(`${apiUrl}/graphql`);

  // logger.log('apiEndpointUrl', apiEndpointUrl);

  try {
    const response = await fetch(apiEndpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query,
        variables,
      })
    });

    // logger.log('response', response.status, response.statusText);

    if (!response.ok) {
      // raiseError(
      //   `Connection error. Cannot fetch data from ${apiEndpointUrl}. Error '${response.statusText}' (${response.status}).`
      // );
      return undefined;
    }

    return response.json();
  } catch (err) {
    // raiseError(
    //   `Connection error. Cannot fetch data from ${apiEndpointUrl}. Error '${err.message}.`
    // );
    return undefined;
  }
}
