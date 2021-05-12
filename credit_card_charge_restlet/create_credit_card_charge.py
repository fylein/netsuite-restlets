import os
import json
from requests_oauthlib import OAuth1Session

# Token Based Authentication Details
account = os.environ.get('ACCOUNT')
consumer_key = os.environ.get('CONSUMER_KEY')
consumer_secret = os.environ.get('CONSUMER_SECRET')
token_key = os.environ.get('TOKEN_KEY')
token_secret = os.environ.get('TOKEN_SECRET')

# RESTlet Details
script_id = os.environ.get('RESTLET_SCRIPT_ID')
deployment_id = os.environ.get('RESTLET_DEPLOYMENT_ID')

url = f"https://{account.lower()}.restlets.api.netsuite.com/app/site/hosting/restlet.nl?" \
      f"script={script_id}&deploy={deployment_id}"

oauth = OAuth1Session(
    client_key=consumer_key,
    client_secret=consumer_secret,
    resource_owner_key=token_key,
    resource_owner_secret=token_secret,
    realm=account,
    signature_method='HMAC-SHA256'
)

payload = {
    'externalId': 'test-payload-7',
    'tranDate': '5/10/2021',
    'account': {
        'internalId': 129
    },
    'entity': {
        'internalId': 3
    },
    'currency': {
        'internalId': 1
    },
    'subsidiary': {
        'internalId': 1
    },
    'location': {
        'internalId': 1
    },
    'memo': 'Transaction created through RESTlet',
    'expenses': [
        {
            'account': 82,
            'amount': 2025.09,
            'memo': 'This is payload test',
            'department': {
                'internalId': 1
            },
            'class': {
                'internalId': 1
            },
            'location': {
                'internalId': 1
            },
            'customer': {
                'internalId': 1397
            },
            'isBillable': False,
            "customFieldList": [
                {
                    "scriptId": "custcolfyle_receipt_link",
                    "value": "https://www.google.com"
                },
                {
                    "scriptId": "custcolfyle_expense_url",
                    "value": "https://www.gmail.com"
                },
                {
                    "scriptId": "custcol780",
                    "value": 3
                },
                {
                    'scriptId': 'custcol785',
                    'value': 1
                }
            ]
        },
        {
            'account': 82,
            'amount': 35.11,
            'memo': 'Second Lineitem',
            'department': {
                'internalId': 1
            },
            'class': {
                'internalId': 1
            },
            'location': {
                'internalId': 1
            },
            'customer': {
                'internalId': 1612
            },
            'isBillable': False,
            "customFieldList": [
                {
                    "scriptId": "custcolfyle_receipt_link",
                    "value": "https://www.google.com"
                },
                {
                    "scriptId": "custcolfyle_expense_url",
                    "value": "https://www.gmail.com"
                },
                {
                    "scriptId": "custcol780",
                    "value": 1
                },
                {
                    'scriptId': 'custcol785',
                    'value': 2
                }
            ]
        }
    ]
}

resp = oauth.post(url, headers={'Content-Type': 'application/json'}, data=json.dumps(payload))

print(json.loads(resp.text))
