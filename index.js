const axios = require('axios').default;
const player = require('play-sound')(opts = {});

const personalData = {
  email: "",
  phone: "",
  vNumber: "",
  bsn: "",
  firstName: "",
  lastName: ""
};

function getData() {
  const indBaseUrl = 'https://oap.ind.nl/oap/api/desks/AM/slots/';
  const indParams = {
    productKey: 'DOC',
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
  return slot && `${slot.date} ${slot.startTime}-${slot.endTime} for ${slot.parts} person.`;
}

function now() {
  return (new Date()).toTimeString();
}

function reserveSlot(slot) {
  const reservationUrl = 'https://oap.ind.nl/oap/api/desks/AM/appointments/';
  slot.booked = false;
  axios.post('https://oap.ind.nl/oap/api/desks/AM/slots/' + slot.key, slot)
    .then((response) => {
      console.log(response.data)
      if(JSON.parse(response.data.split(`}',`)[1]).status==="OK"){
        axios.post(reservationUrl,
        {
          bookableSlot: slot,
          appointment: {
            productKey: "DOC",
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            email: personalData.email,
            phone: personalData.phone,
            language: "en",
            customers: [
              {
                "vNumber": personalData.vNumber,
                "bsn": personalData.bsn,
                "firstName": personalData.firstName,
                "lastName": personalData.lastName
              }
            ]
          }
        }).then((response) => {
          console.log(response.data);
          process.exit(0);
        }
        ).catch((error) => {
          console.log(error);
          return null;
        });
      }
    })

}


async function checkaAvailability() {
  const deadlineStart = '2022-09-20';
  const deadlineEnd = '2022-10-02';
  const slots = await getData();

  if (!slots[0]) {
    console.log('Not available.', now());
    return false;
  }

  if (slots[0].date > deadlineStart && slots[0].date < deadlineEnd) {
    sendNotification();
    reserveSlot(slots[0]);
    console.log(formatSlot(slots[0]), 'Go to IND => https://oap.ind.nl/oap/en/#/doc', now());
  } else {
    console.log('Earliest slot is later than deadline :(', formatSlot(slots[0]), now());
  }
};

setInterval(checkaAvailability, 1500);
