{
# qwen/qwen3-coder-30b - 4bit, custom max context
# llxprt-code commit: 43b97dbf452a24073617011b326622aa74ad1625
# https://codelabs.developers.google.com/gemini-cli-hands-on#10
  description = "Development environment for llxpert";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      supportedSystems = [ "aarch64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
      nixpkgsFor = forAllSystems (system: nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = nixpkgsFor.${system};
          llxpert-script = pkgs.writeShellScriptBin "llxpert-local" ''
            #!/bin/sh
            node /Users/$(whoami)/repos/llxprt-code/packages/cli \
              --include-directories ~/repos/mac-setup \
              --include-directories ~/repos/mac-setup/llxpert-experiment \
              --include-directories ~/repos/llxprt-code \
              "$@"
          '';
        in
        {
          default = pkgs.mkShellNoCC {
            packages = [
              pkgs.direnv
              pkgs.nodejs_22
              llxpert-script
              pkgs.zsh
            ];
            shellHook = ''
              if [ -z "$IN_NIX_SHELL_ZSH" ]; then
                export IN_NIX_SHELL_ZSH=1
                export SHELL=${pkgs.zsh}/bin/zsh
                echo "Switching to zsh..."
                exec $SHELL
              fi
              echo "The 'llxpert-local' command is now available."
            '';
          };
        });
    };
}
