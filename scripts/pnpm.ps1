# A project-local launcher. Uses an installed pnpm, or this workstation's bundled runtime.
# Does not change PATH, install global software, or relax PowerShell execution policy.
$ErrorActionPreference = 'Stop'
$timempathyRoot = Split-Path -Parent $PSScriptRoot
$timempathyPnpm = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
Push-Location -LiteralPath $timempathyRoot
try {
    if ($timempathyPnpm) {
        & $timempathyPnpm.Source @args
    } else {
        $timempathyBundledPnpm = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\pnpm\bin\pnpm.cjs'
        if (-not (Test-Path -LiteralPath $timempathyBundledPnpm)) {
            throw 'Install Node.js >=22.12 and pnpm 11.19.0, then run pnpm install.'
        }
        & node $timempathyBundledPnpm @args
    }
    $timempathyExitCode = $LASTEXITCODE
} finally {
    Pop-Location
}
exit $timempathyExitCode
