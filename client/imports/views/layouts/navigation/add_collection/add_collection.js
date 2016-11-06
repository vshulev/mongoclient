import {Template} from 'meteor/templating';
import Helper from '/client/imports/helper';

import './add_collection.html';

var toastr = require('toastr');

/**
 * Created by RSercan on 20.2.2016.
 */
Template.addCollection.onRendered(function () {
    initICheck('divAutoIndexId', true);
    initICheck('divIsCapped', false);
});

Template.addCollection.events({
    'click #btnCreateCollection'(e) {
        e.preventDefault();
        Helper.warnDemoApp();
    }
});

const initICheck = function (id, checked) {
    var selector = $('#' + id);
    selector.iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    if (checked) {
        selector.iCheck('check');
    } else {
        selector.iCheck('uncheck');
    }
};