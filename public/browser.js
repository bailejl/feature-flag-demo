
const clientState = {};

const flags = [
  {
    name: 'debug',
    handler: debugHandler,
    getVariant: true
  },
  {
    name: 'subscription',
    handler: subscriptionHandler,
    getVariant: true
  },
  {
    name: 'ab',
    handler: aBHandler,
    getVariant: true
  },
  {
    name: 'date-driven-v3-rollout',
    handler: v3RolloutHandler,
    getVariant: false
  },
  {
    name: 'gradual-v2-rollout',
    handler: v2RolloutHandler,
    getVariant: false
  },
  {
    name: 'perm-maintenance',
    handler: maintenanceHandler,
    getVariant: true
  },
  {
    name: 'perm-kill',
    handler: killHandler,
    getVariant: true
  },
  {
    name: 'perm-banner',
    handler: bannerHandler,
    getVariant: true
  }
];

let debugClientIds = [];

function debug(message, clientId) {
  if (debugClientIds.includes(clientId)) {
    console.debug(`clientId: ${clientId} - ${message}`);
  }
}

function handleClientFeatureFlagsRsp(httpRequest, clientId){
  return function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      debug(httpRequest.status, clientId);
      if (httpRequest.status === 200) {
        const flagData = JSON.parse(httpRequest.responseText);
        const f = flags.find((flag) => flag.name === flagData['flagName']);
        if (f) {
          f.handler(clientId, flagData);
        }
      } else if (httpRequest.status === 409) {
        console.error(`Reloading page!`);
        location.reload();
      } else {
        console.error('There was a problem with the request.');
      }
    }
  }
}

function handleClientRegistrationRsp(httpRequest, clientId) {
  return function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        getLatestClientFlags(clientId);
        clientState[clientId]['intervalId'] = window.setInterval(getLatestClientFlags, 3000, clientId);
      } else {
        console.error('There was a problem with the request.');
      }
    }
  }
}

function getLatestClientFlags(clientId) {
  flags.forEach((flag) => {
    const httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
      console.error('Giving up :( Cannot create an XMLHTTP instance');
      return;
    }
    httpRequest.onreadystatechange = handleClientFeatureFlagsRsp(httpRequest, clientId);
    if (flag.getVariant) {
      httpRequest.open('GET', `/api/v1/client/${clientId}/flags/${flag.name}/variant`);
    } else {
      httpRequest.open('GET', `/api/v1/client/${clientId}/flags/${flag.name}`);
    }
    httpRequest.send();
  });
}

function registerClient(clientId){
  const httpRequest = new XMLHttpRequest();

  if (!httpRequest) {
    console.error('Giving up :( Cannot create an XMLHTTP instance');
    return;
  }
  httpRequest.onreadystatechange = handleClientRegistrationRsp(httpRequest, clientId);
  httpRequest.open('POST', `/api/v1/client/${clientId}/register`);
  httpRequest.send();
}

function loadSquares() {
  const squaresHolder = document.getElementById('client-squares');
  [...Array(20).keys()].forEach((val) => {
    const clientContainer = document.createElement("div");
    const topBar = document.createElement("div");
    const bottomBar = document.createElement("div");
    const clientId = val + 1;
    clientContainer.id = `container-${clientId}`;
    topBar.id = `top-bar-${clientId}`;
    bottomBar.id = `bottom-bar-${clientId}`;
    const textElement = document.createElement("p");
    textElement.id = `text`;
    const textNode = document.createTextNode(`${clientId}`);

    const v2 = document.createElement("img");
    v2.setAttribute('src', '/v1.svg');
    v2.id = `version-img-${clientId}`;
    v2.classList.add('icon');
    topBar.appendChild(v2);

    const sub = document.createElement("div");
    sub.id = `subscription-${clientId}`;
    sub.classList.add('subscription');
    sub.setAttribute('style', 'display: none;');
    topBar.appendChild(sub);

    clientContainer.classList.add('client-container');
    topBar.classList.add('top-bar');
    bottomBar.classList.add('bottom-bar');


    textElement.appendChild(textNode);
    clientContainer.appendChild(topBar);
    clientContainer.appendChild(textElement);
    clientContainer.appendChild(bottomBar);
    squaresHolder.appendChild(clientContainer);
    clientState[clientId] = {
      clientId: clientId,
      clientContainerElement: clientContainer
    };
    registerClient(clientId);
  });
}

loadSquares();

function maintenanceHandler(clientId, flagData){
  if (flagData.enabled && flagData.payload && flagData.payload.value === 'true') {
    document.getElementById(`container-${clientId}`).classList.add('maintenance-mode');
  } else {
    document.getElementById(`container-${clientId}`).classList.remove('maintenance-mode');
  }
}

function killHandler(clientId, flagData){
  if (flagData.enabled && flagData.payload && flagData.payload.value === 'true') {
    document.getElementById(`container-${clientId}`).classList.add('kill-mode');
  } else {
    document.getElementById(`container-${clientId}`).classList.remove('kill-mode');
  }
}

function v2RolloutHandler(clientId, flagData){
  if (flagData.enabled) {
    document.getElementById(`version-img-${clientId}`).setAttribute('src', '/v2.svg');
  }
}

function v3RolloutHandler(clientId, flagData){
  if (flagData.enabled) {
    document.getElementById(`version-img-${clientId}`).setAttribute('src', '/v3.svg');
  }
}

function bannerHandler(clientId, flagData){
  if (flagData.enabled && flagData.payload && flagData.payload.value) {
    const msgObj = JSON.parse(flagData.payload.value);
    document.getElementById(`bottom-bar-${clientId}`).classList.add('show-banner');
    document.getElementById(`bottom-bar-${clientId}`).classList.add(`msg-severity-${msgObj['severity']}`);
    document.getElementById(`bottom-bar-${clientId}`).innerText = msgObj['message'];
  } else {
    document.getElementById(`bottom-bar-${clientId}`).classList.remove('show-banner');
    document.getElementById(`bottom-bar-${clientId}`).classList.remove(`msg-severity-low`, `msg-severity-medium`, `msg-severity-high`);
    document.getElementById(`bottom-bar-${clientId}`).innerText = '';
  }
}

function aBHandler(clientId, flagData){
  if (flagData.enabled && flagData.payload && flagData.payload.value) {
    document.getElementById(`container-${clientId}`).setAttribute('style', flagData.payload.value);
  } else {
    document.getElementById(`container-${clientId}`).style = null;
  }
}

function subscriptionHandler(clientId, flagData){
  if (flagData.enabled && flagData.payload && flagData.payload.value) {
    document.getElementById(`subscription-${clientId}`).innerText = flagData.payload.value;
    document.getElementById(`subscription-${clientId}`).style = null;
    document.getElementById(`subscription-${clientId}`).classList.add(flagData.payload.value.toLowerCase());
  } else {
    document.getElementById(`subscription-${clientId}`).setAttribute('style', 'display: none;');
  }
}

function debugHandler(clientId, flagData){
  if (flagData.enabled && flagData.payload && flagData.payload.value === 'true') {
    if (!debugClientIds.includes(clientId)) {
      debugClientIds.push(clientId);
    }
  } else {
    if (debugClientIds.includes(clientId)) {
      debugClientIds.splice(debugClientIds.indexOf(clientId), 1);
    }
  }
}
