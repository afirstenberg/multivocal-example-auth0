const Multivocal = require('multivocal');
const Util = require('multivocal/lib/util');
const Template = require('multivocal/lib/template');
const request = require('request-promise-native');

var setting = {
  userinfoUrl: "https://{{Config.Setting.auth0.tenant}}.auth0.com/userinfo"
};

var config = {
  Setting: {
    auth0: setting
  }
};

var buildAuth0Profile = function( env ){
  var accessToken = Util.objPath( env, 'User/AccessToken' );
  if( !accessToken ){
    return Promise.resolve( env );
  }

  var url = Util.setting( env, 'auth0/userinfoUrl', Template.Methods.Str );

  var options = {
    uri: url,
    headers: {
      "Authorization": `Bearer ${accessToken}`
    },
    json: true
  };

  return request( options )
    .then( profile => {
      //console.log('auth0 profile',profile);
      Util.setObjPath( env, 'User/Profile', profile );
      return Promise.resolve( env );
    })
    .catch( err => {
      console.error('Problem building auth0 profile', err);
      return Promise.resolve( env );
    })
};

exports.init = function(){
  new Multivocal.Config.Simple( config );
  Multivocal.addBuilder( buildAuth0Profile );
};