$secureToken = Read-Host 'Paste GitHub PAT with repo permissions (input hidden)' -AsSecureString
$ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
try {
    $token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
    if (-not $token) {
        Write-Error 'No token entered.'
        exit 1
    }
    $env:GITHUB_TOKEN = $token
    python .\scripts\set_github_secrets.py --repo jeffdoesinfo-source/Carwashapp --secrets-file .\scripts\github_secrets.json
} finally {
    if ($ptr -ne [IntPtr]::Zero) {
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}
