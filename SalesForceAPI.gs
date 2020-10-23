/******************************************
* Salesforce.com CRM API Class
* Use it to query data out of Salesforce CRM
* Version 1.0 
* Created By: Russ Savage
* FreeAdWordsScripts.com
* http://www.freeadwordsscripts.com/2014/09/pull-salesforce-data-into-adwords-using.html
******************************************/
function SalesforceAPI(configVars) {
  this.login = function(configVars) {
    var LOGIN_ENDPOINT = "https://test.salesforce.com/services/oauth2/token";
    var options = {
      muteHttpExceptions : false,
      method: "POST",
      payload: {
        grant_type : "password",
        client_id : configVars.client_id,
        client_secret : configVars.client_secret,
        username : configVars.username,
        password : configVars.password+configVars.token
      }
    };
    var resp = UrlFetchApp.fetch(LOGIN_ENDPOINT, options);
    if(resp.getResponseCode() == 200) {
      var jsonResp = JSON.parse(resp.getContentText());
      this.id = jsonResp.id;
      this.instanceUrl = jsonResp.instance_url;
      this.signature = jsonResp.signature;
      this.accessToken = jsonResp.access_token;
      Logger.log('Successfully logged in user with id: '+this.id.replace('https://','').split('/')[3]);
     // var x=this.id.replace('https://','').split('/');
     // Logger.log('company id:'+x[2]);
      //Logger.log('user id:'+x[3]);
    }
  }
   
  this.getServices = function() {
    if(this.serviceUrls) { return this.serviceUrls };
    var ENDPOINT_URL = this.instanceUrl+"/services/data/v26.0/.json";
    var options = getBasicOptions(this.accessToken);
    var resp = UrlFetchApp.fetch(ENDPOINT_URL, options);
    if(resp.getResponseCode() == 200) {
      var jsonResp = JSON.parse(resp.getContentText());
      this.serviceUrls = jsonResp;
      return this.serviceUrls;
    }
  }
   
  this.query = function(queryStr) {
    if(!this.serviceUrls.query) { throw "Query service is not enabled in this SF instance."; }
    var ENDPOINT_URL = this.instanceUrl+this.serviceUrls.query+'.json';
    var url = ENDPOINT_URL + '?q=' + encodeURIComponent(queryStr);
    var options = getBasicOptions(this.accessToken);
    var resp = UrlFetchApp.fetch(url, options);
    if(resp.getResponseCode() == 200) {
      var jsonResp = JSON.parse(resp.getContentText());
      if(jsonResp.done) {
        return jsonResp.records;
      } else {
        var retVal = jsonResp.records;
        while(!jsonResp.done) {
          resp = UrlFetchApp.fetch(jsonResp.nextRecordsUrl, options);
          if(resp.getResponseCode() == 200) {
            jsonResp = JSON.parse(resp.getContentText());
            Logger.log(retVal)
            retVal = retVal.concat(jsonResp.records);
          }
        }
        return retVal;
      }
    }
  }
   
  this.getObjectByUrl = function(url) {
    var url = this.instanceUrl + url + '.json';
    var options = getBasicOptions(this.accessToken);
    var resp = UrlFetchApp.fetch(url, options);
    Logger.log(resp.getContentText());
    if(resp.getResponseCode() == 200) {
      return JSON.parse(resp.getContentText());
    }
  }
   
  this.getFullUrl = function(url) {
    return this.instanceUrl + url;
  }
   
  this.login(configVars);
  this.getServices();
   
   
  function getBasicOptions(token) {
    return {
      muteHttpExceptions : false,
      method: 'GET',
      headers: {
        Authorization : "Bearer " + token
      }
    };
  }
}