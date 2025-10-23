{
  description = "My awesome repository";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      # List of systems to support
      supportedSystems = [ "aarch64-darwin" ];
      # below probably work, but untested
      # supportedSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];

      # Helper function to generate outputs for each system
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;

      # Per-system outputs
      nixpkgsFor = forAllSystems (system: nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = nixpkgsFor.${system};
          # Create a script for the gemini command
          gemini-script = pkgs.writeShellScriptBin "gemini" ''
            #!/bin/sh
            # Pass all arguments to the npx command
            npx @google/gemini-cli@0.9.0 "$@"
          '';
          llxpert-q3c-script = pkgs.writeShellScriptBin "llxpert-q3c" ''
            #!/bin/sh
            # alias llxpert='npx "@vybestack/llxprt-code@0.4.4" --provider openai --baseurl http://localhost:1234/v1/ --model "qwen3-coder-30b-a3b-instruct-mlx@8bit"'
            node ~/repos/llxprt-code/packages/cli --provider openai --baseurl http://localhost:1234/v1/ --model "qwen3-coder-30b-a3b-instruct-mlx@8bit"
            # Pass all arguments to the npx command
          '';
          llxpert-glm4-script = pkgs.writeShellScriptBin "llxpert-glm4" ''
            #!/bin/sh
            # alias llxpert='npx "@vybestack/llxprt-code@0.4.4" --provider openai --baseurl http://localhost:1234/v1/ --model "glm-4-32b-0414"'
            node ~/repos/llxprt-code/packages/cli --provider openai --baseurl http://localhost:1234/v1/ --model "glm-4-32b-0414"
            # Pass all arguments to the npx command
          '';
        in
        {
          default = pkgs.mkShellNoCC {
            buildInputs = [
              # cocoapods
              gemini-script
              llxpert-glm4-script
              llxpert-q3c-script
              pkgs.nodejs_22
              pkgs.zsh
            ];
            shellHook = ''
              echo "The 'gemini' command is available in your shell."
              echo "The 'llxpert-glm4' command is available in your shell."
              echo "The 'llxpert-q3c' command is available in your shell."
            '';
          };
        });
    };
}