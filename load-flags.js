const fs = require('fs');
const path = require('path');
const rpn = require('request-promise-native');

const httpHost = 'http://localhost:4242';
const flagFileDirPath = path.join(__dirname, 'db-setup-files');
const files = fs.readdirSync(flagFileDirPath);

const cookieJar = rpn.jar();

async function loadFile() {
  console.log('Logging in');
  const loginOptions = {
    method: 'POST',
    uri: `${httpHost}/api/admin/login`,
    body: {email: "test@test.com"},
    json: true,
    jar: cookieJar
  };
  await rpn.post(loginOptions);
  console.log('Logged in');

  for (const fileName of files) {
    console.log(`Loading file: ${fileName}`);
    const flagJson = fs.readFileSync(path.join(flagFileDirPath, fileName));
    const flagData = JSON.parse(flagJson.toString());

    const getOptions = {
      method: 'GET',
      uri: `${httpHost}/api/admin/features/${flagData['name']}`,
      body: flagData,
      json: true,
      jar: cookieJar
    };
    console.log(`Checking for flag: ${fileName}`);
    const result = await rpn(getOptions).catch(function(reason) {
      if (reason && reason.statusCode !== 400) console.log(`reason: ${reason}`)
    });

    if (result) {
      const postOptions = {
        method: 'PUT',
        uri: `${httpHost}/api/admin/features/${flagData['name']}`,
        body: flagData,
        json: true,
        jar: cookieJar
      };
      console.log(`Updating flag: ${fileName}`);
      await rpn(postOptions);

    } else {
      const postOptions = {
        method: 'POST',
        uri: `${httpHost}/api/admin/features/`,
        body: flagData,
        json: true,
        jar: cookieJar
      };
      console.log(`Creating flag: ${fileName}`);
      await rpn(postOptions);
    }
  }
}

loadFile()
  .catch((err) => {
    console.error(err);
  });