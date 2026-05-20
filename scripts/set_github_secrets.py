import argparse
import base64
import json
import os
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from nacl import public, encoding


def github_api_request(token, method, url, data=None):
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'carwash-cli'
    }
    body = None
    if data is not None:
        body = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    req = Request(url, data=body, headers=headers, method=method)
    try:
        with urlopen(req) as resp:
            return resp.read().decode('utf-8')
    except HTTPError as e:
        print(f'GitHub API error {e.code}: {e.read().decode("utf-8")}', file=sys.stderr)
        raise


def get_repo_public_key(token, repo):
    url = f'https://api.github.com/repos/{repo}/actions/secrets/public-key'
    payload = github_api_request(token, 'GET', url)
    return json.loads(payload)


def encrypt_secret(public_key, secret_value):
    key = public.PublicKey(base64.b64decode(public_key), encoder=encoding.RawEncoder())
    sealed_box = public.SealedBox(key)
    encrypted = sealed_box.encrypt(secret_value.encode('utf-8'))
    return base64.b64encode(encrypted).decode('utf-8')


def set_secret(token, repo, name, value, key_id):
    encrypted_value = encrypt_secret(key_id['key'], value)
    url = f'https://api.github.com/repos/{repo}/actions/secrets/{name}'
    data = {
        'encrypted_value': encrypted_value,
        'key_id': key_id['key_id']
    }
    github_api_request(token, 'PUT', url, data)
    print(f'Set secret {name}')


def main():
    parser = argparse.ArgumentParser(description='Set GitHub Actions secrets for a repo')
    parser.add_argument('--repo', required=True, help='owner/repo')
    parser.add_argument('--token', help='GitHub token (or set GITHUB_TOKEN env var)')
    parser.add_argument('--secrets-file', required=True, help='JSON file containing secrets')
    args = parser.parse_args()

    token = args.token or os.environ.get('GITHUB_TOKEN')
    if not token:
        print('GitHub token missing. Provide via --token or GITHUB_TOKEN env var.', file=sys.stderr)
        sys.exit(1)
    with open(args.secrets_file, 'r', encoding='utf-8-sig') as f:
        secrets = json.load(f)
    key_info = get_repo_public_key(token, args.repo)
    key_id = {'key': key_info['key'], 'key_id': key_info['key_id']}
    for name, value in secrets.items():
        if value is None:
            continue
        set_secret(token, args.repo, name, value, key_id)

if __name__ == '__main__':
    main()
