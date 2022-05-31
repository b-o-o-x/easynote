
var show_response_message = false; // alert show
var easynote_root = '';
var easynote_system_date = '';
var easynote_list_loading = false; // list loading..
var easynote_list_scroll_page = 1;
var easynote_list_search_word = '';

function easynote_set_root(root) {
  easynote_root = root;
}
function easynote_set_system_date(d) {
  easynote_system_date = d;
}

// easynote api : system
{
  // login for welcome.html, login.html only
  function easynote_api_login() {
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
      cache: false,
      timeout: 3000,
      data: {
        'user_id': user_id_obj.val(),
        'user_pw': user_pw_obj.val(),
      },
      success: function (response) {
        var result = response['result']
        var success = result['success']
        var message = result['message']
        var row = result['row']

        if (success) {
          if (show_response_message) alert(message)
          ret = true;
        }
        else {
          alert(message)
        }
      }
    })

    return ret;
  }

  // login check
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
        var result = response['result']
        var success = result['success']
        var message = result['message']
        var row = result['row']

        ret = success;

        if (success == true) {
          if (show_response_message) alert(message)
        }
        else {
          alert(message)
        }
      },
      error: function() {
        ret = false;
      }
    })

    return ret;
  }

  // admin check
  function easynote_api_is_admin() {
    var ret = false;

    $.ajax({
      url: easynote_root + "/isadmin",
      type: "POST",
      async: false,
      cache: false,
      timeout: 3000,
      data: { },
      success: function (response) {
        var result = response['result']
        var success = result['success']
        var message = result['message']
        var row = result['row']

        ret = success;

        if (success == true) {
          if (show_response_message) alert(message)
        }
        else {
          //alert(message)
        }
      },
      error: function() {
        ret = false;
      }
    })

    return ret;
  }

  // manager check
  function easynote_api_is_manager() {
    var ret = false;

    $.ajax({
      url: easynote_root + "/ismanager",
      type: "POST",
      async: false,
      cache: false,
      timeout: 3000,
      data: { },
      success: function (response) {
        var result = response['result']
        var success = result['success']
        var message = result['message']
        var row = result['row']

        ret = success;

        if (success == true) {
          if (show_response_message) alert(message)
        }
        else {
          //alert(message)
        }
      },
      error: function() {
        ret = false;
      }
    })

    return ret;
  }

  // check readable
  function easynote_api_is_readable() {
    var ret = false;

    $.ajax({
      url: easynote_root + "/isreadable",
      type: "POST",
      async: false,
      cache: false,
      timeout: 3000,
      data: { },
      success: function (response) {
        var result = response['result']
        var success = result['success']
        var message = result['message']
        var row = result['row']

        ret = success;

        if (success == true) {
          if (show_response_message) alert(message)
        }
        else {
          //alert(message)
        }
      },
      error: function() {
        ret = false;
      }
    })

    return ret;
  }

  // check writable
  function easynote_api_is_writable(num) {
    var ret = false;

    $.ajax({
      url: easynote_root + "/iswritable",
      type: "POST",
      async: false,
      cache: false,
      timeout: 3000,
      data: { 'num' : num },
      success: function (response) {
        var result = response['result']
        var success = result['success']
        var message = result['message']
        var row = result['row']

        ret = success;

        if (success == true) {
          if (show_response_message) alert(message)
        }
        else {
          //alert(message)
        }
      },
      error: function() {
        ret = false;
      }
    })

    return ret;
  }

  // logout
  function easynote_api_logout() {
    $.ajax({
      type: "POST",
      url: easynote_root + "/logout",
      data: {},
      success: function (response) {
        var result = response['result']
        var success = result['success']
        var message = result['message']
        var row = result['row']

        if (success) {
          if (show_response_message) alert(message)
          easynote_page_root(false);
        }
        else {
          alert(message)
        }
      }
    })
  }

  // create easynote for welcome.html only
  function easynote_api_create_easynote() {
    var ret = false;
    $.ajax({
      url: easynote_root + "/create?collection=easynote",
      type: "POST",
      async: false,
      cache: false,
      timeout: 3000,
      data: { },
      success: function (response) {
        var result = response['result']
        var success = result['success']
        var message = result['message']
        var row = result['row']

        ret = success;

        if (success) {
          if (show_response_message) alert(message)
          $(".next").click();
        }
        else {
          alert(message)
        }
      }
    })

    return ret;
  }

  // create easynote.member for welcome.html only
  function easynote_api_create_easynote_member() {
    var ret = false;

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
      url: easynote_root + "/create?collection=easynote.member",
      type: "POST",
      async: false,
      cache: false,
      timeout: 3000,
      data: {
        'admin_id': admin_id_obj.val(),
        'admin_pw': admin_pw_obj.val(),
      },
      success: function (response) {
        var result = response['result']
        var success = result['success']
        var message = result['message']
        var row = result['row']

        ret = success;

        if (success) {
          if (show_response_message) alert(message)
          $(".next").click();
        }
        else {
          alert(message)
        }
      }
    })

    return ret;
  }

  // drop easynote and easynote.member (permission check)
  function easynote_api_drop_easynotes() {
    var ret = false;
    $.ajax({
      url: easynote_root + "/drop",
      type: "POST",
      async: false,
      cache: false,
      timeout: 3000,
      data: { },
      success: function (response) {
        var result = response['result']
        var success = result['success']
        var message = result['message']
        var row = result['row']

        ret = success

        if (success) {
          if (show_response_message) alert(message)
        }
        else {
          alert(message)
        }
      }
    })

    return ret;
  }
}

