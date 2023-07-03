export default {
  plugins: {
    "pod-security-standards": true,
    practices: true,
    "yaml-syntax": true,
    "resource-links": true,
    "kubernetes-schema": true,
  },
  rules: {
    "pod-security-standards/host-ports": "err",
    "pod-security-standards/privilege-escalation": "err",
    "pod-security-standards/running-as-non-root": "err",
    "pod-security-standards/running-as-non-root-user": "err",
    "practices/no-mounted-docker-sock": "err",
    "practices/no-writable-fs": "err",
    "practices/drop-capabilities": "err",
    "practices/no-low-group-id": "err",
    "practices/no-automount-service-account-token": "err",
    "practices/no-pod-create": "err",
    "practices/no-pod-execute": "err",
    "practices/no-no-root-group": "err",
  },
};
