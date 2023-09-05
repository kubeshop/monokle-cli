export default {
  plugins: {
    "pod-security-standards": true,
    "yaml-syntax": true,
    "resource-links": true,
    "kubernetes-schema": true,
  },
  rules: {
    "pod-security-standards/host-process": "err",
    "pod-security-standards/host-namespaces": "err",
    "pod-security-standards/privileged-containers": "err",
    "pod-security-standards/capabilities": "err",
    "pod-security-standards/host-path-volumes": "err",
    "pod-security-standards/host-ports": "err",
    "pod-security-standards/app-armor": "err",
    "pod-security-standards/selinux": "err",
    "pod-security-standards/proc-mount": "err",
    "pod-security-standards/seccomp": "err",
    "pod-security-standards/sysctls": "err",
    "pod-security-standards/volume-types": "warn",
    "pod-security-standards/privilege-escalation": "warn",
    "pod-security-standards/running-as-non-root": "warn",
    "pod-security-standards/running-as-non-root-user": "warn",
    "pod-security-standards/seccomp-strict": "warn",
    "pod-security-standards/capabilities-strict": "warn",
  },
  settings: {
    "kubernetes-schema": {
      schemaVersion: "v1.26.8",
    },
  },
};