// easynote api : note
{
  // read note
  function easynote_api_note_read(num) {
    var ret = null

    var name_obj = $('#name');
    var note_obj = $('#note');
    
    // read api
    $.ajax({
        type: "POST",
        url: easynote_root + "/read",
        async: false,
        cache: false,
        timeout: 3000,
        data: { 'num':num },
        success: function (response) {
          var result = response['result']
          var success = result['success']
          var message = result['message']
          var row = result['row']

          if (show_response_message) alert(message)

          ret = row;

          if (success) {
            if (show_response_message) alert(message)

            // sample
            if (1 <= row.length) {
              var num_link = row[0]['num_link']
              var num = row[0]['num']
              var name = row[0]['name']
              var note = row[0]['note']
              var user_id = row[0]['user_id']
              var date = row[0]['date']
            }
          }
          else {
            alert(message)
          }
        }
    })

    return ret;
  }

  // save note for write.html only
  function easynote_api_note_save(num) {
    var name_obj = $('#name');
    var note_obj = $('#note');

    if (!name_obj.val())
    {
      name_obj.focus();
      return;
    }
    else if (!note_obj.val())
    {
      note_obj.focus();
      return;
    }

    var ajax_type = 'POST'; // save new
    if (num != null && 0 <= num) ajax_type = 'PUT'; // edit

    $.ajax({
      type: ajax_type,
      url: easynote_root + "/write",
      data: {
        'num': num,
        'name': name_obj.val(),
        'note': note_obj.val(),
      },
      success: function (response) {
        var result = response['result']
        var success = result['success']
        var message = result['message']
        var row = result['row']

        if (success) {
          if (show_response_message) alert(message)
          let num = row[0]['num']
          easynote_page_read(num)
        }
        else {
          alert(message)
        }
      }
    })
  }

  // cancel save for write.html only
  function easynote_api_note_save_cancel(num) {
    var name_obj = $('#name');
    var note_obj = $('#note');

    var confirmflag = true;
    if (name_obj.val() || note_obj.val()) {
      confirmflag = confirm('There is an note being written. Do you really want to go out?');
    }

    if (confirmflag == true) {
      if (num != null && 0 <= num) {
        easynote_page_read(num)
      }
      else {
        easynote_page_root()
      }
    }
  }

  // delete note for write.html only
  function easynote_api_note_delete(num) {
    // delete
    $.ajax({
      type: "DELETE",
      url: easynote_root + "/write",
      data: {
        'num': num,
      },
      success: function (response) {
        var result = response['result']
        var success = result['success']
        var message = result['message']
        var row = result['row']

        if (success == true) {
          if (show_response_message) alert(message)
          easynote_page_root(false)
        }
        else {
          alert(message)
        }
      }
    })
  }

  // list.html 전용.
  function easynote_api_note_list(page, search_word = '') {
    var ret_next_page = page;
    // list api
    if (!easynote_list_loading) {
      easynote_list_loading = true;
      $.ajax({
          url: easynote_root + "/list",
          type: "POST",
          async: false,
          cache: false,
          timeout: 3000,
          data: {
            'page': page,
            'search_word': search_word,
          },
          success: function (response) {
            var result = response["result"]
            var success = result['success']
            var message = result['message']
            var row = result['row']

            if (success == true) {
              for (let i = 0; i < row.length; i++) {
                let num = row[i]['num']
                let name = row[i]['name']
                let note = row[i]['note']
                let user_id = row[i]['user_id']
                let date = row[i]['date']

                var notelist = note.split("\n");
                var display_note = '';
                for(var j = 0; j < notelist.length && j < 3; j++) { // 3줄만 표시
                  display_note += notelist[j] + "<br>";
                }

                // display time
                var sysdate = new Date(easynote_system_date);
                var display_date = getYYYYMMDD_HHIISS(new Date(date));
                var day_gap = calcDateDiff('day', sysdate, new Date(date));
                var display_date_gap = (day_gap <= 1) ? day_gap + ' day ago' : day_gap + ' days ago';
                if (day_gap <= 0) { display_date_gap = display_date; }

                let temp_html = `<a onclick="easynote_page_read(${num})" class="list-group-item list-group-item-action" aria-current="true">
                                  <div class="d-flex w-100 justify-content-between">
                                    <small class="mb-num">#${num}</small>
                                    <h5 class="mb-title">${name}</h5>
                                    <small class="mb-date">${display_date_gap}</small>
                                  </div>
                                  <p class="mb-note">${display_note}</p>
                                  <small>..더보기..</small><small>${user_id}</small>
                                </a>`
                $('.list-group').append(temp_html)
              }

              ret_next_page += 1;
            }
            else {
              //alert(message);
            }

            easynote_list_loading = false;
          }
      })
    }

    return ret_next_page;
  }

  // admin member list
  function easynote_api_admin_member_list(page, search_word = '') {
    var ret_next_page = page;
    // member list api
    if (!easynote_list_loading) {
      easynote_list_loading = true;
      $.ajax({
          url: easynote_root + "/admin/member/list",
          type: "POST",
          async: false,
          cache: false,
          timeout: 3000,
          data: {
            'page': page,
            'search_word': search_word,
          },
          success: function (response) {
            var result = response["result"]
            var success = result['success']
            var message = result['message']
            var row = result['row']

            if (success == true) {
              for (let i = 0; i < row.length; i++) {
                let num = row[i]['num']
                let name = row[i]['name']
                let note = row[i]['note']
                let user_id = row[i]['user_id']
                let date = row[i]['date']

                var display_note = note;

                // display time
                var sysdate = new Date(easynote_system_date);
                var display_date = getYYYYMMDD_HHIISS(new Date(date));
                var day_gap = calcDateDiff('day', sysdate, new Date(date));
                var display_date_gap = (day_gap <= 1) ? day_gap + ' day ago' : day_gap + ' days ago';
                if (day_gap <= 0) { display_date_gap = display_date; }

                let temp_html = `<a onclick="easynote_page_admin_member_read(${num})" class="list-group-item list-group-item-action" aria-current="true">
                                  <div class="d-flex w-100 justify-content-between">
                                    <small class="mb-num">#${num}</small>
                                    <h5 class="mb-title">${name}</h5>
                                    <small class="mb-date">${display_date_gap}</small>
                                  </div>
                                  <p class="mb-note">${display_note}</p>
                                  <small>${user_id}</small>
                                </a>`
                $('.list-group').append(temp_html)
              }

              ret_next_page += 1;
            }
            else {
              //alert(message);
            }

            easynote_list_loading = false;
          }
      })
    }

    return ret_next_page;
  }

  // admin read member
  function easynote_api_admin_member_read(num) {
    var ret = null

    // read api
    $.ajax({
        type: "POST",
        url: easynote_root + "/admin/member/read",
        async: false,
        cache: false,
        timeout: 3000,
        data: { 'num':num },
        success: function (response) {
          var result = response['result']
          var success = result['success']
          var message = result['message']
          var row = result['row']

          if (show_response_message) alert(message)

          ret = row;

          if (success) {
            if (show_response_message) alert(message)

            // sample
            if (1 <= row.length) {
              var num_link = row[0]['num_link']
              var num = row[0]['num']
              var name = row[0]['name']
              var note = row[0]['note']
              var user_id = row[0]['user_id']
              var date = row[0]['date']
            }
          }
          else {
            alert(message)
          }
        }
    })

    return ret;
  }

  // admin save member
  function easynote_api_admin_member_save(num) {
    var name_obj = $('#name');
    var note_obj = $('#note');
    var user_id_obj = $('#user_id');
    var user_pw_obj = $('#user_pw');

    if (!name_obj.val())
    {
      name_obj.focus();
      return;
    }
    else if (!note_obj.val())
    {
      note_obj.focus();
      return;
    }
    else if (!user_id_obj.val())
    {
      user_id_obj.focus();
      return;
    }
    else if (num == null && !user_pw_obj.val())
    {
      user_pw_obj.focus();
      return;
    }

    var ajax_type = 'POST'; // save new
    if (num != null && 0 <= num) ajax_type = 'PUT'; // edit

    $.ajax({
      type: ajax_type,
      url: easynote_root + "/admin/member/write",
      data: {
        'num': num,
        'name': name_obj.val(),
        'note': note_obj.val(),
        'user_id': user_id_obj.val(),
        'user_pw': user_pw_obj.val(),
      },
      success: function (response) {
        var result = response['result']
        var success = result['success']
        var message = result['message']
        var row = result['row']

        if (success) {
          if (show_response_message) alert(message)
          let num = row[0]['num']
          easynote_page_admin_member_read(num)
        }
        else {
          alert(message)
        }
      }
    })
  }

  // admin cancel save member
  function easynote_api_admin_member_save_cancel(num) {
    var name_obj = $('#name');
    var note_obj = $('#note');

    var confirmflag = true;
    if (name_obj.val() || note_obj.val()) {
      confirmflag = confirm('There is an member being written. Do you really want to go out?');
    }

    if (confirmflag == true) {
      if (num != null && 0 <= num) {
        easynote_page_admin_member_read(num)
      }
      else {
        easynote_page_admin()
      }
    }
  }

  // admin delete member
  function easynote_api_admin_member_delete(num) {
    // delete
    $.ajax({
      type: "DELETE",
      url: easynote_root + "/admin/member/write",
      data: {
        'num': num,
      },
      success: function (response) {
        var result = response['result']
        var success = result['success']
        var message = result['message']
        var row = result['row']

        if (success == true) {
          if (show_response_message) alert(message)
          easynote_page_admin(false)
        }
        else {
          alert(message)
        }
      }
    })
  }

}

