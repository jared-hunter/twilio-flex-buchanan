const VoiceOperations = require(Runtime.getFunctions()['common/twilio-wrappers/programmable-voice'].path);
const { prepareStudioFunction } = require(Runtime.getFunctions()['common/helpers/function-helper'].path);
const requiredParameters = [
  { key: 'language', purpose: 'the language of the line' },
  { key: 'menu', purpose: 'the menu option' },
  { key: 'FlowSid', purpose: 'the flow calling the twiml function, required to return control to the studio flow' },
];

const options = {
  sayOptions: { voice: 'Polly.Joanna' },
  return_base: 'features/client_admin/studio/dialogs',
  messages: {
    entry: {
      eng: 'Please press 1 or 2',
      esp: 'Please press 1 or 2, Spanish',
    },
    option_01: {
      eng: 'You Selected One, Sending Back To Studio',
      esp: 'You Selected One, Sending Back To Studio, Spanish',
    },
    option_02: {
      eng: 'You Selected Two, Sending Back To Studio',
      esp: 'You Selected Two, Sending Back To Studio, Spanish',
    },
    timeout: {
      eng: 'You timed out, returning you to studio',
      esp: 'You timed out, returning you to studio Spanish',
    },
    processingError: {
      eng: 'Unrecognized menu selection, Sending Back To Studio',
      esp: 'Unrecognized menu selection, Sending Back To Studio, Spanish',
    },
  },
};

exports.handler = prepareStudioFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  const { language, menu, Digits, FlowSid } = event;

  const twiml = new Twilio.twiml.VoiceResponse();
  const redirectStudio = `https://webhooks.twilio.com/v1/Accounts/${context.ACCOUNT_SID}/Flows/${FlowSid}?FlowEvent=return`;
  const redirectSelectOption = `/${options.return_base}/select_option?menu=option_selected&language=${language}&FlowSid=${FlowSid}`;

  switch (menu) {
    case 'entry':
      // For first entry pont to the function (hard coded from previous menu)
      // we prompt for 1 or 2 and redirect back to this function with a different
      // menu option
      //
      // you can see more details on gathers here
      // https://www.twilio.com/docs/voice/twiml/gather
      const gather = twiml.gather({
        action: redirectSelectOption,
        method: 'GET',
        input: 'dtmf',
        timeout: 10,
        numDigits: 1,
      });

      gather.say(options.sayOptions, options.messages.entry[language]);

      // the processor only executes the next twiml instructions if the gather
      // does not detect anything.
      twiml.say(options.sayOptions, options.messages.timeout[language]);
      twiml.redirect(redirectStudio);
      return callback(null, twiml);

    case 'option_selected':
      // When we return the Digits parameter is populated with
      // what the user selected and we can make a decision from that
      // if you detect speech, there is a different parameter for the
      // detected speech.
      if (Digits === '1') twiml.say(options.sayOptions, options.messages.option_01[language]);
      else twiml.say(options.sayOptions, options.messages.option_02[language]);

      twiml.redirect(redirectStudio);
      return callback(null, twiml);

    default:
      //  Default case - if we don't recognize the option
      twiml.say(options.sayOptions, options.messages.processingError[language]);

      twiml.redirect(redirectStudio);
      return callback(null, twiml);
  }
});
