import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import Helper from '/client/imports/helper';
import {Connections} from '/lib/imports/collections/connections';

import './manage_users.html';

var JSONEditor = require('jsoneditor');
var toastr = require('toastr');
var Ladda = require('ladda');
/**
 * Created by sercan on 14.04.2016.
 */


const populateTableData = function (users) {
    var result = [];
    for (var i = 0; i < users.length; i++) {
        var obj = {
            user: users[i].user,
            roles: []
        };

        for (var j = 0; j < users[i].roles.length; j++) {
            obj.roles.push('<b>' + users[i].roles[j].role + '</b>@' + users[i].roles[j].db);
        }

        result.push(obj);
    }

    return result;
};

const initiateRoleToAddTable = function () {
    var selector = $('#tblCurrentRoles');
    selector.find('tbody').on('click', 'tr', function () {
        var table = selector.DataTable();
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }

        if (table.row(this).data()) {
            $('#inputAddRoleToUserRolename').val(table.row(this).data().role);
            $('#cmbDatabasesForAddRoleToUser').val(table.row(this).data().db).trigger('chosen:updated');
        }
    });

    selector.find('tbody').on('click', 'a.editor_delete', function () {
        selector.DataTable().row($(this).parents('tr')).remove().draw();
    });
};

const populateUserRolesToSave = function () {
    var result = [];
    var roles = $('#tblUserRoles').DataTable().rows().data();
    for (var i = 0; i < roles.length; i++) {
        result.push({
            db: roles[i].db,
            role: roles[i].role
        });
    }

    return result;
};

const populateUserRolesTable = function (roles, dataArray) {
    var tblUserRoles = $('#tblUserRoles');
    // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
    if ($.fn.dataTable.isDataTable('#tblUserRoles')) {
        tblUserRoles.DataTable().destroy();
    }
    tblUserRoles.DataTable({
        data: dataArray ? dataArray : roles,
        columns: [
            {data: "role", "width": "50%"},
            {data: "db", "width": "50%"}
        ],
        columnDefs: [
            {
                targets: [2],
                data: null,
                width: "5%",
                defaultContent: '<a href="" title="Delete" class="editor_delete"><i class="fa fa-remove text-navy"></i></a>'
            }
        ]
    });
};


export const popEditUserModal = function (user) {
    $('#addEditUserModalTitle').text('Edit User');

    var l = Ladda.create(document.querySelector('#btnCloseUMDB'));
    l.start();

    var connection = Connections.findOne({_id: Session.get(Helper.strSessionConnection)});
    var runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;
    var dbName = runOnAdminDB ? 'admin' : connection.databaseName;
    var username = user ? user : Session.get(Helper.strSessionUsermanagementUser).user;

    var userInfoCommand = {
        usersInfo: {user: username, db: dbName},
        showCredentials: true,
        showPrivileges: true
    };

    Meteor.call('command', userInfoCommand, runOnAdminDB, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch userInfo");
        }
        else {
            $('#editUserModal').modal('show');

            var user = result.result.users[0];
            populateUserRolesTable(user.roles);

            var inputUsernameSelector = $('#inputUsernameUM');
            inputUsernameSelector.val(user.user);
            inputUsernameSelector.prop('disabled', true);

            var inputPasswordSelector = $('#inputPasswordUM');
            inputPasswordSelector.val('');
            inputPasswordSelector.attr('placeholder', 'Leave this blank to keep old one');

            if (user.customData) {
                $('.nav-tabs a[href="#tab-2"]').tab('show');
                Helper.setCodeMirrorValue($('#divCustomData'), JSON.stringify(user.customData, null, 1));
            }
        }

        Ladda.stopAll();
    });
};

export const initUsers = function () {
    // loading button

    var l = Ladda.create(document.querySelector('#btnCloseUMDB'));
    l.start();

    var command = {
        usersInfo: 1,
        showCredentials: true
    };

    var runOnAdminDB = $('#aRunOnAdminDBToFetchUsers').iCheck('update')[0].checked;

    Meteor.call('command', command, runOnAdminDB, function (err, result) {
        if (err || result.error) {
            Helper.showMeteorFuncError(err, result, "Couldn't fetch users");
        }
        else {
            var tblUsers = $('#tblUsers');
            // destroy jquery datatable to prevent reinitialization (https://datatables.net/manual/tech-notes/3)
            if ($.fn.dataTable.isDataTable('#tblUsers')) {
                tblUsers.DataTable().destroy();
            }
            tblUsers.DataTable({
                data: populateTableData(result.result.users),
                columns: [
                    {data: "user", "width": "20%"},
                    {data: "roles[, ]", "width": "65%"}
                ],
                columnDefs: [
                    {
                        targets: [2],
                        data: null,
                        width: "5%",
                        defaultContent: '<a href="" title="Show File Info" class="editor_show_custom_data"><i class="fa fa-book text-navy"></i></a>'
                    },
                    {
                        targets: [3],
                        data: null,
                        width: "5%",
                        defaultContent: '<a href="" title="Edit" class="editor_edit"><i class="fa fa-edit text-navy"></i></a>'
                    },
                    {
                        targets: [4],
                        data: null,
                        width: "5%",
                        defaultContent: '<a href="" title="Delete" class="editor_delete_user"><i class="fa fa-remove text-navy"></i></a>'
                    }
                ]
            });
        }


        Ladda.stopAll();
    });
};

Template.manageUsers.onRendered(function () {
    Helper.initiateDatatable($('#tblUsers'), Helper.strSessionUsermanagementUser);
    Helper.initiateDatatable($('#tblUserRoles'));
    initiateRoleToAddTable();

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href");
        if (target == '#tab-2') {
            Helper.initializeCodeMirror($('#divCustomData'), 'txtCustomData');
        }
    });
});

Template.manageUsers.helpers({
    getDB () {
        return Session.get(Helper.strSessionUsermanagementManageSelection);
    },

    getUser() {
        return Session.get(Helper.strSessionUsermanagementUser);
    }
});

Template.manageUsers.events({
    'click .editor_delete_user' (e) {
        e.preventDefault();
        Helper.warnDemoApp();
    },

    'click .editor_show_custom_data' (e) {
        e.preventDefault();
        Helper.warnDemoApp();
    },

    'click #btnApplyAddEditUser'  (e) {
        e.preventDefault();
        Helper.warnDemoApp();
    },

    'click #btnApplyAddRoleToUser' (e) {
        e.preventDefault();
        Helper.warnDemoApp();
    },

    'click #btnAddNewRoleToUser' (e) {
        e.preventDefault();
        Helper.warnDemoApp();
    },

    'click #btnAddNewUser'  (e) {
        e.preventDefault();
        Helper.warnDemoApp();
    },

    'click .editor_edit'  (e) {
        e.preventDefault();
        Helper.warnDemoApp();
    }
});