// easynote page going
{
  function easynote_page(url, history = true) {
    if (!url) url = easynote_root;
    if (history == true)
      window.location.href = url
    else
      window.location.replace(url)
  }
  function easynote_page_root(history = true) {
    easynote_page(easynote_root, history)
  }
  function easynote_page_login(history = true) {
    easynote_page(easynote_root + '/login', history)
  }
  function easynote_page_list(history = true) {
    easynote_page(easynote_root, history)
  }
  function easynote_page_write() {
    easynote_page(easynote_root + '/write')
  }
  function easynote_page_edit(num) {
    easynote_page(easynote_root + '/write/' + num)
  }
  function easynote_page_read(num) {
    easynote_page(easynote_root + '/read/' + num)
  }

  function easynote_page_admin(history = true) {
    easynote_page(easynote_root + '/admin', history)
  }
  function easynote_page_admin_member_list(history = true) {
    easynote_page(easynote_root + '/admin', history)
  }
  function easynote_page_admin_member_write() {
    easynote_page(easynote_root + '/admin/member/write')
  }
  function easynote_page_admin_member_edit(num) {
    easynote_page(easynote_root + '/admin/member/write/' + num)
  }
  function easynote_page_admin_member_read(num) {
    easynote_page(easynote_root + '/admin/member/read/' + num)
  }
}



