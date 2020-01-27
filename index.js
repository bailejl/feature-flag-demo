const express = require('express');
const app = express();
const port = 3000;
const { initialize } = require('unleash-client');

const clientFlags = {};
const appName = 'feature-flag-demo';

app.use(express.static('public'));

function getInstanceId(clientId) {
  return `feature-flags-${clientId}`;
}

app.post('/api/v1/client/:clientId/register', (req, res) => {
  const clientId = req.params['clientId'];
  const instanceId = getInstanceId(clientId);
  if (clientId && !clientFlags[instanceId]) {
    const instance = initialize({
      url: 'http://localhost:4242/api/',
      appName: appName,
      instanceId: instanceId,
      refreshInterval: 15000
    });

    // optional events
    instance.on('error', console.error);
    instance.on('warn', console.warn);
    instance.on('ready', console.log);

    // metrics hooks
    instance.on('registered', clientData => console.log(`${clientId} registered`, clientData));
    instance.on('sent', payload => console.log(`${clientId} metrics bucket/payload sent`, payload));
    instance.on('count', (name, enabled) => console.log(`${clientId} isEnabled(${name}) returned ${enabled}`));
    clientFlags[instanceId] = instance;
    res.sendStatus(200);
  } else if (!clientId) {
    res.sendStatus(400);
  } else if (!clientFlags[instanceId]) {
    res.sendStatus(409);
  }
});

app.get('/api/v1/client/:clientId/flags', (req, res) => {
  const clientId = req.params['clientId'];
  const instanceId = getInstanceId(clientId);
  if (clientId && clientFlags[instanceId]) {
    res.json(clientFlags[instanceId].getFeatureToggleDefinitions());
  } else if (!clientId) {
    res.sendStatus(400);
  } else if (!clientFlags[instanceId]) {
    res.sendStatus(409);
  }
});

app.get('/api/v1/client/:clientId/flags/:flagName', (req, res) => {
  const clientId = req.params['clientId'];
  const flagName = req.params['flagName'];
  const instanceId = getInstanceId(clientId);
  if (clientId && clientFlags[instanceId]) {
    const { enabled, name, payload } = clientFlags[instanceId].getVariant(flagName, { userId: `user-${clientId}` });
    res.json({flagName: flagName, enabled: enabled, variantName: name, payload: payload});
  } else if (!clientId) {
    res.sendStatus(400);
  } else if (!clientFlags[instanceId]) {
    res.sendStatus(409);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));


