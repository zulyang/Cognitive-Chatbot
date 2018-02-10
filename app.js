/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework.
-----------------------------------------------------------------------------*/
var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var locationDialog = require('botbuilder-location');
 var url = require('url');
 var validUrl = require('valid-url');
 var captionService = require('./caption-service');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot.
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

/*var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);*/

// Create your bot with a function to receive messages from the user

var inMemoryStorage = new builder.MemoryBotStorage();

var bot = new builder.UniversalBot(connector, [
    //Step 1: Determine Emergency Type (Police/Fire&Rescue)

    function (session) {
        session.send("Welcome to the HomeTeam Joint Emergency Response Bot.");
        builder.Prompts.choice(session, "What is the nature of your Emergency?", "Police|Fire & Rescue|Ambulance",{ listStyle: builder.ListStyle.button });
    },

    //Step 2: Get Location of incident
    function (session, results) {
        session.dialogData.emergencyType =  results.response.entity;

        //Get location of user using Bing Maps API
        bot.library(locationDialog.createLibrary("AvNIDF3qFepysVPTuwNoajc8ssjMZ_EvwHNgq7vzORy9BFSoKy-KOkaRDj54bHev"));

        var options = {
            prompt: "Where is your location? Please write a street address or postal code",
    			skipFavorites: true,
    			skipConfirmationAsk: true,
        };
        locationDialog.getLocation(session, options);
    },

    //Step 3: Get More details of the incident
    function (session, results) {

        session.send(`We are sending help to your location.`);

        if(session.dialogData.emergencyType == "Police"){
           session.send("In the mean time, please provide us with more details");
           builder.Prompts.choice(session, "What is the nature of the incident?", "Accident|Assault|Burglary|Battery|Kidnapping|Suicide",{ listStyle: builder.ListStyle.button });
        }else if(session.dialogData.emergencyType == "Fire & Rescue"){
            session.send("In the mean time, please provide us with more details");
           builder.Prompts.choice(session, "What is the nature of the incident?", "Fire|Rescue",{ listStyle: builder.ListStyle.button } );
        }else{
            session.send("In the mean time, please provide us with more details");
           builder.Prompts.choice(session, "What is the nature of the incident?", "Hemorrhage|Spinal|Cardiac|Seizure|Head",{ listStyle: builder.ListStyle.button } );
        }
    },
    //Step 4: Further Details of the Incident
    function (session, results) {
        if(session.dialogData.emergencyType == "Police"){
           session.dialogData.crimetype = results.response.entity;
           builder.Prompts.choice(session, "Are there people trapped or injured? If so, how many?" , "None|<5|>5",{ listStyle: builder.ListStyle.button });
        }else if (session.dialogData.emergencyType == "Fire & Rescue"){
           session.dialogData.fireorrescue = results.response.entity;
           if(results.response.entity == "Fire"){
               builder.Prompts.choice(session, "What color is the smoke?", "Black Smoke|White Smoke|No Smoke",{ listStyle: builder.ListStyle.button } );
           }else{
               builder.Prompts.choice(session, "Is there anyone trapped or injured? If so, how many?", "None|<5|>5",{ listStyle: builder.ListStyle.button } );
           }
        }else{
          builder.Prompts.choice(session, "Is there anyone trapped or injured? If so, how many?", "None|<5|>5",{ listStyle: builder.ListStyle.button } );
        }

    },
    //Step 5: Send a picture?
    function (session, results) {
        if (hasImageAttachment(session)) {
        var stream = getImageStreamFromMessage(session.message);
        captionService
            .getCaptionFromStream(stream)
            .then(function (caption) { handleSuccessResponse(session, caption); })
            .catch(function (error) { handleErrorResponse(session, error); });
        } else {
        var imageUrl = parseAnchorTag(session.message.text) || (validUrl.isUri(session.message.text) ? session.message.text : null);
        if (imageUrl) {
            captionService
                .getCaptionFromUrl(imageUrl)
                .then(function (caption) { handleSuccessResponse(session, caption); })
                .catch(function (error) { handleErrorResponse(session, error); });
        } else {
            session.send('Did you upload an image? I\'m more of a visual person. Try sending me an image or an image URL');
        }
        }
        
    },
    
    function (session, results) {
        session.dialogData.test = results.response.entity;
        session.send("Request Confirmed. Please wait up to 5-8 minutes for arrival. Be safe.")
        // Process request and display reservation details
        //session.send(`Request confirmed. Case details: <br/>Date/Time: ${session.dialogData.reservationDate} <br/>Party size: ${session.dialogData.partySize} <br/>Reservation name: ${session.dialogData.reservationName}`);
        session.endDialog();
    },
    
    
    
    //Step 7: Ending
    function (session, results) {
        session.dialogData.test = results.response.entity;
        session.send("Request Confirmed. Please wait up to 5-8 minutes for arrival. Be safe.")
        // Process request and display reservation details
        //session.send(`Request confirmed. Case details: <br/>Date/Time: ${session.dialogData.reservationDate} <br/>Party size: ${session.dialogData.partySize} <br/>Reservation name: ${session.dialogData.reservationName}`);
        session.endDialog();
    }
]).set('storage', inMemoryStorage); // Register in-memory storage

;