// util functions
{
  // 사용예제) setCookie("key", "value", 1); // 1 day
  var setCookie = function(name, value, exp) {
    var date = new Date();
    date.setTime(date.getTime() + exp*24*60*60*1000);
    document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
  };
  var getCookie = function(name) {
    var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value? value[2] : null;
  };
  var deleteCookie = function(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;';
  }
  
  function getYYYYMMDD(date) {
    // return "yyyy-mm-dd"
    var d = new Date();
    if (date) d = date;
    return d.getFullYear() + "-" + ((d.getMonth() + 1) > 9 ? (d.getMonth() + 1).toString() : "0" + (d.getMonth() + 1)) + "-" + (d.getDate() > 9 ? d.getDate().toString() : "0" + d.getDate().toString());
  }
  function getYYYYMMDD_HHIISS(date) {
    // return "yyyy-mm-dd"
    var d = new Date();
    if (date) d = date;
    return d.getFullYear() + "-" + ((d.getMonth() + 1) > 9 ? (d.getMonth() + 1).toString() : "0" + (d.getMonth() + 1)) + "-" + (d.getDate() > 9 ? d.getDate().toString() : "0" + d.getDate().toString()) + " " +
          (d.getHours() > 9 ? d.getHours().toString() : "0" + d.getHours().toString()) + ":" + (d.getMinutes() > 9 ? d.getMinutes().toString() : "0" + d.getMinutes().toString()) + ":" + (d.getSeconds() > 9 ? d.getSeconds().toString() : "0" + d.getSeconds().toString());
  }
  function getFullYmdStr(date){
    // retrn "yyyy년 mm월 dd일 hh시 ii분 ss초 fff요일"
    var d = new Date();
    if (date) d = date;            
    return d.getFullYear() + "년 " + (d.getMonth()+1) + "월 " + d.getDate() + "일 " + d.getHours() + "시 " + d.getMinutes() + "분 " + d.getSeconds() + "초 " +  '일월화수목금토'.charAt(d.getUTCDay())+'요일';
  }
  function calcDateDiff(type, date1, date2){
  //두 날짜 사이의 간격을 type 으로 계산해 출력
    let ret = Math.abs(date1 - date2);
    switch(type){
        case 'day':
            ret /= 24;
        case 'hour':
            ret /= 60;
        case 'min':
            ret /= 60;
        case 'sec':
            ret /= 1000;
    }
    return Math.round(ret);
  }
}