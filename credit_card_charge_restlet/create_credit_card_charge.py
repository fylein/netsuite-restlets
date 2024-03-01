import os
import json
from requests_oauthlib import OAuth1Session

# Token Based Authentication Details
account = "TSTDRV2089588"
consumer_key = "2b23f95f44777eeab873c06adbc1c672efd5ee86a626c3c926f8eeec3463e1ab"
consumer_secret = "9a5c059b60a82c3119a38bba140b980f8cf19ea2134b5c4b60a88b25120f8912"
token_key = "8c869cf39844a15f38a73d374d1fb0aa28e9ff39618b660498f9dbcb835808f5"
token_secret = "0ae3c188a4894633a2ee4eacf226ec42f6c5f48ccb2f3469ce5895d06b7c3114"

# RESTlet Details
script_id = "customscript_cc_charge_fyle"
deployment_id = "customdeploy_cc_charge_fyle"

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
    'externalId': 'test-payload-1839',
    'tranDate': '5/10/2021',
    'account': {
        'internalId': 213
    },
    'entity': {
        'internalId': 7588
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
    'memo': 'Transaction created through RESTlet 2022',
    'expenses': [
        {
            'account': {
                'internalId': 82
            },
            'amount': 2025.09,
            'memo': 'This is payload test',
            'tranid': 'E/2021/12/R/11',
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
                'internalId': None
            },
            'isBillable': False,
            "customFieldList": [
               
            ]
        },
        {
            'account': {
                'internalId': 82
            },
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
                'internalId': None
            },
            'isBillable': False,
            "customFieldList": [
               
            ]
        }
    ]
}

resp = oauth.post(url, headers={'Content-Type': 'application/json'}, data=json.dumps(payload))

print(resp.status_code)
print(json.loads(resp.text))
