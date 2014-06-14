// This uses require.js to structure javascript:
// http://requirejs.org/docs/api.html#define

define(function (require) {
    // Receipt verification (https://github.com/mozilla/receiptverifier)
    require('receiptverifier');

    // Installation button
    require('./install-button');

    // Install the layouts
    require('layouts/layouts');

    // Write your app here.
    function renderLocomotiveImage(item) {
       return '<img src=\"data:image/gif;base64,' + item.get('locomotiveImage') + '\"/>';
    }

    var selectLocomotivesView = $('.locomotiveList').get(0);
    selectLocomotivesView.nextView = '.locomotiveController';

    selectLocomotivesView.renderRow = function (item) {
        $(this).append('<h4>' + item.get('title') + '</h4>');
        $(this).append(renderLocomotiveImage(item));
    };

    $.ajax({
        url: 'http://forkch.dyndns.org:3000/locomotiveGroup',
        success: function (locomotiveGroups) {
            locomotiveGroups.forEach(function (locomotiveGroup) {
                locomotiveGroup.locomotives.forEach(function (locomotive) {
                    selectLocomotivesView.add({title: locomotive.name, locomotiveImage: locomotive.imageBase64, bus: locomotive.bus, address1: locomotive.address1});
                });
            });
        }
    })
//forkch.dyndns.org
    var socket = navigator.mozTCPSocket.open('forkch.dyndns.org', 4303);

    var state = 'disconnected';

    socket.onopen = function() {
        console.log("onopen");
        state = 'connected';
    }

    socket.ondata = function(event) {
        console.log(state + ':   ' + event.data);
        socket.suspend();

        if(state === 'connected') {
            var ret = socket.send('SET CONNECTIONMODE SRCP COMMAND\n');
            console.log(ret);
            state = 'handshake'
        } else if(state === 'handshake') {
            var ret = socket.send("GO\n");
            console.log(ret);
            state = 'ready';
        } else {

        }
        socket.resume();
    }

    var locomotiveControllerView = $('.locomotiveController').get(0);
    locomotiveControllerView.render = function(item) {
        $('.content').children().remove();
        $('.content').append(renderLocomotiveImage(item));

        var model = locomotiveControllerView.model;

        socket.send('INIT ' + model.get('bus') + ' GL ' + model.get('address1') + ' M 2 14 5\n');

        $('.locomotiveSpeedBar').on('input', function(e) {
            var model = locomotiveControllerView.model;
            var speed = $('.locomotiveSpeedBar').attr('value');
            //console.log(model.get('address1') + '  ' + speed);
            var command = 'SET ' + model.get('bus') + ' GL ' + model.get('address1') + ' 0 ' + speed + ' 14 ' + ' 0 0 0 0 0\n';
            console.log(command);
            socket.send(command);
        });
    }


});