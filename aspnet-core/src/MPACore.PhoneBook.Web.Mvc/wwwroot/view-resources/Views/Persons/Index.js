(function() {

    $(function() {


        console.log("abpc");
        var _$personsTable = $("#PersonsTable");

        var _personService = abp.services.app.person;


        var _createOrEditModal = new app.ModalManager({
            viewUrl: abp.appPath + 'Persons/CreateOrEditModal',
            scriptUrl: abp.appPath + 'view-resources/Views/Persons/_CreateOrEditModal.js',
            modalClass: 'CreateOrEditPersonModal'
        });






   //     console.log(_personService);
        //   debugger;
        var dataTable = _$personsTable.DataTable({
            paging: true,
            serverSide: true,
            processing: true,
            listAction: {
                ajaxFunction: _personService.getPagedPerson,
                inputFilter: function() {
                    return {
                        filter: $("#PersonTableFilter").val()

                    };
                }
            },
            columnDefs: [
                {
                    targets: 0,
                    data: null,
                    orderable: false,
                    autoWidth: false,
                    defaultContent: "",
                    rowAction: {
                        cssClass: "btn btn-brand dropdown-toggle",
                        text: '<i class="fa fa-cog"></i> ' + app.localize("Actions") + ' <span class="caret"></span>',
                        items: [
                            {
                                text: app.localize("LoginAsThisUser"),
                                visible: function(data) {
                                    return _permissions.impersonation && data.record.id !== abp.session.userId;
                                },
                                action: function(data) {
                                    abp.ajax({
                                        url: abp.appPath + "Account/Impersonate",
                                        data: JSON.stringify({
                                            tenantId: abp.session.tenantId,
                                            userId: data.record.id
                                        })
                                    });
                                }
                            }, {
                                text: app.localize("Edit"),
                                visible: function() {
                                    return _permissions.edit;
                                },
                                action: function(data) {
                                    _createOrEditModal.open({ id: data.record.id });
                                }
                            }, {
                                text: app.localize("Permissions"),
                                visible: function() {
                                    return _permissions.changePermissions;
                                },
                                action: function(data) {
                                    _userPermissionsModal.open({ id: data.record.id });
                                }
                            }, {
                                text: app.localize("Unlock"),
                                visible: function() {
                                    return _permissions.changePermissions;
                                },
                                action: function(data) {
                                    _userService.unlockUser({
                                        id: data.record.id
                                    }).done(function() {
                                        abp.notify.success(app.localize("UnlockedTheUser", data.record.userName));
                                    });
                                }
                            }, {
                                text: app.localize("Delete"),
                                visible: function() {
                                    return _permissions.delete;
                                },
                                action: function(data) {
                                    deleteUser(data.record);
                                }
                            }
                        ]
                    }
                },
                {
                    targets: 1,
                    data: "userName",
                    render: function(userName, type, row, meta) {
                        var $container = $("<span/>");
                        if (row.profilePictureId) {
                            var profilePictureUrl = "/Profile/GetProfilePictureById?id=" + row.profilePictureId;
                            var $link = $("<a/>").attr("href", profilePictureUrl).attr("target", "_blank");
                            var $img = $("<img/>")
                                .addClass("img-circle")
                                .attr("src", profilePictureUrl);

                            $link.append($img);
                            $container.append($link);
                        }

                        $container.append(userName);
                        return $container[0].outerHTML;
                    }
                }
            ]
        });


        function getPersons() {
            dataTable.ajax.reload();
        }

   
        $('#CreateNewPersonButton').click(function () {
            //console.log("ddd");
            _createOrEditModal.open();
        });

    });

})();