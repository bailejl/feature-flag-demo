
const clientState = {};

const flags = [
  {
    name: 'perm-maintenance',
    handler: maintenanceHandler
  },
  {
    name: 'perm-kill',
    handler: killHandler
  },
  {
    name: 'perm-banner',
    handler: bannerHandler
  }
];

function handleClientFeatureFlagsRsp(httpRequest, clientId){
  return function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        const flagData = JSON.parse(httpRequest.responseText);
        const f = flags.find((flag) => flag.name === flagData['flagName']);
        if (f) {
          f.handler(clientId, flagData);
        }
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
    httpRequest.open('GET', `/api/v1/client/${clientId}/flags/${flag.name}`);
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
  console.log(`${clientId}: ${JSON.stringify(flagData)}`);
  if (flagData.enabled && flagData.payload && flagData.payload.value === 'true') {
    document.getElementById(`container-${clientId}`).classList.add('kill-mode');
  } else {
    document.getElementById(`container-${clientId}`).classList.remove('kill-mode');
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