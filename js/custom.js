// Any methods for onload go here.
//var HOST = "http://127.0.0.1/tickets";
//var HOST = "http://192.168.0.101/tickets";
var HOST ="http://supportdesk.services";
var ticketList = {};
var APList = {};
var arr_offorms = JSON.parse(localStorage.getItem("offorms") || "[]");
var dataInfo = {
    id:null,
    result:null
};

$(document).on('vclick', '#ticket-list-view li a', function () {
    dataInfo.id = $(this).attr('data-id');
    
});
clearStorage = function () {
    display_ajax_loader();
    localStorage.clear();
    $("#tickets").addClass('hide');
    $("#page1").removeClass('hide');
    $('#logout').hide();
    hide_ajax_loader();
};

refresh_page = function () {
    $("#tickets").removeClass('hide');
    $("#page1").addClass('hide');
    $('#ticket-list-view').show();
    $('#logout').show();
    $('#detail_page').hide();
    $("#reportForm").hide();
    hide_ajax_loader();
}

// Open tickets

get_open_tickets = function (token) {
    display_ajax_loader();
    $('.badge').removeClass('active');
    $('#ticket').addClass('active');
    token = localStorage.token;
    if(navigator.onLine){
        var pendingReports = localStorage.getItem("offorms");
        if(pendingReports) {
            var pendingReportsArray = jQuery.parseJSON(pendingReports);
            var formURL = HOST + "/web/api/reports/creates.json";
            jQuery.each(pendingReportsArray, function (indexNode, formData) {
                $.ajax({
                    beforeSend: function (request) {
                        request.setRequestHeader("Authorization", 'Authorization profile="UsernameToken"');
                        request.setRequestHeader("X-WSSE", token);
                    },
                    type: "POST",
                    url: formURL,
                    crossDomain: true,
                    dataType: "json",
                    data: jQuery.parseJSON(formData),
                    success: function (data) {
                        if (data['status'] == "success") {
                            //console.log('done');
                        }
                    }
                });
            });
            localStorage.removeItem('offorms');
        }
        $.ajax({
            type:"GET",
            contentType: "application/json",
            beforeSend:function (request) {
                request.setRequestHeader("Authorization", 'Authorization profile="UsernameToken"');
                request.setRequestHeader("X-WSSE", token);

            },
            url: HOST+"/web/api/tickets/27/open.json",
            processData:false,
            crossDomain:true,
            dataType: "json",
            success:function (data) {
                localStorage.token = token;
                localStorage.openTickets = JSON.stringify(data);
                //console.log(data);
                render_list(localStorage.openTickets,'ticket');
                refresh_page();
            },
            error:function () {
                hide_ajax_loader();
                $.hyc.ui.alert('There is some error to open this Action Plan.', function () {

                });
                localStorage.removeItem('token');
            }
        });

    }else{
        if(localStorage.getItem("openTickets") != null) {
            render_list(localStorage.openTickets, 'ticket');
        }
        refresh_page();
    }

};
get_open_ap = function () {
    display_ajax_loader();
    $('.badge').removeClass('active');
    $('#plans').addClass('active');
    if(navigator.onLine) {
        token = localStorage.token;
        $.ajax({
            type: "GET",
            beforeSend: function (request) {
                request.setRequestHeader(
                    "Authorization", 'Authorization profile="UsernameToken"'
                );
                request.setRequestHeader(
                    "X-WSSE", token
                );
            },
            url: HOST + "/web/api/actions/27/plan/index.json",
            processData: false,
            success: function (data) {
                localStorage.openAP = JSON.stringify(data);
                render_list(localStorage.openAP, 'ap');
                refresh_page();
                hide_ajax_loader();
            }
        });
    } else{
        render_list(localStorage.openAP, 'ap');
        refresh_page();
        hide_ajax_loader();
    }
};
render_list = function (data,page) {
    var ul = jQuery("#ticket-list-view");
    var results = jQuery.parseJSON(data);
    var text = '';
    if(page=='ticket'){ var action ='display_ticket_detail'}
    else if(page=='ap'){ var action ='display_ap_detail'}
    else if(page=='report'){ var action ='display_report_detail'}
    jQuery.each(results, function (indexNode, itemNode) {
	    //text = text + '<br><li class="list-group-item list-group-item-success">'+indexNode+"</li>";
        if(page=='ap'){
            text = text + '<br><li class="list-group-item"><span class="width_20">Ticket</span><span class="width_15">Name</span><span class="width_45">Customer</span><span class="width_20">Date</span><span class="clearfix"></span></li>';

        }else {
            text = text + '<br><li class="list-group-item"><span class="width_33">Ticket</span><span class="width_33">Customer</span><span class="width_33">Post Date</span><span class="clearfix"></span></li>';

        }jQuery.each(itemNode, function (index, item) {
         if(page=='ap'){
             text = text + '<li class="list-group-item" onclick=' + action + '(' + item["id"] + ',"' + indexNode + '") >' +
             '<a class="width_20" href="#" data-id="' + item['id'] + '" >' + item['ticket_number'] + '</a><a class="width_15">' + item['name'] + '</a><a class="width_45">' + item['company_name'] + '</a><a class="width_20">' + item['created'] + '</a><span class="clearfix"></span></li>';

         }else {
             text = text + '<li class="list-group-item" onclick=' + action + '(' + item["id"] + ',"' + indexNode + '") >' +
             '<a class="width_33" href="#" data-id="' + item['id'] + '" >' + item['ticket_number'] + '</a><a class="width_33">' + item['company_name'] + '</a><a class="width_33">' + item['created'] + '</a><span class="clearfix"></span></li>';
         }
    });
	});
    jQuery(ul).html(text);

};
display_ticket_detail = function (ticketId,company) {
    display_ajax_loader();
    if(navigator.onLine) {
        token = localStorage.token;
        $.ajax({
            type: "GET",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", 'Authorization profile="UsernameToken"');
                request.setRequestHeader("X-WSSE", token);
            },
            url: HOST + "/web/api/tickets/" + ticketId + "/companies/" + company + "/show.json",
            processData: false,
            success: function (data) {
                localStorage["ticketDetail" + data.id] = JSON.stringify(data);
                render_ticket_detail(localStorage["ticketDetail" + data.id], "ticket", company);
                hide_ajax_loader();
            }
        });
    }else{
        render_ticket_detail(localStorage["ticketDetail" + ticketId], "ticket", company);
        hide_ajax_loader();
    }

};
display_ap_detail = function (apId,company) {
    display_ajax_loader();
    if(navigator.onLine) {
    token = localStorage.token;
    $.ajax({
        type:"GET",
        beforeSend:function (request) {
            request.setRequestHeader("Authorization", 'Authorization profile="UsernameToken"');
            request.setRequestHeader("X-WSSE", token );
        },
        url:HOST+"/web/api/actions/" + apId + "/plans/"+company+"/company/show.json",
        processData:false,
        success:function (data) {
            localStorage["apDetail" + data.id] = JSON.stringify(data);
            render_ticket_detail(localStorage["apDetail" + data.id], "ap",company);
            hide_ajax_loader();
        }  ,
        error:function(){
            hide_ajax_loader();
            $.hyc.ui.alert('There is some error to open this Action Plan.', function () {
                get_open_ap();
            });
        }
    });
    }else{
        render_ticket_detail(localStorage["apDetail" + apId], "ap",company);
        hide_ajax_loader();
    }

};
display_report_detail = function (reportId,company) {
    display_ajax_loader();
    token = localStorage.token;
    $.ajax({
        type:"GET",
        beforeSend:function (request) {
            request.setRequestHeader("Authorization", 'Authorization profile="UsernameToken"');
            request.setRequestHeader("X-WSSE", token );
        },
        url: HOST+"/web/api/reports/" + reportId + "/show.json",
        processData:false,
        success:function (data) {
            localStorage["apDetail" + data.id] = JSON.stringify(data);
            render_ticket_detail(localStorage["apDetail" + data.id], "report",company);
            hide_ajax_loader();
        }
    });

};
render_ticket_detail = function (data, page,company) {
        var results = jQuery.parseJSON(data);
        var text = '<table class="table">';
        var ap='';
        var machine='';
        var close_details='';
        var add='';
        var ticket_detail='';
        jQuery.each(results, function (index, item) {
            if (index == 'machine') {
                machine ='<div class="panel panel-default"><div class="panel-heading">Machine</div><table class="table">';

                jQuery.each(item, function (key, value) {
                    if (key != 'id' && value != '') {
                        var level = key.replace('_', ' ');
                        machine = machine + '<tr><td>' + level.charAt(0).toUpperCase() + level.substring(1) + ': ' + value + '</td><td>';
                    }
                });

                machine = machine + '</table></div>';
            } else if (index == 'action_plans') {
                ap ='<div class="panel panel-default"><div class="panel-heading">Action plans</div><table class="table">';

                jQuery.each(item, function (key, value) {
                    jQuery.each(value, function (key, value) {
                        if (key != 'id' && value != '' && value != '[object Object]') {
                            var level = key.replace('_', ' ');
                            ap = ap + '<tr><td>' + level.charAt(0).toUpperCase() + level.substring(1) + '</td><td> ' + value + '</td></tr>';
                        }
                    });
                });

                ap = ap + '</table></div>';
            }
            else if (index == 'close_details') {
                close_details ='<div class="panel panel-default"><div class="panel-heading">Close Details</div><table class="table">';

                jQuery.each(item, function (key, value) {
                    jQuery.each(value, function (key, value) {
                        if (key != 'id' && value != '' && value != '[object Object]') {
                            var level = key.replace('_', ' ');
                            close_details = close_details + '<tr><td>' + level.charAt(0).toUpperCase() + level.substring(1) + '</td><td> ' + value + '</td></tr>';
                        }
                    });
                });

                close_details = close_details + '</table></div>';
            }
            else {
                if (page == "ap") {
                    if (index != 'ticket' && index != 'id' && item != '' && item != '[object Object]') {
                        var level = index.charAt(0).toUpperCase() + index.substring(1);
                        text = text + '<tr><td>' + level.replace('_', ' ') + "</td><td>" + item + '</td>';
                    }
                    if(index == 'tickets'){
                        jQuery.each(item, function (key, value) {
                            if (key != 'close_details' && key != 'id' && value != '' && value != '[object Object]') {
                                var level = key.replace('_', ' ');
                                ticket_detail = ticket_detail + '<tr><td>' + level.charAt(0).toUpperCase() + level.substring(1) + '</td><td> ' + value + '</td></tr>';

                            }
                        });
                    }
                } else {
                    if (index != 'id' && item != '' && item != '[object Object]') {
                        var level = index.charAt(0).toUpperCase() + index.substring(1);
                        text = text + '<tr><td>' + level.replace('_', ' ') + "</td><td>" + item + '</td>';
                    }
                }
            }

        });

        if (page == "ap") {
            get_parts(company);get_locations(company);
            var ticketId = results['ticket'];
            var apId = results['id'];
            var apName = results['name'];
            var ticketNumber = results['tickets']['ticket_number'];
            if(results['work_window_start']){
                var wWindow = results['work_window_start'];
            }else{
                var wWindow = new Date().toJSON().slice(0,10);
            }

            add =  add + ticket_detail;
            add = add + '<tr><td colspan="2" class="add_report" onclick=get_report_form(' + apId + ',' + ticketId + ',"' + apName + '","' + ticketNumber + '","'+wWindow+'","'+company+'")>' +
                '<a href="javascript:void(0)" class="fa fa-plus" )>&nbsp;Add Report</a>' +
                '</td></tr>';
        }
        text = text +add + "</table>"+ machine + ap +close_details ;
        $('#ticket-list-view').hide();
        $("#reportForm").hide();
        $('#detail_page').show();
        $('#detail_page').html(text);
        hide_ajax_loader();

};
var getFormObject = function(form) {
    var disabled = form.find(':input:disabled').removeAttr('disabled');
    var serialized = form.serializeArray();
    disabled.attr('disabled','disabled');
    return serialized;
}

