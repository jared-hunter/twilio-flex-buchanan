const { prepareStudioFunction } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);
const requiredParameters = [
  { key: 'language', purpose: 'the language of the line' },
  { key: 'client', purpose: 'the client name' },
  { key: 'FlowSid', purpose: 'the flow calling the twiml function, required to return control to the studio flow' },
];

const options = {
  sayOptions: { voice: 'Polly.Joanna' },
  return_base: 'features/client_admin/studio/dialogs',
  messages: {
    Alcon: {
      eng: 'Thank you for your call to Alcon',
      esp: 'Thank you for your call to Alcon, Spanish',
    },
    Other: {
      eng: 'Thank you for your call to Other',
      esp: 'Thank you for your call to Other, Spanish',
    },
    processingError: {
      eng: 'Unrecognized client, returning to studio',
      esp: 'Unrecognized client, returning to studio spanish',
    },
  },
};

exports.handler = prepareStudioFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  const { language, client, FlowSid } = event;

  const redirectStudio = `https://webhooks.twilio.com/v1/Accounts/${context.ACCOUNT_SID}/Flows/${FlowSid}?FlowEvent=return`;
  const redirectSelectOption = `/${options.return_base}/select_option?menu=entry&language=${language}&FlowSid=${FlowSid}`;

  const twiml = new Twilio.twiml.VoiceResponse();

  switch (client) {
    case 'Other':
      // For this example client we just say a greeting and return to studio
      twiml.say(options.sayOptions, options.messages.Other[language]);
      twiml.redirect(redirectStudio);

      return callback(null, twiml);
    case 'Alcon':
      // For this example client we say a greeting and redirect to another function
      twiml.say(options.sayOptions, options.messages.Alcon[language]);
      twiml.redirect(redirectSelectOption);

      return callback(null, twiml);
    default:
      //  Default case - if we don't recognize the option - we say something and return to studio
      twiml.say(options.sayOptions, options.messages.processingError[language]);
      twiml.redirect(redirectStudio);
      return callback(null, twiml);
  }
});
