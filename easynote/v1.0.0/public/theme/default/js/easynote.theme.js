var show_list_note_moreless = true; // false : main note 3 lines show and click to read page
var show_list_note_moreless_height = 65;
var use_tinymce = true;

// easynote theme
{
  // login for welcome.html, login.html only
  function easynote_theme_login() {
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

    ret = easynote_api_login(user_id_obj.val(), user_pw_obj.val());

    return ret;
  }

  // create easynote.member admin for welcome.html only
  function easynote_theme_create_easynote_admin() {
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

    ret = easynote_api_create_easynote_admin(admin_id_obj.val(), admin_pw_obj.val());

    return ret;
  }
}

// easynote api : note
{
  // save note for write.html only
  function easynote_theme_note_save(num) {
    var name_obj = $('#name');
    var note_val = null;

    if (use_tinymce && num != 0) {
      note_val = tinymce.get('note').getContent();
    }
    else {
      note_val = $('#note').val(); // textarea
    }

    if (!name_obj.val())
    {
      name_obj.focus();
      return;
    }
    else if (use_tinymce && !note_val && num != 0) // tinymce
    {
      tinymce.execCommand('mceFocus', false, 'note');
      return;
    }
    else if (!use_tinymce && !note_val) // textarea
    {
      $('#note').focus();
      return;
    }

    easynote_api_note_save(num, name_obj.val(), note_val);
  }

  // cancel save for write.html only
  function easynote_theme_note_save_cancel(num) {
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

  // toggle note of list
  function easynote_toggle_note(num) {
    var note_obj = "#mb-note-" + num;
    var moreless_obj = "#moreless-" + num;
    if ($(note_obj).height() <= show_list_note_moreless_height) {
      $(note_obj).css("height", "100%");
      $(note_obj).css("overflow", "visible");
      $(moreless_obj).text("▲ less")
    }
    else {
      $(note_obj).css("height", show_list_note_moreless_height);
      $(note_obj).css("overflow", "hidden");
      $(moreless_obj).text("▼ more")
    }
  }

  // list.html 전용.
  function easynote_theme_note_list(page, search_word = '') {
    var ret_next_page = page;
    
    var response = easynote_api_note_list(page, search_word);

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

        // display time
        var sysdate = new Date(easynote_system_date);
        var display_date = getYYYYMMDD_HHIISS(new Date(date));
        var day_gap = calcDateDiff('day', sysdate, new Date(date));
        var display_date_gap = (day_gap <= 1) ? day_gap + ' day ago' : day_gap + ' days ago';
        if (day_gap <= 0) { display_date_gap = display_date; }

        if (show_list_note_moreless) {
          display_note = note;

          let temp_html = `<a onclick="easynote_page_read(${num})" class="list-group-item list-group-item-action" aria-current="true">
                            <div class="d-flex w-100 justify-content-between">
                              <small class="mb-num">#${num}</small>
                              <h5 class="mb-title">${name}</h5>
                              <small class="mb-date">${display_date_gap}</small>
                            </div>
                            <pre class="mb-note" id="mb-note-${num}">${display_note}</pre>
                          </a>
                          <div class="d-flex w-100 justify-content-between">
                            <small class="moreless" onclick="easynote_toggle_note(${num})" id="moreless-${num}">▼ more</small>
                            <small class="mb-date">${user_id}</small>
                          </div><br>`
          $('.list-group').append(temp_html)
          $('#mb-note-' + num).css("height", show_list_note_moreless_height);
          $('#mb-note-' + num).css("overflow", "hidden");
        }
        else {
          // note 3 lines
          var notelist = note.split("\n");
          var display_note = '';
          for(var j = 0; j < notelist.length && j < 3; j++) { // 3줄만 표시
            display_note += notelist[j] + "<br>";
          }

          let temp_html = `<a onclick="easynote_page_read(${num})" class="list-group-item list-group-item-action" aria-current="true">
                            <div class="d-flex w-100 justify-content-between">
                              <small class="mb-num">#${num}</small>
                              <h5 class="mb-title">${name}</h5>
                              <small class="mb-date">${display_date_gap}</small>
                            </div>
                            <p class="mb-note">${display_note}</p>
                            <div class="d-flex w-100 justify-content-between">
                              <small>click to read more ..</small>
                              <small class="mb-date">${user_id}</small>
                            </div>
                          </a>`
          $('.list-group').append(temp_html)
        }
      }

      ret_next_page += 1;
    }

    return ret_next_page;
  }

  // admin member list
  function easynote_theme_admin_member_list(page, search_word = '') {
    var ret_next_page = page;

    var response = easynote_api_admin_member_list(page, search_word);

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
                          <div class="d-flex w-100 justify-content-between">
                            <small></small>
                            <small class="mb-date">${user_id}</small>
                          </div>
                        </a>`
        $('.list-group').append(temp_html)
      }

      ret_next_page += 1;
    }

    return ret_next_page;
  }

  // admin save member
  function easynote_theme_admin_member_save(num) {
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

    easynote_api_admin_member_save(num, name_obj.val(), note_obj.val(), user_id_obj.val(), user_pw_obj.val());
  }

  // admin cancel save member
  function easynote_theme_admin_member_save_cancel(num) {
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

}