submit_fe_report =function(ap){
    var form=$("#FEForm");
    display_ajax_loader();
    if (!navigator.onLine) {
        event.preventDefault();
        var formObject = getFormObject(form, ap);
        var offorms = JSON.stringify(formObject);
        if (!localStorage.getItem("offorms")) {
            localStorage.setItem("offorms", "{}");
        }
        var list = JSON.parse(localStorage.getItem("offorms"));
        list[ap] = offorms;
        localStorage.setItem("offorms", JSON.stringify(list));
        hide_ajax_loader();
        $.hyc.ui.alert('Action Plan closed Offline.', function () {
            get_open_ap(ap);

        });
    } else{
        push_fe_report_to_server(form);
    }


}

push_fe_report_to_server =function (form){
    //var postData = form.serializeArray();
    var disabled = form.find(':input:disabled').removeAttr('disabled');
    var serialized = form.serializeArray();
    disabled.attr('disabled','disabled');
    var formURL = HOST+"/web/api/reports/creates.json";
    $.ajax({
        beforeSend:function (request) {
            request.setRequestHeader("Authorization", 'Authorization profile="UsernameToken"');
            request.setRequestHeader("X-WSSE", token );
        },
        type:"POST",
        url:formURL,
        crossDomain:true,
        dataType:"json",
        data: serialized,
        success:function (data) {
            hide_ajax_loader();
            if(data['status']=="success"){
                $.hyc.ui.alert('Action Plan closed successfully.', function () {
                    get_open_ap();
                });
            }
        }
    });
}
display_ajax_loader = function () {
    $('#overlay').show();
    $("#loader").show();
};
hide_ajax_loader = function () {
    $('#overlay').hide();
    $("#loader").hide();
};
successDialog = function(msg, callback) {
    get_open_ap();
}
get_report_form = function (apId, ticketId, apName, ticketNumber,wWindow,company) {
        $("#reportForm").show();
        $('#ticket-list-view').hide();
        $('#detail_page').hide();
        $("#ticket-disabled").val(ticketNumber);
        $("#ap-disabled").val(apName);
        $("#ww-disabled").val(wWindow);
        $("#ap-id").val(apId);
        $("#ticket-id").val(ticketId);
        $("#company").val(company);
       $('#hr').spinner({value:0, step: 1, min: 0, max: 23});
       $('#minutes').spinner({value:0, step: 5, min: 0, max: 55});
        // Locations list from storage
        var locations = jQuery.parseJSON(localStorage.getItem(company+"_locations"));
        var location_options = '<option>Location</option>';
        jQuery.each(locations, function (index, item) {
            location_options = location_options + ' <option value="' + item.id + '">' + item.name + '</option>';
        });
        $('#locations').html('<select id="location" name="location[0]" class="form-control">' +
            location_options +
            '</select>' +
            '<div id="keyOpen" style="background-color: blue;"></div>' +
            '<div id="keyClose"></div>');

        var parts = jQuery.parseJSON(localStorage.getItem(company+"_parts"));
        var parts_options = '<option>Part</option>';
        jQuery.each(parts, function (index, item) {
            parts_options = parts_options + ' <option value="' + item.id + '">' + item.part_number + '</option>';
        });
        $('#parts').html('<select id="part" name="part[0]" class="form-control">' +
            parts_options +
            '</select>' +
            '<div id="keyOpen" style="background-color: blue;"></div>' +
            '<div id="keyClose"></div>');
        //$("#part").selectmenu();



};
logout = function () {
    display_ajax_loader();
    localStorage.removeItem('token');
    localStorage.removeItem('offorms');
    $("#tickets").addClass('hide');
    $("#page1").removeClass('hide');
    hide_ajax_loader();
};
get_parts = function (company) {
    if(localStorage.getItem(company+'_parts') != "") {
        parts_from_server(company);
    }
};
get_locations = function (company) {
    if(localStorage.getItem(company+'_locations') !="") {
            location_from_server(company);
    }
};
parts_from_server = function(company){
    $.ajax({
        type: "GET",
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", 'Authorization profile="UsernameToken"');
            request.setRequestHeader("X-WSSE", localStorage.token);
        },
        url: HOST + "/web/api/parts/ibr/index.json",
        processData: false,
        success: function (data) {
            localStorage.setItem(company + '_parts', JSON.stringify(data));
        },
        error: function () {

        }
    });
}
location_from_server =function(company){
    $.ajax({
        type: "GET",
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", 'Authorization profile="UsernameToken"');
            request.setRequestHeader("X-WSSE", localStorage.token);
        },
        url: HOST + "/web/api/locations/ibr/index.json",
        processData: false,
        success: function (data) {
            localStorage.setItem(company + '_locations', JSON.stringify(data));
        },
        error: function () {

        }
    });
}
var appMaster = {

    preLoader: function(){
        imageSources = [] ;
        $('img').each(function() {
            var sources = $(this).attr('src');
            imageSources.push(sources);
        });
        if($(imageSources).load()){
            $('.pre-loader').fadeOut('slow');
        }
    }

}; // AppMaster



