import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import {initExecuteQuery} from '/client/imports/views/pages/browse_collection/browse_collection';

import './bulk_write.html';

/**
 * Created by RSercan on 15.10.2016.
 */

Template.bulkWrite.onRendered(function () {
    Helper.initializeCodeMirror($('#divBulkWrite'), 'txtBulkWrite');
});

Template.bulkWrite.executeQuery = function (historyParams) {
    Helper.warnDemoApp();
};


Template.bulkWrite.renderQuery = function (query) {
    if (query.queryParams && query.queryParams.selector) {
        // let codemirror initialize
        Meteor.setTimeout(function () {
            Helper.setCodeMirrorValue($('#divBulkWrite'), JSON.stringify(query.queryParams.selector, null, 1));
        }, 100);
    }
};
