
const clientState = {};

const flagNames = [
  'maintenance'
];

function handleClientFeatureFlagsRsp(httpRequest, clientId){
  return function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        console.log(httpRequest.responseText);
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
        clientState[clientId]['intervalId'] = window.setInterval(getLatestClientFlags, 15000, clientId);
      } else {
        console.error('There was a problem with the request.');
      }
    }
  }
}

function getLatestClientFlags(clientId) {
  flagNames.forEach((flagName) => {
    const httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
      console.error('Giving up :( Cannot create an XMLHTTP instance');
      return;
    }
    httpRequest.onreadystatechange = handleClientFeatureFlagsRsp(httpRequest, clientId);
    httpRequest.open('GET', `/api/v1/client/${clientId}/flags/${flagName}`);
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
    const clientId = val + 1;
    const textElement = document.createElement("p");
    const textNode = document.createTextNode(`${clientId}`);

    clientContainer.classList.add('client-container');
    textElement.appendChild(textNode);
    clientContainer.appendChild(textElement);
    squaresHolder.appendChild(clientContainer);
    clientState[clientId] = {
      clientId: clientId,
      clientContainerElement: clientContainer
    };
    registerClient(clientId);
  });
}

loadSquares();