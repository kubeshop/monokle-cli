#!/bin/sh

# If a validation configuration file is provided, copy it to the current directory
if [ ! -z "$CONFIG_FILE" ]; then
    cp /input/$CONFIG_FILE ./monokle.validation.yaml
fi

# Run the Monokle CLI with all provided arguments
monokle "$@"
