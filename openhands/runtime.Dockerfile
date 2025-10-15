FROM docker.io/pulkith2loop/runtime:dev-2

COPY openhands /openhands/code/openhands

COPY openhands/runtime/plugins/vscode/extensions/ /openhands/.openvscode-server/extensions/
