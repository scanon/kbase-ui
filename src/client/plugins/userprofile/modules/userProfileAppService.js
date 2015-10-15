/*global define */
/*jslint browser: true, white: true */
define([
    'promise',
    'kb_common_observed',
    'kb_common_props',
    'kb_userprofile_userProfile'
], function (Promise, observed, props, userProfile) {
    'use strict';

    function factory(config) {
        var runtime = config.runtime,
            state = observed.make();

        function loadProfile() {
            return Promise.try(function () {
                var username = runtime.getService('session').getUsername();
                if (username) {
                    console.log('Loading profile...');
                    return Object.create(userProfile).init({
                        username: username,
                        runtime: runtime
                    }).loadProfile();
                }
            });
        }

        // list for request fetch the user profile
        function start() {
            runtime.getService('session').onChange(function (loggedIn) {
                console.log('login change detected...');
                console.log(loggedIn);
                if (loggedIn) {
                    loadProfile()
                        .then(function (profile) {
                            console.log('Loaded!');
                            state.setItem('userprofile', profile);
                        })
                        .catch(function (err) {
                            console.log('ERROR starting profile app service');
                            console.log(err);
                        });
                } else {
                    state.setItem('userprofile', null);
                }
            });
        }
        function stop() {
            state.setItem('userprofile', null);
        }
        
        function getRealname() {
            var profile = state.getItem('userprofile');
            if (profile) {
                return profile.getProp('user.realname');
            }
        }
        
        //runtime.recv('session', 'loggedin', function () {
        //    loadSession();
        //});

        // send out message when the profile has been received
        function onChange(fun) {
            state.listen('userprofile', {
                onSet: function (value) {
                    fun(value);
                }
            });
        }

        return {
            start: start,
            stop: stop,
            onChange: onChange,
            getRealname: getRealname
        };
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});