
var show_response_message = true;
var easynote_root = '';

function easynote_set_root(root) {
  easynote_root = root;
}

function easynote_api_try_login() {
  var ret = false;

  var user_id_obj = $('#user_id');
  var user_pw_obj = $('#user_pw');

  if (!user_id_obj.val())
  {
    user_id_obj.focus();
    return;
  }
  else if (!user_pw_obj.val())
  {
    user_pw_obj.focus();
    return;
  }

  $.ajax({
    url: easynote_root + "/login",
    type: "POST",
    async: false,
    data: {
      'user_id': user_id_obj.val(),
      'user_pw': user_pw_obj.val(),
    },
    success: function (response) {
      var result = response['result'];
      var success = result['success'];
      var message = result['message'];
      var row = result['row'];

      if (show_response_message) alert(message);

      if (success) {
        ret = true;
      }
      else {
      }
    }
  })

  return ret;
}

function easynote_api_logout() {
  $.ajax({
    type: "POST",
    url: easynote_root + "/logout",
    data: {},
    success: function (response) {
      var result = response['result'];
      var success = result['success'];
      var message = result['message'];
      var row = result['row'];

      if (show_response_message) alert(message);

      if (success) {
        easynote_page_root(false);
      }
      else {
      }
    }
  })
}

function easynote_api_is_login() {
  var ret = false;

  $.ajax({
    url: easynote_root + "/islogin",
    type: "POST",
    async: false,
    cache: false,
    timeout: 3000,
    data: { },
    success: function (response) {
      var result = response["result"];
      var success = result['success'];
      var message = result['message'];
      var row = result['row'];

      if (show_response_message) alert(message);
      
      ret = success;
    },
    error: function() {
      ret = false;
    }
  })

  return ret;
}

// for welcome.html only
function easynote_api_create_easynote() {
  $.ajax({
    type: "POST",
    url: easynote_root + "/create?collection=easynote",
    data: { },
    success: function (response) {
      var result = response["result"];
      var success = result['success'];
      var message = result['message'];
      var row = result['row'];

      if (show_response_message) alert(message);

      if (success) {
        $(".next").click();
      }
      else {
      }
    }
  })
}
// for welcome.html only
function easynote_api_create_easynote_member() {
  var admin_id_obj = $('#admin_id');
  var admin_pw_obj = $('#admin_pw');
  var admin_cpw_obj = $('#admin_cpw');
  
  if (!admin_id_obj.val())
  {
    admin_id_obj.focus();
    return;
  }
  else if (!admin_pw_obj.val())
  {
    admin_pw_obj.focus();
    return;
  }
  else if (!admin_cpw_obj.val())
  {
    admin_cpw_obj.focus();
    return;
  }
  else if (!admin_pw_obj.val() || (admin_pw_obj.val() != admin_cpw_obj.val())) {
    alert('Password is different.')
    admin_pw_obj.val('');
    admin_cpw_obj.val('');
    admin_pw_obj.focus();
    return;
  }

  $.ajax({
    type: "POST",
    url: easynote_root + "/create?collection=easynote.member",
    data: {
      'admin_id': admin_id_obj.val(),
      'admin_pw': admin_pw_obj.val(),
    },
    success: function (response) {
      var success = response['result']['success'];
      var message = response['result']['message'];

      if (show_response_message) alert(message);

      if (success) {
        $(".next").click();
      }
      else {
      }
    }
  })
}

function easynote_api_drop_easynotes() {
  $.ajax({
    type: "POST",
    url: window.location + "/drop",
    data: { },
    success: function (response) {
      var success = response['result']['success'];
      var message = response['result']['message'];

      if (show_response_message) alert(message);

      if (success) {
      }
      else {
      }
    }
  })
}



function easynote_page(url, history) {
  if (history == true)
    window.location.href = url;
  else
    window.location.replace(url);
}
function easynote_page_root(history = true) {
  easynote_page(easynote_root, history);
}
function easynote_page_admin(history = true) {
  easynote_page(easynote_root + '/admin', history);
}