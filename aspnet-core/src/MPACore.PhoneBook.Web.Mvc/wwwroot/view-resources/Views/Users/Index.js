(function() {
    $(function() {
        
        var _userService = abp.services.app.user;


        var _$usersTable = $('#UsersTable');

     
        console.log("1"+_userService);
        debugger;
        var dataTable = _$usersTable.DataTable({
            paging: true,
            serverSide: true,
            processing: true,
            listAction: {
                ajaxFunction: _userService.getAll,
                inputFilter: function () {
                    return {
                        filter: $('#UsersTableFilter').val(),
                       
                    };
                }
            },
            columnDefs: [
                {
                    targets: 0,
                    data: null,
                    orderable: false,
                    autoWidth: false,
                    defaultContent: '',
                    rowAction: {
                        cssClass: 'btn btn-brand dropdown-toggle',
                        text: '<i class="fa fa-cog"></i> ' + app.localize('Actions') + ' <span class="caret"></span>',
                        items: [{
                            text: app.localize('LoginAsThisUser'),
                            visible: function (data) {
                                return _permissions.impersonation && data.record.id !== abp.session.userId;
                            },
                            action: function (data) {
                                abp.ajax({
                                    url: abp.appPath + 'Account/Impersonate',
                                    data: JSON.stringify({
                                        tenantId: abp.session.tenantId,
                                        userId: data.record.id
                                    })
                                });
                            }
                        }, {
                            text: app.localize('Edit'),
                            visible: function () {
                                return _permissions.edit;
                            },
                            action: function (data) {
                                _createOrEditModal.open({ id: data.record.id });
                            }
                        }, {
                            text: app.localize('Permissions'),
                            visible: function () {
                                return _permissions.changePermissions;
                            },
                            action: function (data) {
                                _userPermissionsModal.open({ id: data.record.id });
                            }
                        }, {
                            text: app.localize('Unlock'),
                            visible: function () {
                                return _permissions.changePermissions;
                            },
                            action: function (data) {
                                _userService.unlockUser({
                                    id: data.record.id
                                }).done(function () {
                                    abp.notify.success(app.localize('UnlockedTheUser', data.record.userName));
                                });
                            }
                        }, {
                            text: app.localize('Delete'),
                            visible: function () {
                                return _permissions.delete;
                            },
                            action: function (data) {
                                deleteUser(data.record);
                            }
                        }]
                    }
                },
                {
                    targets: 1,
                    data: "userName",
                    render: function (userName, type, row, meta) {
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
                },
                {
                    targets: 2,
                    data: "name"
                },
                {
                    targets: 3,
                    data: "surname"
                },
                {
                    targets: 4,
                    data: "roles",
                    render: function (roles) {
                        var roleNames = '';
                        for (var j = 0; j < roles.length; j++) {
                            if (roleNames.length) {
                                roleNames = roleNames + ', ';
                            }

                            roleNames = roleNames + roles[j].roleName;
                        };

                        return roleNames;
                    }
                },
                {
                    targets: 5,
                    data: "emailAddress"
                },
                {
                    targets: 6,
                    data: "isEmailConfirmed",
                    render: function (isEmailConfirmed) {
                        if (isEmailConfirmed) {
                            return '<span class="label label-success">' + app.localize('Yes') + '</span>';
                        } else {
                            return '<span class="label label-default">' + app.localize('No') + '</span>';
                        }
                    }
                },
                {
                    targets: 7,
                    data: "isActive",
                    render: function (isActive) {
                        if (isActive) {
                            return '<span class="label label-success">' + app.localize('Yes') + '</span>';
                        } else {
                            return '<span class="label label-default">' + app.localize('No') + '</span>';
                        }
                    }
                },
                {
                    targets: 8,
                    data: "lastLoginTime",
                    render: function (lastLoginTime) {
                        if (lastLoginTime) {
                            return moment(lastLoginTime).format('L');
                        }

                        return "";
                    }
                },
                {
                    targets: 9,
                    data: "creationTime",
                    render: function (creationTime) {
                        return moment(creationTime).format('L');
                    }
                }
            ]
        });


        function getUsers() {
            dataTable.ajax.reload();
        }



        var _$modal = $('#UserCreateModal');
        var _$form = _$modal.find('form');

        _$form.validate({
            rules: {
                Password: "required",
                ConfirmPassword: {
                    equalTo: "#Password"
                }
            }
        });

        $('#RefreshButton').click(function () {
            refreshUserList();
        });

        $('.delete-user').click(function () {
            var userId = $(this).attr("data-user-id");
            var userName = $(this).attr('data-user-name');

            deleteUser(userId, userName);
        });

        $('.edit-user').click(function (e) {
            var userId = $(this).attr("data-user-id");

            e.preventDefault();
            $.ajax({
                url: abp.appPath + 'Users/EditUserModal?userId=' + userId,
                type: 'POST',
                contentType: 'application/html',
                success: function (content) {
                    $('#UserEditModal div.modal-content').html(content);
                },
                error: function (e) { }
            });
        });

        _$form.find('button[type="submit"]').click(function (e) {
            e.preventDefault();

            if (!_$form.valid()) {
                return;
            }

            var user = _$form.serializeFormToObject(); //serializeFormToObject is defined in main.js
            user.roleNames = [];
            var _$roleCheckboxes = $("input[name='role']:checked");
            if (_$roleCheckboxes) {
                for (var roleIndex = 0; roleIndex < _$roleCheckboxes.length; roleIndex++) {
                    var _$roleCheckbox = $(_$roleCheckboxes[roleIndex]);
                    user.roleNames.push(_$roleCheckbox.val());
                }
            }

            abp.ui.setBusy(_$modal);
            _userService.create(user).done(function () {
                _$modal.modal('hide');
                location.reload(true); //reload page to see new user!
            }).always(function () {
                abp.ui.clearBusy(_$modal);
            });
        });
        
        _$modal.on('shown.bs.modal', function () {
            _$modal.find('input:not([type=hidden]):first').focus();
        });

        function refreshUserList() {
            location.reload(true); //reload page to see new user!
        }

        function deleteUser(userId, userName) {
            abp.message.confirm(
                "Delete user '" + userName + "'?",
                function (isConfirmed) {
                    if (isConfirmed) {
                        _userService.delete({
                            id: userId
                        }).done(function () {
                            refreshUserList();
                        });
                    }
                }
            );
        }
    });
})();