var CONFIG_VARS={
  client_id :"3MVG9w8uXui2aB_pi_Pn0kus1zQjY_u7TPHex28Wp4dR9XOXiXNGMHQdOvE35.YMcVQVDPQYnCjioEpmSjAfq",
  client_secret :"1BE5CADFA7250C440E9A6487EEA5F1DC2D3A0084DB9512B5B1BABD5B7A3E6A98",
  username :"test-zxcqhuzr4wrx@example.com ",
  password :"~~``&d**lhjR97nDD55Dw" ,
  token:"wChgIpfveyygLEvNOsqC0AVnI"
}

var CAMPAIGN = 'Website traffic-Search-1';
var ADGROUP = 'Salesforce-data-group';

function getAdGroup(campaignName, adGroupName) {
      return AdsApp.adGroups()
          .withCondition('Name = "' + adGroupName + '"')
          .withCondition('CampaignName = "' + campaignName + '"')
          .get()
          .next();
}

function getOrCreateDataSource() {
    var sources = AdsApp.adCustomizerSources().get();
    while (sources.hasNext()) {
      var source = sources.next();
      if (source.getName() == 'Opps') {
        //if the source Opps already exists then return
        return source;
      }
    }
    return AdsApp.newAdCustomizerSourceBuilder()
        .withName('Opps')
        .addAttribute('Name', 'text')
        .addAttribute('StageName', 'text')
        .addAttribute('Amount', 'text')
        // Attributes named 'Custom ID' are special: the system will make sure
        // that all values in the data source have unique custom IDs.
        .addAttribute('Custom ID', 'text')
        .build()
        .getResult();
}


function maybeCreatedAds(adGroup){
      /*var adGroup = getAdGroup(CAMPAIGN, ADGROUP);**/
        var ads=adGroup.ads().get();
        while(ads.hasNext()){
        var ad=ads.next();
          if(ad.isType().expandedTextAd()){
          var expandedTextAd=ad.asType().expandedTextAd();
            if(expandedTextAd.getHeadlinePart1()=='Our top Opportunities'){
             //The ads have already been created; no need to do more
                  return;}
          }
        }

        // Reference the 'Opps' data source here; text will be inserted when the ad is served.
           adGroup.newAd().expandedTextAdBuilder()
            .withHeadlinePart1('{=Opps.Name}')
            .withHeadlinePart2('At stage : {=Opps.StageName}')
            .withDescription('Amount of : {=Opps.Amount }')
            .withFinalUrl('http://www.example.com')
            .build();
          // All ad groups also need to have an ad without ad customizers to fall back
           // on, in case no ad customizers are able to serve.
        /*adGroup.newAd().expandedTextAdBuilder()
         .withHeadlinePart1('Our top Opportunities')
         .withHeadlinePart2('Checkout our top opportunities')
         .withDescription('We do Our best !')
         .withFinalUrl('http://www.example.com')
          .build();*/
}

function getCustomizersById(source) {
    var customizers = source.items().get();
    var customizersById = {};
    while (customizers.hasNext()) {
      var customizer = customizers.next();
      customizersById[customizer.getAttributeValue('Custom ID')] = customizer;
    }
    return customizersById;
}

function getSalesForceData(queryStr){
  var salesforceApi= new  SalesforceAPI(CONFIG_VARS);
  return salesforceApi.query(queryStr);
}

function setCustomizerValues(source, oppsJson, customizersById) {
  
  //implement later logic to get the opportunity with the highest amount
   // Logger.log("0:"+oppsJson[0].Amount+ "   1:"+oppsJson[1].Amount);
   var topOpp=oppsJson[1];
    
   var customizer = customizersById[topOpp.Name.toLowerCase()];
    //if already exists ,we don't need to customize it 
  if (customizer) {
      customizer.setAttributeValue('Amount', topOpp.Amount.toString());
    } else {
      Logger.log(topOpp);
      source.adCustomizerItemBuilder()
         // .withAttributeValue('Custom ID', topOpp.Name.toLowerCase())
          .withAttributeValue('Name', topOpp.Name)
          .withAttributeValue('StageName', topOpp.StageName)
          .withAttributeValue('Amount', topOpp.Amount.toString())
          .withTargetKeyword(topOpp.Name)
          .build();
    }
  return topOpp;
}

function main() {
 var adGroup = getAdGroup(CAMPAIGN, ADGROUP);
    Logger.log(adGroup.getName());//		Salesforce-data-group
  // var source = getOrCreateDataSource();
    //Logger.log(source.getAttributes());//	{StageName=text, Custom ID=text, Amount=text, Name=text}
  // maybeCreatedAds(adGroup);
  // Get all customizer items in the 'Opps' data source, and create a map
  // from item ID to item.
  //var customizersById = getCustomizersById(source);
  //var opps_json = getSalesForceData("select Id,Name,StageName,Amount,imgUrl__c from Opportunity");
//  readOpportunities(opps_json)
  /*
  var topOpp = setCustomizerValues(source, opps_json, customizersById);
  var defaultCustomizer = customizersById['Default'];
      
  if (defaultCustomizer) {
    defaultCustomizer.setAttributeValues({
      Name: topOpp.Name,
      StageName: topOpp.StageName,
      Amount: topOpp.Amount.toString()
    });
  } else {
    source.adCustomizerItemBuilder()
        .withAttributeValue('Custom ID', 'Default')
        .withAttributeValue('Name', topOpp.Name)
        .withAttributeValue('StageName', topOpp.StageName)
        .withAttributeValue('Amount', topOpp.Amount.toString())
        .build();
  }*/
}

function readOpportunities(resultsJson) {
  // Log the results
  for(var i in resultsJson) {
    Logger.log(['Name:',resultsJson[i].Name,'Stage Name:',resultsJson[i].StageName,'Amount:',resultsJson[i].Amount,
                'imgUrl__c:',resultsJson[i].imgUrl__c,
               ].join(' '));
      }
}


