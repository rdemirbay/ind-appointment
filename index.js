const axios = require('axios').default;
const player = require('play-sound')(opts = {});

function getData() {
  const indBaseUrl = 'https://oap.ind.nl/oap/api/desks/AM/slots/';
  const indParams = {
    productKey: 'VAA', // TKV
    persons: 1,
  };

  return axios.get(indBaseUrl, {
    params: indParams,
  }).then((response) => (
    JSON.parse(response.data.split(`}',`)[1]).data
  )).catch((error) => {
    console.log(error);
    return null;
  });
}

function sendNotification() {
  player.play('./mixkit-arcade-magic-notification-2342.wav');
}

function formatSlot(slot) {
  return slot &&  `${slot.date} ${slot.startTime}-${slot.endTime} for ${slot.parts} person.`;
}

async function checkaAvailability() {
  const dateline = '2022-09-21';
  const slots = await getData();

  if (!slots[0]) {
    console.log('Not available.');
    return false;
  }

  if (slots[0].date <= dateline) {
    sendNotification();
    console.log(formatSlot(slots[0]), 'Go to IND => https://oap.ind.nl/oap/en/#/doc');
  } else {
    console.log('Earliest slot is later than deadline :(', formatSlot(slots[0]));
  }
};

setInterval(checkaAvailability, 3000);
