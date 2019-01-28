# SimPerf Dashboard

A meteor dashboard to display visualise the data sent by the Simperf SDK.

## Installation
Run the following commands in your terminal to setup the Dashboard on your machine:
```
git clone https://github.com/biocross/SimPerf-Dashboard.git
cd SimPerf-Dashboard
curl https://install.meteor.com/ | sh
meteor npm install
```

## Start the Server
To just run the server, run the following command in the project directory: 
```
meteor
```

## Add data to the dashboard:

You can add data to the dashboard in using a `POST` request on `http://localhost:3000/methods/addLaunchData` with the body in the following this `JSON` schema:



