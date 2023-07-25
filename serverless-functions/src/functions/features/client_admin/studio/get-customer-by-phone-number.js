const { prepareStudioFunction } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);

const requiredParameters = [
  { key: 'phoneNumber', purpose: 'the number of the inbound call used to lookup the client' },
];

exports.handler = prepareStudioFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    const { phoneNumber } = event;

    // schedules: "6-15, Mon-Fri, CST", "7-16, Mon-Fri, CST"

    const database = {
      '+18442832394': {
        client_name: 'Alcon',
        itsm: 'Service Now',
        channel: 'voice', // need to confirm how to lookup clients uniquely for chat
        language: 'eng',
        priority: '50',
        schedule: '6-15, Mon-Fri, CST',
      },
    };

    const result = {};

    try {
      result.result = database[phoneNumber];
      result.status = 'success';
    } catch (error) {
      result.status = 'not found';
    }

    response.setBody(result);
    return callback(null, response);
  } catch (error) {
    return handleError(error);
  }
});
