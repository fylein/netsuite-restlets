# NetSuite RestLets
NetSuite Suite Script examples along with a python script to run them

### List of Restlets -
* Create Credit Card Charge

### How to run -
* Go to the folder `credit_card_charge_restlet`

  ```bash
  cd credit_card_charge_restlet
  ````
* Make a copy of the `setup_template.sh` file
  
  ```bash
  cp setup_template.sh setup.sh
  ```

* Add correct values in the setup.sh file for the environment variables
  
  ```bash
  #!/bin/bash

  # NetSuite Token Based Access Credentials
  export ACCOUNT='NETSUITE ACCOUNT ID'
  export CONSUMER_KEY='NETSUITE CONSUMER KEY'
  export CONSUMER_SECRET='NETSUITE CONSUMER SECRET'
  export TOKEN_KEY='NETSUITE TOKEN KEY'
  export TOKEN_SECRET='NETSUITE TOKEN SECRET'

  # RESTlet Details
  export RESTLET_SCRIPT_ID='NETSUITE RESTLET SCRIPT ID'
  export RESTLET_DEPLOYMENT_ID='NETSUITE RESTLET DEPLOY ID'
  ```

* Install python requirements
  
  ```bash
  pip install -r requirements.txt
  ```

* Run the python script to access deployed Restlet

  ```bash
   source setup.sh && python create_credit_card_charge.py
  ```
